import { useState } from "react";
import axios from "../api";
import { useNavigate } from "react-router-dom";
import Footer from "./footer";
// import "./Signup.css"; // Import CSS for styling?
import { Link } from "react-router-dom";


const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    password: "",
    address: "",
    dob: "",
    mobile_number: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/auth/signup", formData);
      alert("Signup successful! Please log in.");
      navigate("/login");
    } catch (error) {
      alert("Signup failed: " + error.response.data.message);
    }
  };

  return (
    <div className="signup-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <div className="signup-card">
        <h2>Create an Account</h2>
        <form onSubmit={handleSubmit} className="signup-form">
          <input
            type="text"
            name="name"
            placeholder="Name"
            onChange={handleChange}
            value={formData.name}
            className="input-field"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            value={formData.password}
            required
            className="input-field"
          />
          <input
            type="text"
            name="gender"
            placeholder="Gender"
            onChange={handleChange}
            value={formData.gender}
            className="input-field"
          />
          <input
            type="text"
            name="address"
            placeholder="Address"
            onChange={handleChange}
            value={formData.address}
            className="input-field"
          />
          <input
            type="date"
            name="dob"
            onChange={handleChange}
            value={formData.dob}
            className="input-field"
          />
          <input
            type="text"
            name="mobile_number"
            placeholder="Mobile Number"
            onChange={handleChange}
            value={formData.mobile_number}
            className="input-field"
          />
          <button type="submit" className="signup-btn">Sign Up</button>
        </form>
        <br></br>
        <Link to="/login">Already have an account? Login</Link> 
        <Footer />
      </div>
    </div>
  );
};

export default Signup;
