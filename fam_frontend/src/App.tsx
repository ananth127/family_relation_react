import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Relations from "./pages/Relations";
import ProtectedRoute from "./components/ProtectedRoute";

function App(): JSX.Element {
    return (
        <AuthProvider>
            <Router>
                <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
                    <Navbar />
                    <div style={{ flex: 1 }}>
                        <ErrorBoundary>
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/login" element={<Login />} />
                                <Route path="/signup" element={<Signup />} />

                                {/* Secured Routes */}
                                <Route element={<ProtectedRoute />}>
                                    <Route path="/dashboard" element={<Dashboard />} />
                                    <Route path="/profile" element={<Profile />} />
                                    <Route path="/relations" element={<Relations />} />
                                </Route>
                            </Routes>
                        </ErrorBoundary>
                    </div>
                    <footer style={{ background: "white", padding: "1.5rem", textAlign: "center", borderTop: "1px solid #e2e8f0", color: "#64748b", fontSize: "0.875rem" }}>
                        &copy; {new Date().getFullYear()} FamTree. Preserving Generations using MERN.
                    </footer>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
