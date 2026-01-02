import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "../api";

interface UserProfile {
    id: string;
    name: string;
    gender: string;
    dob?: string;
    mobile_number?: string;
    address?: string;
    father_id?: string;
    mother_id?: string;
    marital_id?: string;
}

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);

const EyeSlashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
);

const Profile = () => {
    const { user } = useContext(AuthContext);
    const [profile, setProfile] = useState<UserProfile>({} as UserProfile);
    const [loading, setLoading] = useState(true);
    const [showId, setShowId] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await axios.get(`/users/${user}`);
                setProfile(data);
            } catch (err) {
                console.error("Error fetching profile. Network may be unavailable.");
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchProfile();
    }, [user]);

    const toggleIdVisibility = async () => {
        if (!showId) {
            // "Fetch again from DB" logic as requested
            try {
                const { data } = await axios.get(`/users/${user}`);
                setProfile(prev => ({ ...prev, id: data.id }));
                setShowId(true);
            } catch (error) {
                console.error("Failed to refresh ID", error);
            }
        } else {
            setShowId(false);
        }
    };

    if (loading) return <div className="container" style={{ marginTop: "2rem" }}>Loading...</div>;

    return (
        <div className="container" style={{ marginTop: "3rem", maxWidth: "800px" }}>
            <div className="card">
                <div style={{ display: "flex", alignItems: "center", gap: "2rem", marginBottom: "2rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "2rem" }}>
                    <div style={{ width: "100px", height: "100px", borderRadius: "50%", background: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" }}>
                        {profile.gender === "male" ? "👨" : "👩"}
                    </div>
                    <div>
                        <h2 style={{ fontSize: "2rem", marginBottom: "0.25rem" }}>{profile.name}</h2>
                        <p style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            User ID:
                            <span style={{ fontFamily: "monospace", background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                                {profile.id ? (showId ? profile.id : `XXXXXX${profile.id.slice(-4)}`) : "Loading..."}
                                <button
                                    onClick={toggleIdVisibility}
                                    style={{ border: "none", background: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center", color: "var(--text-muted)" }}
                                    title={showId ? "Hide ID" : "Show ID"}
                                >
                                    {showId ? <EyeIcon /> : <EyeSlashIcon />}
                                </button>
                            </span>
                        </p>
                    </div>
                </div>

                <h3 style={{ marginBottom: "1rem", color: "var(--primary-color)" }}>Personal Details</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                    <div>
                        <label className="input-label" style={{ color: "var(--text-muted)" }}>Gender</label>
                        <p style={{ fontWeight: "500", textTransform: "capitalize" }}>{profile.gender || "Not specified"}</p>
                    </div>
                    <div>
                        <label className="input-label" style={{ color: "var(--text-muted)" }}>Date of Birth</label>
                        <p style={{ fontWeight: "500" }}>{profile.dob ? new Date(profile.dob).toLocaleDateString() : "Not specified"}</p>
                    </div>
                    <div>
                        <label className="input-label" style={{ color: "var(--text-muted)" }}>Mobile Number</label>
                        <p style={{ fontWeight: "500" }}>{profile.mobile_number || "Not specified"}</p>
                    </div>
                    <div>
                        <label className="input-label" style={{ color: "var(--text-muted)" }}>Address</label>
                        <p style={{ fontWeight: "500" }}>{profile.address || "Not specified"}</p>
                    </div>
                </div>

                <h3 style={{ marginTop: "2rem", marginBottom: "1rem", color: "var(--primary-color)" }}>Family Connections</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div style={{ padding: "1rem", background: "#f8fafc", borderRadius: "8px" }}>
                        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Father ID</span>
                        <p>{profile.father_id || "Not Linked"}</p>
                    </div>
                    <div style={{ padding: "1rem", background: "#f8fafc", borderRadius: "8px" }}>
                        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Mother ID</span>
                        <p>{profile.mother_id || "Not Linked"}</p>
                    </div>
                    <div style={{ padding: "1rem", background: "#f8fafc", borderRadius: "8px" }}>
                        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Spouse ID</span>
                        <p>{profile.marital_id || "Not Linked"}</p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Profile;
