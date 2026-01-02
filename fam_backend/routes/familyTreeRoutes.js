const express = require("express");
const User = require("../models/User");
const router = express.Router();

const relationshipMap = {
  "Self": "Self",

  // Parents
  "Father of Self": "Father",
  "Mother of Self": "Mother",

  // Grandparents
  "Father of Father of Self": "Paternal Grandfather",
  "Mother of Father of Self": "Paternal Grandmother",
  "Father of Mother of Self": "Maternal Grandfather",
  "Mother of Mother of Self": "Maternal Grandmother",

  // Great Grandparents (Optional but good)
  "Father of Father of Father of Self": "Great-Grandfather",
  "Mother of Father of Father of Self": "Great-Grandmother",

  // Siblings
  "Brother of Self": "Brother",
  "Sister of Self": "Sister",

  // Children
  "Son of Self": "Son",
  "Daughter of Self": "Daughter",

  // Grandchildren
  "Son of Son of Self": "Grandson",
  "Daughter of Son of Self": "Granddaughter",
  "Son of Daughter of Self": "Grandson",
  "Daughter of Daughter of Self": "Granddaughter",

  // Spouses
  "Husband of Self": "Husband",
  "Wife of Self": "Wife",

  // Uncles & Aunts (Paternal)
  "Brother of Father of Self": "Uncle (Paternal)",
  "Sister of Father of Self": "Aunt (Paternal)",

  // Uncles & Aunts (Maternal)
  "Brother of Mother of Self": "Uncle (Maternal)",
  "Sister of Mother of Self": "Aunt (Maternal)",

  // Niblings (Nieces/Nephews)
  "Son of Brother of Self": "Nephew",
  "Daughter of Brother of Self": "Niece",
  "Son of Sister of Self": "Nephew",
  "Daughter of Sister of Self": "Niece",

  // In-Laws (Via Siblings)
  "Husband of Sister of Self": "Brother-in-Law",
  "Wife of Brother of Self": "Sister-in-Law",

  // In-Laws (Via Spouse)
  "Father of Husband of Self": "Father-in-Law",
  "Mother of Husband of Self": "Mother-in-Law",
  "Father of Wife of Self": "Father-in-Law",
  "Mother of Wife of Self": "Mother-in-Law",

  "Brother of Husband of Self": "Brother-in-Law",
  "Sister of Husband of Self": "Sister-in-Law",
  "Brother of Wife of Self": "Brother-in-Law",
  "Sister of Wife of Self": "Sister-in-Law",

  // Great-Grandchildren
  "Son of Son of Son of Self": "Great-Grandson",
  "Daughter of Son of Son of Self": "Great-Granddaughter",
  "Son of Daughter of Son of Self": "Great-Grandson",
  "Daughter of Daughter of Son of Self": "Great-Granddaughter",
  "Son of Son of Daughter of Self": "Great-Grandson",
  "Daughter of Son of Daughter of Self": "Great-Granddaughter",
  "Son of Daughter of Daughter of Self": "Great-Grandson",
  "Daughter of Daughter of Daughter of Self": "Great-Granddaughter",

  // Cousins (Paternal Uncle's children)
  "Son of Brother of Father of Self": "Cousin",
  "Daughter of Brother of Father of Self": "Cousin",

  // Cousins (Paternal Aunt's children)
  "Son of Sister of Father of Self": "Cousin",
  "Daughter of Sister of Father of Self": "Cousin",

  // Cousins (Maternal Uncle's children)
  "Son of Brother of Mother of Self": "Cousin",
  "Daughter of Brother of Mother of Self": "Cousin",

  // Cousins (Maternal Aunt's children)
  "Son of Sister of Mother of Self": "Cousin",
  "Daughter of Sister of Mother of Self": "Cousin",

  // Great-Nephews/Nieces (Children of Nephew/Niece) - Optional depth
  "Son of Son of Brother of Self": "Great-Nephew",
  "Daughter of Son of Brother of Self": "Great-Niece",
  "Son of Daughter of Brother of Self": "Great-Nephew",
  "Daughter of Daughter of Brother of Self": "Great-Niece",
  "Son of Son of Sister of Self": "Great-Nephew",
  "Daughter of Son of Sister of Self": "Great-Niece",
  "Son of Daughter of Sister of Self": "Great-Nephew",
  "Daughter of Daughter of Sister of Self": "Great-Niece"
};

const { encryptID } = require("../utils/encryption");

const fetchFamilyTree = async (userId) => {
  const customIdMap = new Map(); // Real ID -> Temp ID (e.g., "node_1")
  let idCounter = 1;

  const getTempId = (realId) => {
    if (!customIdMap.has(realId)) {
      customIdMap.set(realId, `node_${idCounter++}`);
    }
    return customIdMap.get(realId);
  };

  // Plaintext userId passed in
  // Assign Node_1 to root immediately if desired, or let logic handle it
  // Root will be node_1 naturally as it's first in queue

  const queue = [{ id: userId, relationship: "Self", depth: 0, parent: null }];
  const visited = new Set();
  const treeData = [];

  while (queue.length > 0) {
    const current = queue.shift();
    const { id, relationship, depth, parent } = current;

    if (visited.has(id)) continue;
    visited.add(id);

    // Encrypt to search DB
    const searchId = encryptID(id);

    const person = await User.findOne({ id: searchId }).select("id name gender father_id mother_id marital_id");
    if (!person) continue;

    // Use Temp IDs for output
    const tempId = getTempId(person.id);
    const tempParentId = parent ? getTempId(parent) : null;

    treeData.push({
      id: tempId,
      name: person.name,
      gender: person.gender,
      relationship: relationshipMap[relationship] || relationship,
      parent: tempParentId
    });

    if (depth < 4) { // Limit depth for performance
      const encPersonId = encryptID(person.id);

      const [children, spouse] = await Promise.all([
        User.find({ $or: [{ father_id: encPersonId }, { mother_id: encPersonId }] }).select("id gender"),
        person.marital_id && !visited.has(person.marital_id)
          ? User.findOne({ id: encryptID(person.marital_id) }).select("id gender")
          : Promise.resolve(null)
      ]);

      if (person.father_id && !visited.has(person.father_id)) {
        queue.push({ id: person.father_id, relationship: `Father of ${relationship}`, depth: depth + 1, parent: person.id });
      }
      if (person.mother_id && !visited.has(person.mother_id)) {
        queue.push({ id: person.mother_id, relationship: `Mother of ${relationship}`, depth: depth + 1, parent: person.id });
      }

      for (let child of children) {
        if (visited.has(child.id)) continue;
        const childRel = child.gender === "male" ? "Son" : "Daughter";
        queue.push({ id: child.id, relationship: `${childRel} of ${relationship}`, depth: depth + 1, parent: person.id });
      }

      if (spouse) {
        const spouseRel = spouse.gender === "male" ? "Husband" : "Wife";
        queue.push({ id: spouse.id, relationship: `${spouseRel} of ${relationship}`, depth: depth + 1, parent: person.id });
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
