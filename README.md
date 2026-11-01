# Clinic Management System

A full-stack clinic management system with:

- **`backend/`** — Node.js + Express REST API with MongoDB (Mongoose)
- **`frontend/`** — React + Vite SPA

---

## Quick Start

### 1. Prerequisites
- Node.js 18+
- MongoDB running locally on `mongodb://localhost:27017` (or set your Atlas URI in `backend/.env`)

### 2. Backend Setup

```bash
cd backend
npm install
npm run seed      # Populate MongoDB with demo data (dhyey/123)
npm run dev       # Start backend on http://localhost:5000
```

### 3. Frontend Setup

Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev       # Start frontend on http://localhost:5173
```

### 4. Open

Visit `http://localhost:5173`

| Login | Username | Password |
|-------|----------|----------|
| Admin | `admin`  | `admin`  |
| Demo Doctor | `dhyey` | `123` |

---

## Project Structure

```
clinic_management/
├── backend/
│   ├── models/          # Mongoose schemas (Doctor, Family, Patient, Visit, Dietary, Counter)
│   ├── routes/          # Express routers (auth, admin, families, patients, visits, dietary)
│   ├── middleware/       # JWT auth guard
│   ├── utils/helpers.js # Shared utility functions
│   ├── seed.js          # Demo data seeder
│   ├── server.js        # Entry point
│   ├── .env             # MongoDB URI, JWT_SECRET, PORT
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api.js       # Centralized Axios API client (all HTTP calls)
│   │   ├── App.jsx      # Root app + auth routing
│   │   ├── LoginView.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── ClinicApp.jsx  # Main clinic shell
│   │   ├── Dashboard.jsx
│   │   ├── RegisterView.jsx
│   │   ├── CaseEntryView.jsx
│   │   ├── ReportsView.jsx
│   │   └── ...
│   ├── index.html
│   ├── vite.config.js   # /api proxy → localhost:5000
│   └── package.json
└── README.md
```

## Environment Variables (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Backend server port |
| `MONGO_URI` | `mongodb://localhost:27017/clinic_management` | MongoDB connection URI |
| `JWT_SECRET` | _(set a strong value in production)_ | JWT signing secret |
| `JWT_EXPIRES_IN` | `7d` | JWT expiry |