const crypto = require("crypto");
const fs = require("fs");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question("Enter password to encrypt .env: ", (password) => {
  try {
    if (!fs.existsSync(".env")) {
      console.error("❌ .env file not found!");
      process.exit(1);
    }

    const data = fs.readFileSync(".env", "utf8");
    const salt = crypto.randomBytes(16);

    // derive 32-byte key
    const key = crypto.scryptSync(password, salt, 32);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(data, "utf8", "hex");
    encrypted += cipher.final("hex");

    // store salt + iv + data
    const payload = {
      salt: salt.toString("hex"),
      iv: iv.toString("hex"),
      data: encrypted
    };

    fs.writeFileSync(".env.enc", JSON.stringify(payload));
    console.log("✅ .env encrypted to .env.enc successfully!");
  } catch (error) {
    console.error("❌ Encryption failed:", error.message);
  } finally {
    rl.close();
  }
});


// netstat -ano | findstr :5000
// taskkill /PID 8288 /f
// Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess -Force
//for /f "tokens=5" %a in ('netstat -ano ^| findstr :5000') do taskkill /PID %a /F
