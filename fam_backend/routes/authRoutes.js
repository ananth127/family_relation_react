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

// Login Route
router.post("/login", async (req, res) => {
  const { id, password } = req.body;

  const user = await User.findOne({ id });
  if (!user) return res.status(400).json({ message: "User not found" });

  // Verify Password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

  // Generate Token
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

  res.json({ token, userId: user.id });
});

module.exports = router;
