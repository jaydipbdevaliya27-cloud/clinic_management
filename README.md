# Clinic Management System

A full-stack clinic management system built with:

- **`backend/`** — Node.js + Express REST API with MongoDB (Mongoose) and JWT Authentication
- **`frontend/`** — React 19 + Vite SPA with Lucide Icons and responsive medical workflow UI

---

## Quick Start (One Command)

From the project root:

```bash
# 1. Install dependencies for both backend and frontend
npm run install:all

# 2. Seed database with demo records
npm run seed

# 3. Start both backend and frontend concurrently
npm run dev
```

The frontend will be available at `http://localhost:5173` and backend at `http://localhost:5000`.

---

## Running Separately (Alternative)

### 1. Backend Setup

```bash
cd backend
npm install
node seed.js      # Populates MongoDB with demo data
npm run dev       # Starts backend on http://localhost:5000
```

### 2. Frontend Setup

Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev       # Starts frontend on http://localhost:5173
```

---

## Demo Credentials

You can test with the pre-seeded accounts (or use the one-click demo fill buttons on the login page):

| Role | Username | Password | Access / Features |
|------|----------|----------|-------------------|
| **Admin** | `admin` | `admin` | Doctor management, create/delete clinics, switch to doctor view |
| **Doctor** | `dhyey` | `123` | Patient registrations, visits, case sheets, prescriptions, reports |

---

## Project Structure

```
clinic_management/
├── backend/
│   ├── models/          # Mongoose schemas (Doctor, Family, Patient, Visit, Dietary, Counter)
│   ├── routes/          # Express routers (auth, admin, families, patients, visits, dietary)
│   ├── middleware/      # JWT auth guard
│   ├── utils/helpers.js # Shared utility functions
│   ├── seed.js          # Demo data seeder
│   ├── server.js        # Server entry point
│   ├── .env.example     # Environment template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api.js       # Centralized Axios API client (JWT interceptors & dynamic base URL)
│   │   ├── App.jsx      # Root app + auth routing & state management
│   │   ├── LoginView.jsx# Modern login interface with demo-fill shortcuts
│   │   ├── AdminDashboard.jsx
│   │   ├── ClinicApp.jsx# Main clinic workspace shell
│   │   ├── Dashboard.jsx
│   │   ├── RegisterView.jsx
│   │   ├── CaseEntryView.jsx
│   │   ├── ReportsView.jsx
│   │   └── ...
│   ├── index.html
│   ├── vite.config.js   # /api proxy → localhost:5000
│   └── package.json
│
├── dev.js               # Concurrent development runner
├── package.json         # Root runner scripts
└── render.yaml          # Render deployment blueprint
```

---

## Environment Variables (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Backend server port |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/clinic_management` | MongoDB connection URI (Atlas or local) |
| `JWT_SECRET` | `dhyey_clinic_super_secret_key_2024` | JWT signing secret |
| `JWT_EXPIRES_IN` | `7d` | JWT token expiration |
| `FRONTEND_URL` | `http://localhost:5173` | Allowed frontend origin for CORS |
