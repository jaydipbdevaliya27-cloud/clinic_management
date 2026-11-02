import React, { useState } from "react";
import ClinicApp from './ClinicApp.jsx';
import LoginView from './LoginView.jsx';
import AdminDashboard from './AdminDashboard.jsx';
import './index.css';

function App() {
    const [authState, setAuthState] = useState(() => {
        try {
            const stored = localStorage.getItem("clinic-auth-session");
            const parsed = stored ? JSON.parse(stored) : null;
            if (!parsed || !parsed.token) {
                localStorage.removeItem("clinic-auth-session");
                return null;
            }
            // Normalize role if missing in old stored session
            if (!parsed.role) {
                const userObj = parsed.profile || parsed.user;
                parsed.role = userObj?.role || (parsed.username === "admin" ? "admin" : "doctor");
            }
            if (parsed.role === "doctor" && !parsed.profile && parsed.user) {
                parsed.profile = parsed.user;
            }
            return parsed;
        } catch (e) {
            return null;
        }
    });

    const handleLogin = (data) => {
        if (!data) return;
        const role = data.role || data.user?.role || (data.profile?.role) || (data.username === "admin" ? "admin" : "doctor");
        const profile = data.profile || data.user || null;
        const normalized = {
            token: data.token || "session-token",
            role,
            profile,
            originalRole: data.originalRole,
        };
        setAuthState(normalized);
        localStorage.setItem("clinic-auth-session", JSON.stringify(normalized));
    };

    const handleLogout = () => {
        setAuthState(null);
        localStorage.removeItem("clinic-auth-session");
    };

    if (!authState) {
        return <LoginView onLogin={handleLogin} />;
    }

    const handleLoginAsDoctor = (doctorProfile) => {
        const data = {
            ...authState,
            originalRole: authState.originalRole || authState.role,
            role: "doctor",
            profile: doctorProfile
        };
        setAuthState(data);
        localStorage.setItem("clinic-auth-session", JSON.stringify(data));
    };

    const handleBackToAdmin = () => {
        const data = {
            ...authState,
            role: "admin",
            profile: null
        };
        setAuthState(data);
        localStorage.setItem("clinic-auth-session", JSON.stringify(data));
    };

    const effectiveRole = authState.role || (authState.profile?.role) || (authState.profile?.username === "admin" ? "admin" : "doctor");

    if (effectiveRole === "admin") {
        return <AdminDashboard onLogout={handleLogout} onLoginAsDoctor={handleLoginAsDoctor} />;
    }

    const handleUpdateDoctorProfile = (updatedProfile) => {
        const newAuthState = { ...authState, profile: updatedProfile };
        setAuthState(newAuthState);
        localStorage.setItem("clinic-auth-session", JSON.stringify(newAuthState));
    };

    const defaultProfile = authState.profile || {
        id: "demo",
        username: "dhyey",
        clinics: [{ id: "demo", name: "Dhyey Clinic" }],
        activeClinicId: "demo"
    };

    return (
        <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
            <ClinicApp
                doctorProfile={defaultProfile}
                onLogout={handleLogout}
                onUpdateDoctorProfile={handleUpdateDoctorProfile}
                onBackToAdmin={authState.originalRole === 'admin' ? handleBackToAdmin : null}
            />
        </div>
    );
}

export default App;
