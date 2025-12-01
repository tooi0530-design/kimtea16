import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // 코드가 process.env.API_KEY를 사용할 수 있도록 환경 변수 주입
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});