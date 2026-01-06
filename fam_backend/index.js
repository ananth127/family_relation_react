const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const crypto = require("crypto");
const fs = require("fs");
const readline = require("readline");

const app = express();

/* =======================
   CORS — ALLOW ALL ORIGINS
   ======================= */
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight requests
app.options("*", cors());

app.use(express.json());

/* =======================
   READ ENV & START SERVER
   ======================= */
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const startServer = () => {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = mongoose.connection;
  db.once("open", () => console.log("✅ MongoDB Connected"));

  /* ========= ROUTES ========= */
  const authRoutes = require("./routes/authRoutes");
  app.use("/api/auth", authRoutes);

  const familyTreeRoutes = require("./routes/familyTreeRoutes");
  app.use("/api/familyTree", familyTreeRoutes);

  const userRoutes = require("./routes/userRoutes");
  app.use("/api/users", userRoutes);

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () =>
    console.log(`🚀 Server running on port ${PORT}`)
  );
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

    decrypted.split("\n").forEach((line) => {
      if (!line) return;
      const idx = line.indexOf("=");
      if (idx !== -1) {
        process.env[line.slice(0, idx)] = line.slice(idx + 1);
      }
    });

    console.log("✅ Configuration loaded successfully.");
    startServer();
  } catch (error) {
    console.error(
      "❌ Failed to decrypt or load configuration. Wrong password?",
      error.message
    );
    process.exit(1);
  } finally {
    rl.close();
  }
});
