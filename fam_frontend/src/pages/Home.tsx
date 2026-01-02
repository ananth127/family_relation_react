import { Link } from "react-router-dom";
// import familyTreeImage from "../assets/familytree.png";
import familyTreeImage from "../assets/familytree.png";

const Home = () => {
    return (
        <div style={{ background: "linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)", minHeight: "calc(100vh - 80px)" }}>
            <div className="container" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "center", gap: "4rem", paddingTop: "4rem", paddingBottom: "4rem" }}>

                {/* Left Content */}
                <div>
                    <h1 style={{ fontSize: "3.5rem", lineHeight: "1.2", marginBottom: "1.5rem", color: "#1e293b" }}>
                        Connect with your <br />
                        <span style={{ color: "var(--primary-color)" }}>Roots & Heritage</span>
                    </h1>
                    <p style={{ fontSize: "1.25rem", color: "var(--text-muted)", marginBottom: "2.5rem", maxWidth: "500px" }}>
                        Securely map your family history, discover relationships, and preserve your legacy for future generations.
                    </p>

                    <div style={{ display: "flex", gap: "1rem" }}>
                        <Link to="/signup" className="btn btn-primary" style={{ padding: "1rem 2rem", fontSize: "1.1rem" }}>Start Your Tree</Link>
                        <Link to="/login" className="btn btn-outline" style={{ padding: "1rem 2rem", fontSize: "1.1rem", background: "white" }}>Login</Link>
                    </div>
                </div>

                {/* Right Image/Graphic */}
                <div style={{ position: "relative" }}>
                    {/* Abstract Circle Background */}
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "500px", height: "500px", background: "#6366f1", borderRadius: "50%", opacity: "0.1", zIndex: "0" }}></div>

                    <div className="card" style={{ position: "relative", zIndex: "1", padding: "1rem", transform: "rotate(-2deg)" }}>
                        <div style={{ width: "100%", height: "350px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px", overflow: "hidden" }}>
                            <img src={familyTreeImage} alt="Family Tree" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { (e.target as HTMLElement).style.display = 'none'; (e.target as HTMLElement).parentElement!.innerText = '🌳 Interactive Tree Preview' }} />
                        </div>
                        <div style={{ padding: "1rem 0 0" }}>
                            <div style={{ height: "10px", width: "60%", background: "#e2e8f0", borderRadius: "5px", marginBottom: "0.5rem" }}></div>
                            <div style={{ height: "10px", width: "40%", background: "#e2e8f0", borderRadius: "5px" }}></div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Home;
