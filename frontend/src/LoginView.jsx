import React, { useState } from "react";
import { User, Lock, LogIn, Activity, Eye, EyeOff, ShieldCheck, Stethoscope } from "lucide-react";
import { login } from "./api";

export default function LoginView({ onLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setError("");

        const trimmedUser = username.trim();
        const trimmedPass = password.trim();

        if (!trimmedUser || !trimmedPass) {
            setError("Please enter both username and password.");
            return;
        }

        setLoading(true);
        try {
            const data = await login(trimmedUser, trimmedPass);
            // data = { token, role, profile? }
            onLogin(data);
        } catch (err) {
            console.error("Login failure:", err);
            if (!err.response) {
                setError("Unable to connect to backend server. Please verify backend is running on http://localhost:5000.");
            } else {
                const msg = err.response?.data?.message || "Invalid username or password. Please try again.";
                setError(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    const fillDemo = (user, pass) => {
        setUsername(user);
        setPassword(pass);
        setError("");
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
            {/* Soft luminous overlay */}
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(50, 0, 70, 0.15)', mixBlendMode: 'overlay', backdropFilter: 'blur(10px)' }}></div>

            <div style={{
                width: 460,
                maxWidth: "92vw",
                padding: "44px 36px",
                backgroundColor: "rgba(0, 0, 0, 0.52)",
                backdropFilter: "blur(24px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: 24,
                boxShadow: "0 40px 80px rgba(0,0,0,0.5), inset 0 0 40px rgba(255,255,255,0.05)",
                textAlign: "center",
                position: "relative",
                zIndex: 10,
                color: "white"
            }}>

                <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                    <div style={{
                        width: 68,
                        height: 68,
                        borderRadius: 20,
                        background: "linear-gradient(135deg, var(--accent, #ff007f) 0%, #1e87f0 100%)",
                        boxShadow: "0 10px 24px rgba(0,0,0,0.3)",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <Activity size={34} strokeWidth={2.5} />
                    </div>
                </div>

                <h2 className="font-display" style={{ margin: "0 0 6px 0", fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px" }}>Dhyey Clinic</h2>
                <p style={{ margin: "0 0 24px 0", color: "rgba(255,255,255,0.72)", fontSize: 14 }}>Sign in to access clinic records & management.</p>

                {error && (
                    <div style={{
                        backgroundColor: "rgba(220,53,69,0.25)",
                        color: "#ffc1c1",
                        border: "1px solid rgba(220,53,69,0.5)",
                        padding: "12px 14px",
                        borderRadius: 12,
                        marginBottom: 20,
                        fontSize: 13.5,
                        textAlign: "left",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        lineHeight: 1.4
                    }}>
                        <div style={{ flexShrink: 0, width: 4, height: 28, backgroundColor: "var(--danger, #ff4d4f)", borderRadius: 4 }}></div>
                        <div>{error}</div>
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ position: "relative" }}>
                        <User size={18} style={{ position: "absolute", left: 16, top: 15, color: "rgba(255,255,255,0.6)" }} />
                        <input
                            type="text"
                            placeholder="Username (e.g. dhyey or admin)"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            autoComplete="username"
                            style={{
                                width: "100%",
                                padding: "14px 16px 14px 44px",
                                backgroundColor: "rgba(0,0,0,0.25)",
                                border: "1px solid rgba(255,255,255,0.15)",
                                borderRadius: 12,
                                color: "white",
                                outline: "none",
                                fontSize: 15,
                                boxSizing: "border-box",
                                transition: "all 0.2s"
                            }}
                            onFocus={(e) => { e.target.style.backgroundColor = "rgba(0,0,0,0.35)"; e.target.style.border = "1px solid rgba(255,255,255,0.4)"; }}
                            onBlur={(e) => { e.target.style.backgroundColor = "rgba(0,0,0,0.25)"; e.target.style.border = "1px solid rgba(255,255,255,0.15)"; }}
                        />
                    </div>

                    <div style={{ position: "relative" }}>
                        <Lock size={18} style={{ position: "absolute", left: 16, top: 15, color: "rgba(255,255,255,0.6)" }} />
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            autoComplete="current-password"
                            style={{
                                width: "100%",
                                padding: "14px 44px 14px 44px",
                                backgroundColor: "rgba(0,0,0,0.25)",
                                border: "1px solid rgba(255,255,255,0.15)",
                                borderRadius: 12,
                                color: "white",
                                outline: "none",
                                fontSize: 15,
                                boxSizing: "border-box",
                                transition: "all 0.2s"
                            }}
                            onFocus={(e) => { e.target.style.backgroundColor = "rgba(0,0,0,0.35)"; e.target.style.border = "1px solid rgba(255,255,255,0.4)"; }}
                            onBlur={(e) => { e.target.style.backgroundColor = "rgba(0,0,0,0.25)"; e.target.style.border = "1px solid rgba(255,255,255,0.15)"; }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(s => !s)}
                            style={{
                                position: "absolute",
                                right: 12,
                                top: 13,
                                background: "none",
                                border: "none",
                                color: "rgba(255,255,255,0.6)",
                                cursor: "pointer",
                                padding: 4
                            }}
                            title={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: 6,
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
                        onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 14px 36px rgba(121, 40, 202, 0.6)"; } }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 10px 30px rgba(121, 40, 202, 0.4)"; }}
                    >
                        <LogIn size={18} />
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                {/* Quick Demo Fill Buttons */}
                <div style={{ marginTop: 26, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.12)" }}>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 10, fontWeight: 500, letterSpacing: "0.4px", textTransform: "uppercase" }}>
                        Quick Demo Logins
                    </div>
                    <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                        <button
                            type="button"
                            onClick={() => fillDemo("dhyey", "123")}
                            style={{
                                flex: 1,
                                padding: "8px 12px",
                                background: "rgba(255, 255, 255, 0.08)",
                                border: "1px solid rgba(255, 255, 255, 0.18)",
                                borderRadius: 10,
                                color: "white",
                                fontSize: 13,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 6,
                                transition: "all 0.2s"
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.16)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)"; }}
                        >
                            <Stethoscope size={14} style={{ color: "#38bdf8" }} />
                            <span><strong>Doctor</strong> (dhyey)</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => fillDemo("admin", "admin")}
                            style={{
                                flex: 1,
                                padding: "8px 12px",
                                background: "rgba(255, 255, 255, 0.08)",
                                border: "1px solid rgba(255, 255, 255, 0.18)",
                                borderRadius: 10,
                                color: "white",
                                fontSize: 13,
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: 6,
                                transition: "all 0.2s"
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.16)"; }}
                            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)"; }}
                        >
                            <ShieldCheck size={14} style={{ color: "#4ade80" }} />
                            <span><strong>Admin</strong> (admin)</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
