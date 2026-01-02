import React, { useState } from "react";
import axios from "../api";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Signup = () => {
    const [formData, setFormData] = useState({
        name: "",
        password: "",
        gender: "male",
        address: "",
        dob: "",
        mobile_number: "",
        father_id: "",
        mother_id: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            await axios.post("/auth/signup", formData);
            setSuccess(true);
            setTimeout(() => navigate("/login"), 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || t('signup_failed'));
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
                <div className="card" style={{ padding: "3rem", textAlign: "center" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
                    <h2>{t('account_created')}</h2>
                    <p>{t('redirecting')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container" style={{ marginTop: "2rem", marginBottom: "2rem" }}>
            <div className="card" style={{ maxWidth: "600px", margin: "0 auto" }}>
                <h2 style={{ textAlign: "center", marginBottom: "2rem", color: "var(--primary-color)" }}>{t('create_account')}</h2>

                {error && <div style={{ background: "#fee2e2", color: "#b91c1c", padding: "0.75rem", borderRadius: "var(--radius-md)", marginBottom: "1rem", fontSize: "0.9rem" }}>{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div className="input-group" style={{ gridColumn: "span 2" }}>
                        <label className="input-label">{t('full_name')}</label>
                        <input type="text" name="name" className="input-field" placeholder="John Doe" onChange={handleChange} required />
                    </div>

                    <div className="input-group" style={{ gridColumn: "span 2" }}>
                        <label className="input-label">{t('password')}</label>
                        <input type="password" name="password" className="input-field" placeholder={t('password_placeholder')} onChange={handleChange} required />
                    </div>

                    <div className="input-group">
                        <label className="input-label">{t('gender')}</label>
                        <select name="gender" className="input-field" onChange={handleChange}>
                            <option value="male">{t('male')}</option>
                            <option value="female">{t('female')}</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label className="input-label">{t('dob')}</label>
                        <input type="date" name="dob" className="input-field" onChange={handleChange} required />
                    </div>

                    <div className="input-group" style={{ gridColumn: "span 2" }}>
                        <label className="input-label">{t('phone')}</label>
                        <input type="tel" name="mobile_number" className="input-field" placeholder="1234567890" onChange={handleChange} required />
                    </div>

                    <div className="input-group" style={{ gridColumn: "span 2" }}>
                        <label className="input-label">{t('address')}</label>
                        <textarea name="address" className="input-field" placeholder={t('address_placeholder')} rows={2} onChange={handleChange}></textarea>
                    </div>

                    <div style={{ gridColumn: "span 2", marginTop: "1rem" }}>
                        <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
                            {loading ? t('creating_account') : t('sign_up_btn')}
                        </button>
                    </div>
                </form>
                <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                    {t('already_have_account')} <Link to="/login" style={{ color: "var(--primary-color)", fontWeight: "600" }}>{t('login')}</Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
