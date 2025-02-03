import axios from "axios";

const instance = axios.create({
  baseURL: "https://family-relation-react-867e.vercel.app/api",
  // baseURL: "http://localhost:5000/api",
});

export default instance;
