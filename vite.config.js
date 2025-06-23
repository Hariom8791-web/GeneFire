import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // (if using React)

export default defineConfig({
  plugins: [react()], // (if using React)
  server: {
    allowedHosts: [
      '6d56-2405-201-4019-693a-199d-c860-a86d-e9ca.ngrok-free.app', // Your ngrok URL
    ],
  },
})