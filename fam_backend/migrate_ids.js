const mongoose = require("mongoose");
const fs = require("fs");
const crypto = require("crypto");
const readline = require("readline");
const { encryptID } = require("./utils/encryption");

const migrateIds = async () => {
    // Connect DB
    // Fetch All Users (Lean to avoid mongoose magic)
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log(`Found ${users.length} users to migrate IDs.`);

    let count = 0;
    for (const user of users) {
        let modified = false;
        const updates = {};

        // 1. Encrypt ID
        if (user.id && !user.id.startsWith("det:")) {
            const encId = encryptID(user.id);
            if (encId !== user.id) {
                updates.id = encId;
            }
        }

        // 2. Encrypt Relations
        if (user.father_id && !user.father_id.startsWith("det:")) {
            updates.father_id = encryptID(user.father_id);
        }
        if (user.mother_id && !user.mother_id.startsWith("det:")) {
            updates.mother_id = encryptID(user.mother_id);
        }
        if (user.marital_id && !user.marital_id.startsWith("det:")) {
            updates.marital_id = encryptID(user.marital_id);
        }

        // 3. Encrypt Children IDs
        if (user.CHILDRENS_ID && Array.isArray(user.CHILDRENS_ID)) {
            const newChildren = user.CHILDRENS_ID.map(cid => {
                if (!cid.startsWith("det:")) return encryptID(cid);
                return cid;
            });
            // check difference
            if (JSON.stringify(newChildren) !== JSON.stringify(user.CHILDRENS_ID)) {
                updates.CHILDRENS_ID = newChildren;
            }
        }

        if (Object.keys(updates).length > 0) {
            await mongoose.connection.db.collection('users').updateOne(
                { _id: user._id },
                { $set: updates }
            );
            count++;
            console.log(`Migrated User: ${user.name}`);
        }
    }

    console.log(`Migration Complete. Updated ${count} users.`);
    process.exit(0);
};


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

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
            if (line) {
                const idx = line.indexOf("=");
                if (idx !== -1) process.env[line.slice(0, idx)] = line.slice(idx + 1);
            }
        });

        console.log("Config loaded.");
        mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
            .then(() => migrateIds());

    } catch (error) {
        console.error("Error:", error.message);
        process.exit(1);
    }
});
