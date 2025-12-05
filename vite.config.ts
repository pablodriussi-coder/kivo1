import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carga las variables de entorno desde el archivo .env
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Hace disponible process.env.API_KEY en el código del cliente
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    },
    server: {
      host: true // Permite acceso desde la red (útil para probar en móvil)
    }
  };
});