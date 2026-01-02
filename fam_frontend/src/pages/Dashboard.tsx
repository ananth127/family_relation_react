import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "../api";
import FamilyTree from "../components/FamilyTree";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface UserProfile {
    id: string;
    name: string;
    gender: string;
    address?: string;
    dob?: string;
    mobile_number?: string;
}

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchProfile = async () => {
            if (user) {
                try {
                    const { data } = await axios.get(`/users/${user}`);
                    setProfile(data);
                } catch (err) {
                    // Avoid logging sensitive IDs or details to console
                    console.error("Failed to fetch profile data. Please check network connection.");
                }
            }
        };
        fetchProfile();
    }, [user]);

    if (!profile) return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
            <div className="spinner">{t('loading_family_data')}</div>
        </div>
    );

    return (
        <div className="container dashboard-grid">
            {/* Sidebar / Left Panel */}
            <aside>
                <div className="card" style={{ position: "sticky", top: "100px" }}>
                    <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                        <div style={{ width: "80px", height: "80px", background: "#e0e7ff", borderRadius: "50%", margin: "0 auto 1rem", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>
                            {profile.gender === "male" ? "👨" : "👩"}
                        </div>
                        <h3 style={{ fontSize: "1.25rem", fontWeight: "700" }}>{profile.name}</h3>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                            ID: {profile.id ? `XXXXXX${profile.id.slice(-4)}` : "..."}
                        </p>
                    </div>

                    <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
                        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}><strong>📍 {t('address')}:</strong> <br />{profile.address || "N/A"}</p>
                        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}><strong>🎂 {t('dob')}:</strong> <br />{profile.dob ? new Date(profile.dob).toLocaleDateString() : "N/A"}</p>
                        <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}><strong>📞 {t('phone')}:</strong> <br />{profile.mobile_number || "N/A"}</p>
                    </div>

                    <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <Link to="/profile" className="btn btn-outline" style={{ width: "100%" }}>{t('edit_profile')}</Link>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main>
                {/* Quick Actions / Stats */}
                <div style={{ marginBottom: "2rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                    <div className="card" style={{ padding: "1.5rem" }}>
                        <h4 style={{ color: "var(--text-muted)", fontSize: "0.85rem", textTransform: "uppercase" }}>{t('family_size')}</h4>
                        <p style={{ fontSize: "2rem", fontWeight: "700", color: "var(--primary-color)" }}>Unknown</p>
                    </div>

                    <div className="card" style={{ padding: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div>
                            <h4 style={{ color: "var(--text-muted)", fontSize: "0.85rem", textTransform: "uppercase" }}>{t('grow_tree')}</h4>
                            <p style={{ fontSize: "0.9rem" }}>{t('add_parents_children')}</p>
                        </div>
                        <Link to="/relations" className="btn btn-primary" style={{ padding: "0.5rem 1rem" }}>{t('add_btn')}</Link>
                    </div>
                </div>

                {/* Tree Section */}
                <div className="card" style={{ minHeight: "500px", padding: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", padding: "0 1rem" }}>
                        <h2 style={{ fontSize: "1.5rem" }}>{t('family_tree')}</h2>
                        <span style={{ fontSize: "0.8rem", background: "#f1f5f9", padding: "0.25rem 0.75rem", borderRadius: "20px", color: "var(--text-muted)" }}>{t('nav_instruction')}</span>
                    </div>
                    <div style={{ height: "600px", border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
                        <FamilyTree userId={profile.id} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
