import React, { useState, useEffect } from "react";
import { PlusCircle, Building, User, LogOut, Key, Trash2, LogIn } from "lucide-react";
import { getDoctors, createDoctor, deleteDoctor } from "./api";
import { Toast } from "./components";
import { GlobalStyle } from "./theme";

export default function AdminDashboard({ onLogout, onLoginAsDoctor }) {
    const [doctors, setDoctors] = useState([]);
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(true);

    // New Doctor Form State
    const [clinicName, setClinicName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        getDoctors()
            .then(setDoctors)
            .catch(() => showToast("Failed to load doctors.", "error"))
            .finally(() => setLoading(false));
    }, []);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const handleCreateDoctor = async (e) => {
        e.preventDefault();
        if (!username.trim() || !password || !clinicName.trim()) {
            showToast("All fields are required.", "error");
            return;
        }
        try {
            const newDoctor = await createDoctor({ username: username.trim(), password, clinicName: clinicName.trim() });
            setDoctors(prev => [...prev, newDoctor]);
            setUsername(""); setPassword(""); setClinicName("");
            showToast("Doctor account created successfully!");
        } catch (err) {
            showToast(err.response?.data?.message || "Failed to create doctor.", "error");
        }
    };

    const handleDeleteDoctor = async (doctorId) => {
        if (!window.confirm("Are you sure you want to delete this doctor?")) return;
        try {
            await deleteDoctor(doctorId);
            setDoctors(prev => prev.filter(d => d._id !== doctorId));
            showToast("Doctor deleted.", "error");
        } catch {
            showToast("Failed to delete doctor.", "error");
        }
    };

    return (
        <div className="cms-root light" style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "var(--bg-inset)" }}>
            <GlobalStyle />

            {/* Top Bar for Admin */}
            <div style={{ height: 60, backgroundColor: "var(--bg-surface)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: "var(--accent)", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <User size={18} />
                    </div>
                    <h1 className="font-display" style={{ margin: 0, fontSize: 18, color: "var(--text-main)" }}>Admin Dashboard</h1>
                </div>
                <button className="cms-btn-ghost" onClick={onLogout}>
                    <LogOut size={16} /> Logout
                </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: 32 }}>
                <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 340px", gap: 32 }}>

                    {/* Main Content: List of Clinics */}
                    <div>
                        <h2 className="font-display" style={{ margin: "0 0 20px 0", fontSize: 20 }}>Registered Clinics</h2>

                        {loading ? (
                            <div className="cms-card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>
                        ) : doctors.length === 0 ? (
                            <div className="cms-card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
                                No doctors registered yet. Add one from the panel.
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                {doctors.map(doc => (
                                    <div key={doc._id} className="cms-card" style={{ padding: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <div>
                                            <div style={{ fontWeight: 600, color: "var(--text-main)", fontSize: 16, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
                                                <Building size={16} style={{ color: "var(--accent)" }} />
                                                {doc.clinics ? doc.clinics.map(c => c.name).join(", ") : "Unknown Clinic"}
                                            </div>
                                            <div style={{ fontSize: 14, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 16 }}>
                                                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                                    <User size={14} /> {doc.username}
                                                </span>
                                                <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                                    <Key size={14} /> [Hidden]
                                                </span>
                                            </div>
                                        </div>

                                        <div style={{ display: "flex", gap: 8 }}>
                                            <button className="cms-btn-ghost" onClick={() => onLoginAsDoctor(doc)} style={{ padding: 8, color: "var(--primary)" }}>
                                                <LogIn size={16} /> Enter
                                            </button>
                                            <button className="cms-btn-danger" onClick={() => handleDeleteDoctor(doc._id)} style={{ padding: 8 }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar: Add Doctor Form */}
                    <div>
                        <div className="cms-card" style={{ padding: 24, position: "sticky", top: 32 }}>
                            <h3 className="font-display" style={{ margin: "0 0 20px 0", fontSize: 16 }}>Add New Doctor</h3>

                            <form onSubmit={handleCreateDoctor} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                                <div>
                                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>Clinic Name</label>
                                    <input type="text" value={clinicName} onChange={e => setClinicName(e.target.value)} className="cms-input" style={{ width: "100%" }} placeholder="e.g. City Care Clinic" />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>Username</label>
                                    <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="cms-input" style={{ width: "100%" }} placeholder="Doctor's login username" />
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>Password</label>
                                    <input type="text" value={password} onChange={e => setPassword(e.target.value)} className="cms-input" style={{ width: "100%" }} placeholder="Doctor's login password" />
                                </div>
                                <button type="submit" className="cms-btn-primary" style={{ marginTop: 8, justifyContent: "center" }}>
                                    <PlusCircle size={16} />
                                    Create Account
                                </button>
                            </form>
                        </div>
                    </div>

                </div>
            </div>

            <Toast toast={toast} />
        </div>
    );
}
