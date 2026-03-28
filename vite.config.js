import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");
  const backendTarget = env.VITE_BACK_END_URL || "http://localhost:3001";

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
        "/images": {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
})
