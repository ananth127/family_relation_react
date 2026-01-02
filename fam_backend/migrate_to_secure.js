const mongoose = require("mongoose");
const fs = require("fs");
const crypto = require("crypto");
const readline = require("readline");
const User = require("./models/User");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const migrate = async () => {
    try {
        const users = await User.find({});
        console.log(`Found ${users.length} users to migrate.`);

        for (const user of users) {
            console.log(`Processing user: ${user.name} (${user.id})`);

            // The Model has { set: encrypt, get: decrypt }
            // Accessing user.field returns the PLAINTEXT (decrypted or raw)
            // Assigning user.field = value triggers encrypt and marks modified

            // We must check if values exist to avoid overwriting with null/undefined if that wasn't intended
            // though the encryption utils handle nulls gracefully.

            if (user.address) {
                const raw = user.address;
                user.address = raw; // Triggers setter -> encrypt
            }

            if (user.mobile_number) {
                const raw = user.mobile_number;
                user.mobile_number = raw;
            }

            if (user.dob) {
                const raw = user.dob;
                // encrypt util handles Date objects or strings
                user.dob = raw;
            }

            await user.save();
            console.log(`  > Encrypted and Saved.`);
        }

        console.log("✅ All users migrated successfully.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    }
};

rl.question("Enter password to decrypt .env.enc: ", (password) => {
    try {
        const payload = JSON.parse(fs.readFileSync(".env.enc", "utf8"));
        const salt = Buffer.from(payload.salt, "hex");
        const iv = Buffer.from(payload.iv, "hex");
        const encrypted = payload.data;

        const key = crypto.scryptSync(password, salt, 32);
        const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

        let decrypted = decipher.update(encrypted, "hex", "utf8");
        decrypted += decipher.final("utf8");

        decrypted.split("\n").forEach(line => {
            if (!line) return;
            const idx = line.indexOf("=");
            if (idx !== -1) {
                process.env[line.slice(0, idx)] = line.slice(idx + 1);
            }
        });

        console.log("Configuration loaded.");

        mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }).then(() => {
            console.log("MongoDB Connected.");
            migrate();
        });

    } catch (error) {
        console.error("❌ Failed to decrypt or load configuration.", error.message);
        process.exit(1);
    } finally {
        rl.close();
    }
});
