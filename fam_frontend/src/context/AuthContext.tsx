import { createContext, useState, useEffect, ReactNode } from "react";
import axios from "../api";

interface User {
    id: string;
    name: string;
    // add other fields as necessary
}

interface AuthContextType {
    user: string | null;
    login: (userData: any) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    login: async () => { },
    logout: () => { },
    loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        if (token && userId) {
            setUser(userId);
            axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }
        setLoading(false);
    }, []);

    const login = async (userData: any) => {
        const { data } = await axios.post("/auth/login", userData);
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", data.userId);
        setUser(data.userId);
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        setUser(null);
        delete axios.defaults.headers.common["Authorization"];
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
