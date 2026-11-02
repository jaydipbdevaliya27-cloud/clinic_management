import axios from 'axios';

// In production (Render), __API_URL__ is the backend service URL.
// In dev, it is '' so Vite's proxy handles /api → localhost:5000.
const getBaseUrl = () => {
    let url = '';
    if (typeof __API_URL__ !== 'undefined' && __API_URL__) {
        url = __API_URL__;
    } else if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
        url = import.meta.env.VITE_API_URL;
    }

    if (!url) return '/api';

    // If host was passed without protocol (e.g. Render fromService property: host)
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
    }

    return `${url.replace(/\/+$/, '')}/api`;
};

const BASE = getBaseUrl();

const api = axios.create({ baseURL: BASE });

// Inject JWT token on every request
api.interceptors.request.use((config) => {
    const session = localStorage.getItem('clinic-auth-session');
    if (session) {
        try {
            const { token } = JSON.parse(session);
            if (token) config.headers.Authorization = `Bearer ${token}`;
        } catch { /* ignore */ }
    }
    return config;
});

// Auto-logout on 401 (expired or invalid token)
// IMPORTANT: Do NOT auto-reload if the 401 was returned by the login endpoint itself!
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isLoginRequest = error.config?.url?.includes('/auth/login');
        if (error.response && error.response.status === 401 && !isLoginRequest) {
            localStorage.removeItem('clinic-auth-session');
            window.location.reload();
        }
        return Promise.reject(error);
    }
);

/* ---- Auth ---- */
export const login = (username, password) =>
    api.post('/auth/login', { username, password }).then(r => r.data);

/* ---- Admin ---- */
export const getDoctors = () => api.get('/admin/doctors').then(r => r.data);
export const createDoctor = (data) => api.post('/admin/doctors', data).then(r => r.data);
export const deleteDoctor = (id) => api.delete(`/admin/doctors/${id}`).then(r => r.data);

/* ---- Clinic DB (families + patients + visits) ---- */
export const getClinicDB = (clinicId) =>
    api.get('/families', { params: { clinicId } }).then(r => r.data);

export const getDietary = (clinicId) =>
    api.get('/dietary', { params: { clinicId } }).then(r => r.data);

/* ---- Families ---- */
export const createFamily = (clinicId, headName, area, phone) =>
    api.post('/families', { clinicId, headName, area, phone }).then(r => r.data);

export const deleteFamily = (clinicId, familyCode) =>
    api.delete(`/families/${familyCode}`, { params: { clinicId } }).then(r => r.data);

/* ---- Patients ---- */
export const addPatient = (data) => api.post('/patients', data).then(r => r.data);
export const updatePatient = (clinicId, patientCode, data) =>
    api.patch(`/patients/${patientCode}`, data, { params: { clinicId } }).then(r => r.data);
export const deletePatient = (clinicId, patientCode) =>
    api.delete(`/patients/${patientCode}`, { params: { clinicId } }).then(r => r.data);

/* ---- Visits ---- */
export const addVisit = (data) => api.post('/visits', data).then(r => r.data);
export const updateVisit = (visitId, data) =>
    api.patch(`/visits/${visitId}`, data).then(r => r.data);

/* ---- Dietary ---- */
export const addDietary = (clinicId, code, text) =>
    api.post('/dietary', { clinicId, code, text }).then(r => r.data);
export const deleteDietary = (clinicId, code) =>
    api.delete(`/dietary/${code}`, { params: { clinicId } }).then(r => r.data);
