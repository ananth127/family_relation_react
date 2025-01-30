const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  gender: { type: String },
  password: { type: String, required: true },
  address: { type: String },
  dob: { type: Date },
  mobile_number: { type: String },
  father_id: { type: String, default: null },
  mother_id: { type: String, default: null },
  marital_id: { type: String, default: null },
  CHILDRENS_ID: { type: [String], default: [] },
});

module.exports = mongoose.model("User", userSchema);
