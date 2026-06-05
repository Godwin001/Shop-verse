import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import babel from '@rolldown/plugin-babel'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    babel({ 
      presets: [reactCompilerPreset()] 
    })
  ],
 server: {
    host: '0.0.0.0', // Broadcasts the server so the tunnel can find it
    port: 5173,
    strictPort: true,
    allowedHosts: true, // Disables Vite's host checking walls
    
    // THE SECRET FIX: This forces Vite's code injector to use secure websockets
    // compatible with localtunnel's safety proxy
    hmr: {
      protocol: 'ws',
      host: 'localhost',
    },
  },
  build: {
    chunkSizeWarningLimit: 5000,

  }
  
})

