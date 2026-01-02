const mongoose = require("mongoose");

const { encrypt, decrypt, encryptID, decryptID } = require("../utils/encryption");

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true, set: encryptID, get: decryptID },
  name: { type: String, required: true, index: true },
  gender: { type: String },
  password: { type: String, required: true },

  // Encrypted Fields
  address: { type: String, set: encrypt, get: decrypt },
  dob: { type: String, set: encrypt, get: decrypt },
  mobile_number: { type: String, set: encrypt, get: decrypt },

  father_id: { type: String, default: null, index: true, set: encryptID, get: decryptID },
  mother_id: { type: String, default: null, index: true, set: encryptID, get: decryptID },
  marital_id: { type: String, default: null, index: true, set: encryptID, get: decryptID },
  CHILDRENS_ID: { type: [String], default: [], set: (v) => v.map(encryptID), get: (v) => v.map(decryptID) },
}, {
  toJSON: { getters: true },
  toObject: { getters: true }
});

module.exports = mongoose.model("User", userSchema);
