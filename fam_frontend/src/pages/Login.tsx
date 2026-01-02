import React, { useState, useContext } from "react";
// import axios from "../api"; // Not used directly here, used via AuthContext
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const Login = () => {
    const [formData, setFormData] = useState({ identifier: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            await login(formData);
            navigate("/dashboard");
        } catch (err: any) {
            setError(err.response?.data?.message || t('login_failed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "calc(100vh - 160px)" }}>
            <div className="card" style={{ maxWidth: "400px", width: "100%", padding: "2rem" }}>
                <h2 style={{ textAlign: "center", marginBottom: "1.5rem", color: "var(--primary-color)" }}>{t('welcome_back')}</h2>

                {error && <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "0.75rem", borderRadius: "var(--radius-md)", marginBottom: "1rem", fontSize: "0.9rem" }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">{t('user_id_or_name')}</label>
                        <input
                            type="text"
                            name="identifier"
                            className="input-field"
                            placeholder={t('user_id_placeholder')}
                            value={formData.identifier}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label className="input-label">{t('password')}</label>
                        <input
                            type="password"
                            name="password"
                            className="input-field"
                            placeholder={t('password_placeholder')}
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
                        {loading ? t('logging_in') : t('login')}
                    </button>
                </form>
                <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                    {t('no_account')} <Link to="/signup" style={{ color: "var(--primary-color)", fontWeight: "600" }}>{t('signup_action')}</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
