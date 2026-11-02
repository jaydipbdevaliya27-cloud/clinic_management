import React, { useState } from "react";
import ClinicApp from './ClinicApp.jsx'
import LoginView from './LoginView.jsx'
import AdminDashboard from './AdminDashboard.jsx'
import './index.css'

function App() {
    const [authState, setAuthState] = useState(() => {
        try {
            const stored = localStorage.getItem("clinic-auth-session");
            const parsed = stored ? JSON.parse(stored) : null;
            // Reject old sessions that don't have a JWT token (pre-backend era)
            if (parsed && !parsed.token) {
                localStorage.removeItem("clinic-auth-session");
                return null;
            }
            return parsed;
        } catch (e) { return null; }
    });

    const handleLogin = (data) => {
        setAuthState(data);
        localStorage.setItem("clinic-auth-session", JSON.stringify(data));
    };

    const handleLogout = () => {
        setAuthState(null);
        localStorage.removeItem("clinic-auth-session");
    };

    if (!authState) {
        return <LoginView onLogin={handleLogin} />;
    }

    const handleLoginAsDoctor = (doctorProfile) => {
        const data = { ...authState, role: "doctor", profile: doctorProfile };
        setAuthState(data);
        localStorage.setItem("clinic-auth-session", JSON.stringify(data));
    };

    if (authState.role === "admin") {
        return <AdminDashboard onLogout={handleLogout} onLoginAsDoctor={handleLoginAsDoctor} />;
    }

    const handleUpdateDoctorProfile = (updatedProfile) => {
        const newAuthState = { ...authState, profile: updatedProfile };
        setAuthState(newAuthState);
        localStorage.setItem("clinic-auth-session", JSON.stringify(newAuthState));
    };

    if (authState.role === "doctor") {
        return (
            <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
                <ClinicApp
                    doctorProfile={authState.profile}
                    onLogout={handleLogout}
                    onUpdateDoctorProfile={handleUpdateDoctorProfile}
                />
            </div>
        );
    }

    return null;
}

export default App
