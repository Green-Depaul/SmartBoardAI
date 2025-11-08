
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'build',
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      // Proxy AI calls to Python FastAPI service
      "/api/ai": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
        // Don't rewrite - Python service expects full /api/ai path
      },
      "/api/projects": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
        // Don't rewrite - Python service expects full /api/projects path
      },
      // Proxy board API calls to Spring Boot backend (keep /api prefix)
      "/api/board": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        // Don't rewrite - backend expects full /api/board paths
        rewrite: (path) => {
          console.log(`🔄 Proxying ${path} → ${path}`);
          return path;
        },
      },
      // Proxy other API calls to Spring Boot backend (strip /api prefix)
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        secure: false,
        // Strip the /api prefix for other endpoints like /users, /tasks
        rewrite: (path) => {
          console.log(`🔄 Proxying ${path} → ${path.replace(/^\/api/, "")}`);
          return path.replace(/^\/api/, "");
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      '@radix-ui/react-slot',
      '@radix-ui/react-label',
      '@radix-ui/react-scroll-area',
      'class-variance-authority',
      'clsx',
      'tailwind-merge'
    ]
  }
});
