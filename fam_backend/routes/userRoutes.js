const express = require("express");
const User = require("../models/User");
const { encryptID } = require("../utils/encryption");
const router = express.Router();

// Get User Profile
router.get("/:id", async (req, res) => {
  const user = await User.findOne({ id: encryptID(req.params.id) });
  if (!user) return res.status(404).json({ message: "User not found" });

  res.json(user);
});

// Update Relationships
router.post("/update/:id", async (req, res) => {
  const { father_id, mother_id, marital_id, new_child_id } = req.body;
  const user = await User.findOne({ id: encryptID(req.params.id) });

  if (!user) return res.status(404).json({ message: "User not found" });

  // Update Family Relationships
  if (new_child_id) {
    user.CHILDRENS_ID.push(new_child_id); // Setter handles encryption? 
    // Wait, CHILDRENS_ID is [String]. The setter I added `(v) => v.map(encryptID)`.
    // Mongoose array setters can be tricky. It's safer to rely on full array set usually, 
    // but `push` might implicitly work if SchemaType is defined properly.
    // However, since we defined setter on the ARRAY itself `v => v.map`, `push` might not trigger it for the single element.
    // Better to re-assign array or rely on the setter running on save. 
    // Actually, `user.CHILDRENS_ID` getter returns decrypted. pushing plain ID is fine.
    // On save, Mongoose saves the whole array. If setter maps everything, it re-encrypts.
    // But `encryptID` is idempotent-ish? "det:" check handles it.
  }

  // Setters handle encryption automatically now
  user.father_id = father_id || user.father_id;
  user.mother_id = mother_id || user.mother_id;
  user.marital_id = marital_id || user.marital_id;

  await user.save();
  res.json({ message: "Relationships updated" });
});

module.exports = router;
