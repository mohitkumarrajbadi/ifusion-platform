import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';

// Define the plugins directory
const pluginsDir = resolve(__dirname, 'src/plugins');

export default defineConfig({
  // Main process configuration
  main: {
    plugins: [externalizeDepsPlugin()],
  },

  // Preload process configuration
  preload: {
    plugins: [externalizeDepsPlugin()],
  },

  // Renderer process configuration
  renderer: {
    resolve: {
      alias: {
        // Alias setup for @renderer and @plugins
        '@renderer': resolve(__dirname, 'src/renderer/src'),
        '@plugins': pluginsDir, // Alias for plugins directory
        'path': 'path-browserify', // Ensure path works in renderer process
      },
    },
    plugins: [react()],
    optimizeDeps: {
      include: ['path-browserify'], // Ensure path-browserify is bundled for renderer
    },
    server: {
      fs: {
        strict: false, // Avoid file system restrictions when accessing plugins
      },
    },
  },
});
