import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    // Tests always exercise the mock store, even if the shell exports
    // VITE_DATA_SOURCE=supabase (test.env feeds import.meta.env).
    env: { VITE_DATA_SOURCE: "mock" },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
