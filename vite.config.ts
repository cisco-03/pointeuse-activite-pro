import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        // Optimisations pour la production
        rollupOptions: {
          output: {
            manualChunks: {
              // Séparer Firebase dans son propre chunk
              firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/analytics'],
              // Séparer React dans son propre chunk
              react: ['react', 'react-dom']
            }
          }
        },
        // Optimiser la taille des chunks
        chunkSizeWarningLimit: 1000,
        // Minification avancée
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: mode === 'production',
            drop_debugger: mode === 'production'
          }
        }
      }
    };
});
