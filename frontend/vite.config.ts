/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		host: "0.0.0.0",
		port: 5173,
		strictPort: true,
		allowedHosts: true,
		proxy: {
			// Только CloudPayments API
			"/api": {
				target: "http://localhost:8000",
				changeOrigin: true,
				secure: false,
			},
		},
	},
	build: {
		outDir: "dist",
	},
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: "./src/setupTests.ts",
	},
});
