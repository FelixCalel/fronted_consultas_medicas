import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'url'
import dotenv from 'dotenv'

dotenv.config()

if (!process.env.VITE_PORT) {
  throw new Error("La variable de entorno VITE_PORT no está definida en el archivo .env")
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    port: parseInt(process.env.VITE_PORT),
    cors: true,
  },
})
