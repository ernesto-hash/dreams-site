// client/vite.config.ts
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Força carregar variáveis do .env
  process.env = { ...process.env, ...loadEnv(mode, process.cwd(), '') }
  
  return {
    plugins: [react()],
    server: {
      port: 8080, // Ou 5173
      host: true,
    },
    // Força procurar .env na pasta atual
    envDir: '.',
    envPrefix: 'VITE_',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    // Log para debug
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL),
    },
  }
})