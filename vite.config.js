import { defineConfig } from "vite";
import liveReload from "vite-plugin-live-reload";
import scssIndexAuto from "./plugins/scss-index-auto.js";
import imagesWebp from "./plugins/images-webp.js";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd(); // wp-content/themes

function detectThemeName() {
  if (process.env.THEME) return process.env.THEME;

  const dirs = fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter(
      (n) => !["src", "node_modules", "plugins", "scripts", "gulp"].includes(n),
    );

  const candidates = dirs.filter(
    (name) =>
      fs.existsSync(path.join(ROOT, name, "style.css")) &&
      fs.existsSync(path.join(ROOT, name, "functions.php")),
  );

  if (!candidates.length) {
    throw new Error("Theme folder not found. Set THEME=your-theme");
  }
  return candidates[0];
}

const themeName = detectThemeName();

export default defineConfig(() => ({
  server: {
    host: "localhost",
    port: 5173,
    cors: true,
    hmr: { host: "localhost" },
    open: "http://localhost:8080",
  },

  plugins: [
    scssIndexAuto(),
    imagesWebp(),
    liveReload([`${themeName}/**/*.php`]),
  ],

  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: ["src/sass"],
        includePaths: ["src/sass"],
      },
    },
  },

  build: {
    outDir: `${themeName}/assets`,
    emptyOutDir: false,
    rollupOptions: {
      input: "src/main.js",
      output: {
        entryFileNames: "js/script.js", // ←要件「assets/js/main.js（ビルド時）」に合わせた
        chunkFileNames: "js/chunk-[name].js",
        assetFileNames: (assetInfo) => {
          if (
            assetInfo.name === "styles.css" ||
            assetInfo.name === "style.css"
          ) {
            return "css/styles.css";
          }
          return "[ext]/[name][extname]";
        },
      },
    },
  },
}));
