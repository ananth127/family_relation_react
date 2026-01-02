const mongoose = require("mongoose");
const User = require("./models/User");
const dotenv = require("dotenv");
const fs = require("fs");
const crypto = require("crypto");
require("path");

// Decrypt env like index.js
const algorithm = 'aes-256-cbc';
const password = 'anth123'; // Hardcoded for this check script

function decrypt(text) {
    try {
        const parts = text.split(':');
        const iv = Buffer.from(parts.shift(), 'hex');
        const encryptedText = Buffer.from(parts.join(':'), 'hex');
        const decipher = crypto.createDecipheriv(algorithm, crypto.createHash('sha256').update(password).digest(), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        return null;
    }
}

async function check() {
    if (fs.existsSync('.env.enc')) {
        const encryptedConfig = fs.readFileSync('.env.enc', 'utf8');
        const decryptedConfig = decrypt(encryptedConfig);
        if (decryptedConfig) {
            const envConfig = dotenv.parse(decryptedConfig);
            for (const k in envConfig) {
                process.env[k] = envConfig[k];
            }
        }
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");

    const users = await User.find({});
    console.log(`Found ${users.length} users.`);
    if (users.length > 0) {
        console.log("Sample User:", users[0]);
        console.log("Searching for this user by ID:", users[0].id);
        const found = await User.findOne({ id: users[0].id });
        console.log("Found by ID:", found ? "Yes" : "No");
    }

    mongoose.disconnect();
}

check();
