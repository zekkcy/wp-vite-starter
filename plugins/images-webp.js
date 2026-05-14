import fg from "fast-glob";
import path from "node:path";
import fs from "node:fs/promises";
import fssync from "node:fs";
import sharp from "sharp";

async function isSharpReadable(file) {
  try {
    const meta = await sharp(file).metadata();
    return !!meta.format;
  } catch {
    return false;
  }
}

export default function imagesWebp() {
  const ROOT = process.cwd();
  const SRC = path.join(ROOT, "src/images");
  const STYLE_ENTRY = path.join(ROOT, "src/sass/styles.scss");

  function detectThemeName() {
    if (process.env.THEME) return process.env.THEME;

    const dirs = fssync
      .readdirSync(ROOT, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .filter(
        (n) =>
          !["src", "node_modules", "plugins", "scripts", "gulp"].includes(n),
      );

    const candidates = dirs.filter(
      (name) =>
        fssync.existsSync(path.join(ROOT, name, "style.css")) &&
        fssync.existsSync(path.join(ROOT, name, "functions.php")),
    );

    if (!candidates.length)
      throw new Error("Theme not found. Set THEME=your-theme");
    return candidates[0];
  }

  const THEME = detectThemeName();
  const DIST = path.join(ROOT, `${THEME}/assets/images`);

  async function ensureDir(p) {
    await fs.mkdir(p, { recursive: true });
  }
  async function rmSafe(p) {
    try {
      await fs.rm(p, { force: true });
    } catch {}
  }

  async function touchStyles() {
    const now = new Date();
    try {
      await fs.utimes(STYLE_ENTRY, now, now);
    } catch (e) {
      // styles.scss が無い/権限など → 画像HMRだけでも動くので警告だけ
      console.warn("[images] touchStyles failed:", e?.message || e);
    }
  }

  // Vite watcher の file が「絶対/相対」どっちでも SRC 配下か判定して、絶対パスを返す
  function toAbsIfInSrc(file) {
    const abs = path.isAbsolute(file) ? file : path.join(ROOT, file);
    const rel = path.relative(SRC, abs);
    if (rel.startsWith("..") || path.isAbsolute(rel)) return null;
    return abs;
  }

  async function build() {
    await ensureDir(DIST);

    // jpg/png → webp
    const rasters = await fg(
      [`${SRC.replaceAll("\\", "/")}/**/*.{jpg,jpeg,png}`],
      { caseSensitiveMatch: false },
    );

    for (const file of rasters) {
      const rel = path.relative(SRC, file);
      const out = path.join(DIST, rel).replace(/\.(jpe?g|png)$/i, ".webp");

      const ok = await isSharpReadable(file);
      if (!ok) {
        console.warn("[images] skip (unsupported/broken):", rel);
        await rmSafe(out); // 古い生成物が残らないように
        continue;
      }

      try {
        await ensureDir(path.dirname(out));
        await sharp(file).webp({ quality: 80, effort: 4 }).toFile(out);
      } catch (e) {
        console.warn("[images] convert failed:", rel, e?.message || e);
        await rmSafe(out);
      }
    }

    // svg copy
    const svgs = await fg([`${SRC.replaceAll("\\", "/")}/**/*.svg`], {
      caseSensitiveMatch: false,
    });

    for (const file of svgs) {
      const rel = path.relative(SRC, file);
      const out = path.join(DIST, rel);
      await ensureDir(path.dirname(out));
      await fs.copyFile(file, out);
    }

    console.log("[vite] images processed");
  }

  async function removeGenerated(absFile) {
    const rel = path.relative(SRC, absFile);
    if (rel.startsWith("..")) return;

    const isRaster = /\.(jpe?g|png)$/i.test(absFile);
    const isSvg = /\.svg$/i.test(absFile);

    if (isRaster) {
      const out = path.join(DIST, rel).replace(/\.(jpe?g|png)$/i, ".webp");
      await rmSafe(out);
      console.log("[vite] removed:", out);
    } else if (isSvg) {
      const out = path.join(DIST, rel);
      await rmSafe(out);
      console.log("[vite] removed:", out);
    }
  }

  return {
    name: "images-webp",
    configureServer(server) {
      build();

      server.watcher.add("src/images/**/*");

      let running = false;
      let queued = false;
      let timer = null;

      async function runBuild() {
        if (running) {
          queued = true;
          return;
        }
        running = true;

        try {
          await build();

          // ✅ imgタグ用：画像が更新されたことをViteクライアントへ通知
          server.ws.send({
            type: "custom",
            event: "images-updated",
            data: { t: Date.now() },
          });

          // ✅ CSS背景用：CSS HMRを発火（ページリロード無し）
          await touchStyles();
        } finally {
          running = false;
          if (queued) {
            queued = false;
            runBuild();
          }
        }
      }

      const schedule = () => {
        clearTimeout(timer);
        timer = setTimeout(runBuild, 250);
      };

      server.watcher.on("add", (file) => {
        const abs = toAbsIfInSrc(file);
        if (!abs) return;
        schedule();
      });

      server.watcher.on("change", (file) => {
        const abs = toAbsIfInSrc(file);
        if (!abs) return;
        schedule();
      });

      server.watcher.on("unlink", async (file) => {
        const abs = toAbsIfInSrc(file);
        if (!abs) return;

        await removeGenerated(abs);
        schedule();
      });
    },
  };
}
