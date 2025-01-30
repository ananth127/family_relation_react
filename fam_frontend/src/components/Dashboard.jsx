import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "../api";
import FamilyTree from "../components/FamilyTree";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await axios.get(`/users/${user}`);
        setProfile(data);
        console.log(data);
      }
    };
    fetchProfile();
  }, [user]);

  if (!profile) return <p>Loading...</p>;

  return (
    <div>
      <h1>Welcome, {profile.name}</h1>
      <p>ID: {profile.id}</p>
      <h1 style={{ textAlign: "center", fontFamily: "Arial, sans-serif", color: "#333" }}>Family Tree View</h1>
      <FamilyTree userId={profile.id} />

      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default Dashboard;
