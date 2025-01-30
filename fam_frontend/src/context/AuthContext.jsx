import { createContext, useState } from "react";
import axios from "../api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(localStorage.getItem("user"));

  const login = async (credentials) => {
    const { data } = await axios.post("/auth/login", credentials);
    localStorage.setItem("user", data.userId);
    setUser(data.userId);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};
