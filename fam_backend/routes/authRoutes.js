const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

const generateUniqueID = async () => {
  let id;
  let exists;
  do {
    id = Math.floor(1000000000000000 + Math.random() * 9000000000000000).toString();
    exists = await User.findOne({ id });
  } while (exists);
  return id;
};

// Signup Route
router.post("/signup", async (req, res) => {
  const { name, gender, password, address, dob, mobile_number } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ name });
  if (existingUser) return res.status(400).json({ message: "User already exists" });

  // Hash Password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create New User
  const newUser = new User({
    id: await generateUniqueID(),
    name,
    gender,
    password: hashedPassword,
    address,
    dob,
    mobile_number,
  });

  await newUser.save();
  res.status(201).json({ message: "User registered successfully" });
});

const { encryptID } = require("../utils/encryption");

// ... (other imports)

// ...

// Login Route
router.post("/login", async (req, res) => {
  // The frontend sends "identifier" which can be either ID or Name
  const { identifier, password } = req.body;

  let user;

  // 1. Try finding by ID (Exact Match)
  // We MUST encrypt the identifier to match the DB format `det:HEX:SUFFIX` if it's an ID
  const encryptedId = encryptID(identifier);
  user = await User.findOne({ id: encryptedId });

  // 2. If not found by ID, try exact Name match
  if (!user) {
    user = await User.findOne({ name: identifier });
  }

  // 3. Fallback: Case-insensitive Name search
  if (!user) {
    user = await User.findOne({ name: { $regex: new RegExp(`^${identifier}$`, "i") } });
  }

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }
  console.log("user found");
  // Verify Password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

  // Generate Token
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

  res.json({ token, userId: user.id });
});

module.exports = router;
