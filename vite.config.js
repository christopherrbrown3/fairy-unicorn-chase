import { defineConfig } from "vite";
import { offlineGame } from "./tools/pwa.mjs";
export default defineConfig({ base: "./", plugins: [offlineGame()], build: { target: "es2022" } });
