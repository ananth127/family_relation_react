import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <div className="spinner">Loading...</div>; // Or a better loading component
    }

    // If not authenticated, redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If authenticated, render child routes
    return <Outlet />;
};

export default ProtectedRoute;
