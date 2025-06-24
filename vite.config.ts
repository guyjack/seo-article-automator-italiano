import { webcrypto as crypto } from 'crypto';
if (!globalThis.crypto) {
  globalThis.crypto = crypto;
}
if (!globalThis.crypto.getRandomValues) {
  globalThis.crypto.getRandomValues = function(buffer) {
    return crypto.getRandomValues(buffer);
  };
}
// Aggiungi in cima al file vite.config.js o main.js
import { webcrypto as crypto } from 'crypto';
if (!globalThis.crypto) globalThis.crypto = crypto;
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
