import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
    plugins: [react()],
    server: {
        host: '0.0.0.0',
        port: 5173,
        // Dev only: proxy /api calls to local backend
        proxy: {
            '/api': {
                target: 'http://127.0.0.1:5000',
                changeOrigin: true,
            }
        }
    },
    // In production, VITE_API_URL defaults to the live Render backend
    define: {
        __API_URL__: JSON.stringify(
            mode === 'production' ? (process.env.VITE_API_URL || 'https://dhyey-clinic.onrender.com') : ''
        )
    }
}))
