import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";
import { Link } from "react-router-dom";


const Login = () => {
  const { login } = useContext(AuthContext);
  const [formData, setFormData] = useState({ id: "", name: "", password: "123" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData);
      navigate("/dashboard");
    } catch (error) {
      alert("Login failed: " + error.response.data.message);
    }
  };

  return (
    <div style={{margin:"20px", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <form onSubmit={handleSubmit}>
        <label htmlFor="id">User ID: 16-digit Aadhar Number</label>
        <input type="text"  name="id" placeholder="User ID" onChange={handleChange} />
        <p>Either Id OR Name is required</p>
<label htmlFor="name">Name</label>
        <input type="text" name="name" placeholder="User name" onChange={handleChange} />
        <p>default : 123</p>
        <input type="password" name="password" placeholder="Password" onChange={handleChange} required />
        <button type="submit">Login</button>
      </form>
      <br></br><br />
      <div className="signup-link">
        <Link to="/signup">Don't have an account? Sign Up</Link>
      </div>
      <Footer />
    </div>

      );
};

      export default Login;
