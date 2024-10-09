import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Bind to all IP addresses (makes it accessible from outside the container)
    port: 5173,       // Specify the port to use
  },
})
