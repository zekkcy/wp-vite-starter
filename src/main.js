import "./sass/styles.scss";
import "./js/vendor.js";
import "./js/script.js";
import "./js/swiper.js";

// 画像が更新されたら、img/srcset をキャッシュバスター付きで差し替える
if (import.meta.hot) {
  import.meta.hot.on("images-updated", ({ t }) => {
    const bust = (url) => {
      try {
        const u = new URL(url, window.location.href);
        u.searchParams.set("t", t);
        return u.toString();
      } catch {
        return url;
      }
    };

    // <img src="">
    document.querySelectorAll("img").forEach((img) => {
      if (img.src) img.src = bust(img.src);
    });

    // <source srcset=""> (picture対応)
    document.querySelectorAll("source").forEach((s) => {
      const srcset = s.getAttribute("srcset");
      if (!srcset) return;

      // srcset は "url 1x, url 2x" みたいな形式なので分解して付け直す
      const next = srcset
        .split(",")
        .map((part) => part.trim())
        .map((part) => {
          const [u, d] = part.split(/\s+/);
          return [bust(u), d].filter(Boolean).join(" ");
        })
        .join(", ");

      s.setAttribute("srcset", next);
    });
  });
}
