# Dhyey Clinic Management System

A modern, fast, and fully offline-capable Patient & Clinic Management System built with React and Vite.

## Features
- **Family & Patient Registration:** Manage patients grouped by families uniquely identified by custom generated IDs (FAM XXXX, PT XXXX).
- **Patient Records & Visit Histories:** Searchable UI to view detailed records of all past patient visits (Diagnosis, BP, Weight, Complaints, Treatment, Prescriptions).
- **Robust Financial Tracking:** Tracks custom bills, amounts received, and balances due.
- **Reporting Analytics:** Generate 9 distinct dynamic reports (Daily Income, Patient Dues, Area-wise, Diagnosis-wise, Medical Certificates, etc).
- **Multilingual Prescription Generation:** Print beautiful prescriptions automatically localized to English, Hindi, or Gujarati.
- **Dietary Advice Library:** Create shortcut codes (e.g., "DB", "CV") for diet plans that can instantly be appended to prescriptions.

## Hosting & Deployment (Render)
This project is configured out of the box to be hosted on [Render](https://render.com).

### Option 1: Render Blueprint (Recommended)
1. Commit and push this project to a GitHub repository.
2. Log into Render and click **New -> Blueprint**.
3. Select your repository. Render will automatically read the included `render.yaml` file and deploy the system perfectly as a static site.

### Option 2: Render Static Site
1. Create a **New Static Site** on Render.
2. Set the Build Command to: `npm install && npm run build`
3. Set the Publish Directory to: `dist`

## Local Development
1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Build for production: `npm run build`

## Data Storage
The system is designed to run in a browser and heavily utilizes standard browser `localStorage` under the `clinic-db` key. In production, ensure users do not arbitrarily clear their browser data, or routinely export the DB state.