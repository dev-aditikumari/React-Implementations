import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// A relative base works on GitHub Pages (project sites live under /<repo>/)
// and in local dev and preview. Routing uses the hash, so no server rewrites are needed.
export default defineConfig({
  base: './',
  plugins: [react()],
});
