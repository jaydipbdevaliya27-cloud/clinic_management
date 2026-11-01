import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
    plugins: [react()],
    server: {
        port: 5173,
        // Dev only: proxy /api calls to local backend
        proxy: {
            '/api': {
                target: 'http://localhost:5000',
                changeOrigin: true,
            }
        }
    },
    // In production, VITE_API_URL is set to backend Render URL
    // e.g. https://clinic-management-backend.onrender.com
    define: {
        __API_URL__: JSON.stringify(
            mode === 'production' ? (process.env.VITE_API_URL || '') : ''
        )
    }
}))
