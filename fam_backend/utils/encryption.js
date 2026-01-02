const crypto = require("crypto");

// Derive a key from the JWT_SECRET or a fallback. 
// Ideally this should be a separate stable secret.
// Since we don't have easy access to modify .env.enc, we derive from JWT_SECRET which is loaded in env.
// Note: process.env.JWT_SECRET must be available when this is called.
// We'll use a lazy getter or just call function.

const getAlgorithm = () => "aes-256-cbc";

// Cache the key to avoid expensive scryptSync on every call
let cachedKey = null;

const getKey = () => {
    if (cachedKey) return cachedKey;
    const secret = process.env.JWT_SECRET || "fallback_secret_do_not_use_in_prod";
    // Create a 32-byte key
    cachedKey = crypto.scryptSync(secret, "salt", 32);
    return cachedKey;
};

const encrypt = (text) => {
    if (!text) return text;
    // If it's already a date object, convert to string
    if (text instanceof Date) text = text.toISOString();
    if (typeof text !== 'string') text = String(text);

    try {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(getAlgorithm(), getKey(), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        // Format: iv:encrypted_hex
        return iv.toString("hex") + ":" + encrypted.toString("hex");
    } catch (e) {
        console.error("Encryption failed", e);
        return text; // Fallback
    }
};

const decrypt = (text) => {
    if (!text) return text;
    if (typeof text !== 'string') return text;

    // basic check if it follows format iv:content
    // basic check if it follows format iv:content
    const parts = text.split(":");
    if (parts.length !== 2) return ""; // STRICT: Invalid format returned as empty

    try {
        const iv = Buffer.from(parts[0], "hex");
        const encryptedText = Buffer.from(parts[1], "hex");
        const decipher = crypto.createDecipheriv(getAlgorithm(), getKey(), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (e) {
        // Enforce strict: return empty on failure
        return "";
    }
};

// Deterministic Encryption for IDs (searchable)
// Uses a fixed IV derived from the key/secret to ensure same input = same output
const getDeterministicIV = () => {
    const secret = process.env.JWT_SECRET || "fallback_secret_do_not_use_in_prod";
    // Create a deterministic 16-byte IV from the absolute secret (not dependent on input)
    // Actually, for semantic security with deterministic property, we typically use just the block cipher or fixed IV.
    // We will use a hash of the secret as IV.
    const ivHash = crypto.createHash('sha256').update(secret).digest();
    return ivHash.subarray(0, 16);
};

const encryptDeterministic = (text) => {
    if (!text) return text;
    if (typeof text !== 'string') text = String(text);

    try {
        const iv = getDeterministicIV();
        const cipher = crypto.createCipheriv(getAlgorithm(), getKey(), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        // No need to store IV as it is fixed
        return "det:" + encrypted.toString("hex");
    } catch (e) {
        console.error("Det-Encryption failed", e);
        return text;
    }
};

const decryptDeterministic = (text) => {
    if (!text) return text;
    if (typeof text !== 'string') return text;

    const parts = text.split(":");
    if (parts[0] !== "det" || parts.length !== 2) return text; // Pass through if not our format (or strictly return ""?)
    // User requested "Secure in DB", but we might have legacy data during migration.
    // For now, if it doesn't match "det:", assume it's legacy or invalid?
    // Let's return text to allow migration script to read it, then save it encrypted.
    // Actually, for query/getters, if it's not encrypted, we return it as is.

    try {
        const encryptedText = Buffer.from(parts[1], "hex");
        const iv = getDeterministicIV();
        const decipher = crypto.createDecipheriv(getAlgorithm(), getKey(), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (e) {
        return text;
    }
};

const encryptID = (text) => {
    if (!text) return text;
    text = String(text);
    if (text.startsWith("det:")) return text;
    if (text.length <= 4) return encryptDeterministic(text);

    const prefix = text.slice(0, -4);
    const suffix = text.slice(-4);

    // Encrypt prefix
    const det = encryptDeterministic(prefix);
    if (!det.startsWith("det:")) return text; // failed

    const hex = det.split(":")[1];
    return `det:${hex}:${suffix}`;
};

const decryptID = (text) => {
    if (!text) return text;
    text = String(text);
    if (!text.startsWith("det:")) return text;

    const parts = text.split(":");
    // format: det:HEX:SUFFIX
    if (parts.length === 3) {
        const hex = parts[1];
        const suffix = parts[2];
        const encPrefix = `det:${hex}`;
        const prefix = decryptDeterministic(encPrefix);
        return prefix + suffix;
    }
    // Fallback format: det:HEX
    if (parts.length === 2) {
        return decryptDeterministic(text);
    }
    return text;
};

module.exports = { encrypt, decrypt, encryptDeterministic, decryptDeterministic, encryptID, decryptID };
