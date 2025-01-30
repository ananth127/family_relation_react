const express = require("express");
const User = require("../models/User");
const router = express.Router();

const relationshipMap = {
  "Self": "Self",
  "Father of Self": "Father",
  "Mother of Self": "Mother",
  "Father of Father of Self": "Paternal Grandfather",
  "Mother of Father of Self": "Paternal Grandmother",
  "Father of Mother of Self": "Maternal Grandfather",
  "Mother of Mother of Self": "Maternal Grandmother",
  "Brother of Self": "Brother",
  "Sister of Self": "Sister",
  "Son of Self": "Son",
  "Daughter of Self": "Daughter",
  "Husband of Self": "Husband",
  "Wife of Self": "Wife"
};

const fetchFamilyTree = async (userId) => {
  const queue = [{ id: userId, relationship: "Self", depth: 0, parent: null }];
  const visited = new Set();
  const treeData = [];

  while (queue.length > 0) {
    const current = queue.shift();
    const { id, relationship, depth, parent } = current;

    if (visited.has(id)) continue;
    visited.add(id);

    const person = await User.findOne({ id }).select("id name gender father_id mother_id marital_id");
    if (!person) continue;

    treeData.push({
      id: person.id,
      name: person.name,
      relationship: relationshipMap[relationship] || relationship,
      parent
    });

    if (depth < 4) {
      if (person.father_id && !visited.has(person.father_id)) {
        queue.push({ id: person.father_id, relationship: `Father of ${relationship}`, depth: depth + 1, parent: person.id });
      }
      if (person.mother_id && !visited.has(person.mother_id)) {
        queue.push({ id: person.mother_id, relationship: `Mother of ${relationship}`, depth: depth + 1, parent: person.id });
      }

      const children = await User.find({ $or: [{ father_id: person.id }, { mother_id: person.id }] }).select("id gender");
      for (let child of children) {
        const childRel = child.gender === "male" ? "Son" : "Daughter";
        queue.push({ id: child.id, relationship: `${childRel} of ${relationship}`, depth: depth + 1, parent: person.id });
      }

      if (person.marital_id && !visited.has(person.marital_id)) {
        const spouse = await User.findOne({ id: person.marital_id }).select("id gender");
        if (spouse) {
          const spouseRel = spouse.gender === "male" ? "Husband" : "Wife";
          queue.push({ id: spouse.id, relationship: `${spouseRel} of ${relationship}`, depth: depth + 1, parent: person.id });
        }
      }
    }
  }

  return treeData;
};

router.get("/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const familyTree = await fetchFamilyTree(userId);
    res.json(familyTree);
  } catch (error) {
    res.status(500).json({ message: "Error fetching family tree", error: error.message });
  }
});

module.exports = router;
