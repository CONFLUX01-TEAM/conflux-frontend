import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
   server: {
    port: 3000, // Replace with your preferred port number
    strictPort: true, // Optional: Force Vite to exit if the port is already in use
  }
})
