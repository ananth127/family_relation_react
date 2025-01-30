const express = require("express");
const User = require("../models/User");
const router = express.Router();

// Get User Profile
router.get("/:id", async (req, res) => {
  const user = await User.findOne({ id: req.params.id });
  if (!user) return res.status(404).json({ message: "User not found" });

  res.json(user);
});

// Update Relationships
router.post("/update/:id", async (req, res) => {
  const { father_id, mother_id, marital_id, new_child_id } = req.body;
  const user = await User.findOne({ id: req.params.id });

  if (!user) return res.status(404).json({ message: "User not found" });

  // Update Family Relationships
  if (new_child_id) {
    user.CHILDRENS_ID.push(new_child_id);
  }

  user.father_id = father_id || user.father_id;
  user.mother_id = mother_id || user.mother_id;
  user.marital_id = marital_id || user.marital_id;

  await user.save();
  res.json({ message: "Relationships updated" });
});

module.exports = router;
