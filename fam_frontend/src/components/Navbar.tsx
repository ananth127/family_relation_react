import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        setIsMenuOpen(false);
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
        setIsMenuOpen(false);
    };

    const isAuthPage = ["/login", "/signup"].includes(location.pathname);
    const isActive = (path: string) => location.pathname === path ? "nav-link active" : "nav-link";

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo */}
                <Link to="/" className="nav-logo" onClick={() => setIsMenuOpen(false)}>
                    <span>🌿 FamTree</span>
                </Link>

                {/* Right Side: Language + Desktop Menu + Hamburger */}
                <div className="nav-right">
                    {/* Language Selector (Always visible) */}
                    <div>
                        <select
                            onChange={(e) => changeLanguage(e.target.value)}
                            value={i18n.language}
                            className="lang-select"
                        >
                            <option value="en">English</option>
                            <option value="hi">हिन्दी (Hindi)</option>
                            <option value="kn">ಕನ್ನಡ (Kannada)</option>
                            <option value="ta">தமிழ் (Tamil)</option>
                            <option value="te">తెలుగు (Telugu)</option>
                            <option value="ml">മലയാളം (Malayalam)</option>
                            <option value="mr">मराठी (Marathi)</option>
                        </select>
                    </div>

                    {/* Desktop Menu */}
                    <div className="nav-links-desktop">
                        {user ? (
                            <>
                                <Link to="/dashboard" className={isActive("/dashboard")}>{t('dashboard')}</Link>
                                <Link to="/profile" className={isActive("/profile")}>{t('profile')}</Link>
                                <Link to="/relations" className={isActive("/relations")}>{t('manage_relations')}</Link>
                                <button onClick={handleLogout} className="btn btn-outline" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}>{t('logout')}</button>
                            </>
                        ) : (
                            !isAuthPage && (
                                <>
                                    <Link to="/login" className="btn btn-outline">{t('login')}</Link>
                                    <Link to="/signup" className="btn btn-primary">{t('get_started')}</Link>
                                </>
                            )
                        )}
                    </div>

                    {/* Hamburger Toggle */}
                    <button
                        className={`hamburger ${isMenuOpen ? "open" : ""}`}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <div className={`mobile-menu-overlay ${isMenuOpen ? "open" : ""}`}>
                {user ? (
                    <>
                        <Link to="/dashboard" className="mobile-link" onClick={() => setIsMenuOpen(false)}>{t('dashboard')}</Link>
                        <Link to="/profile" className="mobile-link" onClick={() => setIsMenuOpen(false)}>{t('profile')}</Link>
                        <Link to="/relations" className="mobile-link" onClick={() => setIsMenuOpen(false)}>{t('manage_relations')}</Link>
                        <div style={{ marginTop: "1rem" }}>
                            <button onClick={handleLogout} className="btn btn-outline" style={{ wth: "100%", justifyContent: "center" }}>{t('logout')}</button>
                        </div>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="mobile-link" onClick={() => setIsMenuOpen(false)}>{t('login')}</Link>
                        <Link to="/signup" className="mobile-link" onClick={() => setIsMenuOpen(false)}>{t('get_started')}</Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
