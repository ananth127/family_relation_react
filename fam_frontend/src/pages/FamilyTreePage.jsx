import React from "react";
import FamilyTree from "../components/FamilyTree";

const FamilyTreePage = () => {
  const userId = "179997297239592"; // Replace with actual user ID

  return (
    <div>
      <h1 style={{ textAlign: "center", fontFamily: "Arial, sans-serif", color: "#333" }}>Family Tree View</h1>
      <FamilyTree userId={userId} />
    </div>
  );
};

export default FamilyTreePage;
