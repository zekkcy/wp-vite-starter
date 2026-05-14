import fs from "node:fs/promises";
import fssync from "node:fs";
import path from "node:path";
import fg from "fast-glob";

export default function scssIndexAuto() {
  const ROOT = process.cwd();
  const BASE = path.join(ROOT, "src/sass");
  const STYLE_ENTRY = path.join(ROOT, "src/sass/styles.scss");

  // 自動検出したいトップ階層（存在するものだけ対象）
  const TOPS = ["global", "foundation", "layout", "object"];

  const posix = (p) => p.replaceAll("\\", "/");

  const exists = (p) => {
    try {
      return fssync.existsSync(p);
    } catch {
      return false;
    }
  };

  async function ensureDir(dir) {
    await fs.mkdir(dir, { recursive: true });
  }

  // _index.scss 更新後に styles.scss をtouchしてHMRを確実に発火
  async function touchStyles() {
    const now = new Date();
    try {
      await fs.utimes(STYLE_ENTRY, now, now);
    } catch (e) {
      console.warn("[vite] touch styles.scss failed:", e?.message || e);
    }
  }

  /**
   * そのディレクトリの _index.scss を生成
   * - 直下の _*.scss を @forward
   * - 直下のサブディレクトリで「_index.scss が存在する」ものも @forward
   */
  async function genIndexForDir(dirAbs) {
    await ensureDir(dirAbs);

    // 1) 直下の partial (_*.scss)
    const partials = await fg([posix(path.join(dirAbs, "_*.scss"))], {
      onlyFiles: true,
    });

    const partialNames = partials
      .map((f) => path.basename(f))
      .filter((f) => f !== "_index.scss")
      .map((f) => f.replace(/^_/, "").replace(/\.scss$/i, ""));

    // 2) 直下のサブフォルダ（_index.scss を持つものだけ）
    const subDirs = await fg([posix(path.join(dirAbs, "*/"))], {
      onlyDirectories: true,
    });

    const subDirNames = subDirs
      .map((d) => d.replaceAll("\\", "/"))
      .map((d) => d.replace(/\/$/, ""))
      .map((d) => path.basename(d))
      .filter((name) => {
        // サブフォルダ配下に _index.scss があるなら forward 対象
        const idx = path.join(dirAbs, name, "_index.scss");
        return exists(idx);
      });

    // forward一覧：サブフォルダ → partial の順
    const names = [...subDirNames, ...partialNames]
      .filter(Boolean)
      .filter((v, i, a) => a.indexOf(v) === i); // uniq

    const out = names.map((n) => `@forward "${n}";`).join("\n");
    const outPath = path.join(dirAbs, "_index.scss");

    let prev = "";
    try {
      prev = await fs.readFile(outPath, "utf8");
    } catch {}

    if (prev.trim() !== out.trim()) {
      await fs.writeFile(outPath, out + (out ? "\n" : ""), "utf8");
      console.log(
        "[vite] scss index generated:",
        posix(path.relative(ROOT, outPath)),
      );
      return true;
    }
    return false;
  }

  async function buildAll() {
    const dirs = [];

    for (const top of TOPS) {
      const topAbs = path.join(BASE, top);
      if (!exists(topAbs)) continue;

      dirs.push(topAbs);

      // 1階層下まで（object/component など）
      const sub = await fg([posix(path.join(topAbs, "*/"))], {
        onlyDirectories: true,
      });
      dirs.push(...sub);
    }

    let changed = false;
    for (const d of dirs) {
      const c = await genIndexForDir(d);
      if (c) changed = true;
    }
    return changed;
  }

  return {
    name: "scss-index-auto",

    // ✅ devでもbuildでも必ず生成（build時に生成されない事故を防ぐ）
    async buildStart() {
      const changed = await buildAll();
      if (changed) await touchStyles();
    },

    async configureServer(server) {
      console.log("[vite] scss index auto enabled");

      // 起動時に一回
      const initChanged = await buildAll();
      if (initChanged) await touchStyles();

      server.watcher.add("src/sass/**/*.scss");

      let timer = null;
      let running = false;
      let queued = false;

      const schedule = () => {
        clearTimeout(timer);
        timer = setTimeout(async () => {
          if (running) {
            queued = true;
            return;
          }
          running = true;
          try {
            const changed = await buildAll();
            if (changed) await touchStyles();
          } finally {
            running = false;
            if (queued) {
              queued = false;
              schedule();
            }
          }
        }, 120);
      };

      const should = (file) =>
        file.endsWith(".scss") && !file.endsWith("_index.scss");

      server.watcher.on("add", (file) => should(file) && schedule());
      server.watcher.on("unlink", (file) => should(file) && schedule());
      server.watcher.on("change", (file) => should(file) && schedule());
    },
  };
}
