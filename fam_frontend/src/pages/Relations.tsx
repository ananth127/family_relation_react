import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axios from "../api";

const Relations = () => {
    const { user } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        related_id: "", // ID of the person to link
        relation_type: "father", // father, mother, child, spouse
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: "", text: "" });

        try {

            let payload: any = {};
            if (formData.relation_type === "father") payload.father_id = formData.related_id;
            if (formData.relation_type === "mother") payload.mother_id = formData.related_id;
            if (formData.relation_type === "spouse") payload.marital_id = formData.related_id;
            if (formData.relation_type === "child") payload.new_child_id = formData.related_id;

            await axios.post(`/users/update/${user}`, payload);
            setMessage({ type: "success", text: "Relationship updated successfully!" });
            setFormData({ ...formData, related_id: "" }); // Reset ID field
        } catch (err: any) {
            setMessage({ type: "error", text: err.response?.data?.message || "Failed to update relationship. Check ID." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: "600px", marginTop: "3rem" }}>
            <div className="card">
                <h2 style={{ marginBottom: "1.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>Manage Relationships</h2>

                <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
                    Link existing users to your profile. You need their <strong>User ID</strong> to connect them.
                </p>

                {message.text && (
                    <div style={{
                        padding: "1rem",
                        marginBottom: "1.5rem",
                        borderRadius: "var(--radius-md)",
                        background: message.type === "success" ? "#dcfce7" : "#fee2e2",
                        color: message.type === "success" ? "#166534" : "#991b1b"
                    }}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="input-label">I want to add my...</label>
                        <select
                            name="relation_type"
                            className="input-field"
                            value={formData.relation_type}
                            onChange={handleChange}
                        >
                            <option value="father">Father</option>
                            <option value="mother">Mother</option>
                            <option value="spouse">Spouse (Husband/Wife)</option>
                            <option value="child">Child (Son/Daughter)</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Their User ID</label>
                        <input
                            type="text"
                            name="related_id"
                            className="input-field"
                            placeholder="Enter User ID of relative"
                            value={formData.related_id}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={loading}>
                        {loading ? "Linking..." : "Add Relationship"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Relations;
