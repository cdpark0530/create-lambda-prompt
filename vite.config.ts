import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { externalizeDeps } from "vite-plugin-externalize-deps";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [react(), externalizeDeps(), tsconfigPaths()],
	build: {
		target: ["node16", "node18", "node20"],
		lib: {
			fileName: "index",
			entry: resolve(__dirname, "./src/index.tsx"),
			name: "index",
			formats: ["es"],
		},
	},
});
