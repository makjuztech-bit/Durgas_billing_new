import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

function getActiveBackendTarget(): string {
  try {
    const portFile = path.resolve(import.meta.dirname, "./backend/active_port.json");
    if (fs.existsSync(portFile)) {
      const data = JSON.parse(fs.readFileSync(portFile, "utf-8"));
      if (data?.port) return `http://127.0.0.1:${data.port}`;
    }
  } catch (e) {
    // fallback
  }
  return "http://127.0.0.1:5000";
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "./",
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api": {
        target: getActiveBackendTarget(),
        changeOrigin: true,
        router: () => getActiveBackendTarget(),
      },
    },
    hmr: {
      overlay: false,
    },
  },
  build: {
    target: "es2022",
    chunkSizeWarningLimit: 1500,
    cssCodeSplit: true,
    minify: "esbuild",
    cssMinify: true,
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom") || id.includes("react-router-dom")) {
              return "vendor-react";
            }
            if (id.includes("@radix-ui") || id.includes("lucide-react") || id.includes("cmdk") || id.includes("sonner")) {
              return "vendor-ui";
            }
            if (id.includes("recharts") || id.includes("d3-")) {
              return "vendor-charts";
            }
            if (
              id.includes("jspdf") ||
              id.includes("xlsx") ||
              id.includes("file-saver") ||
              id.includes("react-barcode") ||
              id.includes("react-to-print")
            ) {
              return "vendor-export";
            }
            return "vendor-utils";
          }
        },
      },
    },
  },
  // esbuild is removed to avoid conflicts
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
}));
