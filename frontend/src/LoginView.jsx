import React, { useState } from "react";
import { User, Lock, LogIn, Activity } from "lucide-react";
import { login } from "./api";

export default function LoginView({ onLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!username || !password) {
            setError("Please enter both username and password.");
            return;
        }

        setLoading(true);
        try {
            const data = await login(username, password);
            // data = { token, role, profile? }
            onLogin(data);
        } catch (err) {
            const msg = err.response?.data?.message || "Invalid username or password.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: "flex",
            height: "100vh",
            width: "100vw",
            background: `url('/vibrant-bg.png') center/cover no-repeat`,
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Soft luminous overlay instead of blackout */}
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(50, 0, 70, 0.15)', mixBlendMode: 'overlay', backdropFilter: 'blur(10px)' }}></div>

            <div style={{
                width: 440,
                padding: "48px 40px",
                backgroundColor: "rgba(0, 0, 0, 0.45)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: 24,
                boxShadow: "0 40px 80px rgba(0,0,0,0.5), inset 0 0 40px rgba(255,255,255,0.05)",
                textAlign: "center",
                position: "relative",
                zIndex: 10,
                color: "white"
            }}>

                <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
                    <div style={{
                        width: 72,
                        height: 72,
                        borderRadius: 20,
                        background: "linear-gradient(135deg, var(--accent) 0%, #1e87f0 100%)",
                        boxShadow: "0 10px 20px rgba(0,0,0,0.2)",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <Activity size={36} strokeWidth={2.5} />
                    </div>
                </div>

                <h2 className="font-display" style={{ margin: "0 0 8px 0", fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px" }}>Welcome Back</h2>
                <p style={{ margin: "0 0 32px 0", color: "rgba(255,255,255,0.7)", fontSize: 15 }}>Sign in to manage your clinic workflow seamlessly.</p>

                {error && (
                    <div style={{
                        backgroundColor: "rgba(220,53,69,0.2)",
                        color: "#ffc1c1",
                        border: "1px solid rgba(220,53,69,0.4)",
                        padding: "12px 16px",
                        borderRadius: 12,
                        marginBottom: 24,
                        fontSize: 14,
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: 8
                    }}>
                        <div style={{ flexShrink: 0, width: 4, height: 16, backgroundColor: "var(--danger)", borderRadius: 4 }}></div>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div style={{ position: "relative" }}>
                        <User size={18} style={{ position: "absolute", left: 16, top: 15, color: "rgba(255,255,255,0.6)" }} />
                        <input
                            type="text"
                            placeholder="Username"
                            value={username} onChange={e => setUsername(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "14px 16px 14px 44px",
                                backgroundColor: "rgba(0,0,0,0.2)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: 12,
                                color: "white",
                                outline: "none",
                                fontSize: 15,
                                transition: "all 0.2s"
                            }}
                            onFocus={(e) => { e.target.style.backgroundColor = "rgba(0,0,0,0.3)"; e.target.style.border = "1px solid rgba(255,255,255,0.3)"; }}
                            onBlur={(e) => { e.target.style.backgroundColor = "rgba(0,0,0,0.2)"; e.target.style.border = "1px solid rgba(255,255,255,0.1)"; }}
                        />
                    </div>

                    <div style={{ position: "relative" }}>
                        <Lock size={18} style={{ position: "absolute", left: 16, top: 15, color: "rgba(255,255,255,0.6)" }} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password} onChange={e => setPassword(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "14px 16px 14px 44px",
                                backgroundColor: "rgba(0,0,0,0.2)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: 12,
                                color: "white",
                                outline: "none",
                                fontSize: 15,
                                transition: "all 0.2s"
                            }}
                            onFocus={(e) => { e.target.style.backgroundColor = "rgba(0,0,0,0.3)"; e.target.style.border = "1px solid rgba(255,255,255,0.3)"; }}
                            onBlur={(e) => { e.target.style.backgroundColor = "rgba(0,0,0,0.2)"; e.target.style.border = "1px solid rgba(255,255,255,0.1)"; }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: 12,
                            height: 48,
                            width: "100%",
                            justifyContent: "center",
                            background: "linear-gradient(135deg, #ff007f 0%, #7928ca 50%, #1e87f0 100%)",
                            color: "white",
                            border: "none",
                            borderRadius: 12,
                            fontWeight: 700,
                            fontSize: 16,
                            cursor: loading ? "not-allowed" : "pointer",
                            opacity: loading ? 0.7 : 1,
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            boxShadow: "0 10px 30px rgba(121, 40, 202, 0.4)",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                        }}
                        onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 15px 40px rgba(121, 40, 202, 0.6)"; } }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(121, 40, 202, 0.4)"; }}
                    >
                        <LogIn size={18} />
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>
            </div>
        </div>
    );
}
