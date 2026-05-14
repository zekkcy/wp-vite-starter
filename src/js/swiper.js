import Swiper from "swiper/bundle";
import "swiper/css/bundle";

// 例：必要な初期化だけ書く（あなたのHTMLに合わせて調整）
document.addEventListener("DOMContentLoaded", () => {
  const el = document.querySelector(".swiper");
  if (!el) return;

  new Swiper(el, {
    loop: true,
    // pagination: { el: ".swiper-pagination", clickable: true },
    // navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
  });
});
