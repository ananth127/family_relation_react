import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div>
      <h1>Welcome to Family Management System</h1>
      <Link to="/login">Login</Link> | <Link to="/signup">Sign Up</Link>
    </div>
  );
};

export default Home;
