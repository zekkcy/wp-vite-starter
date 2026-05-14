(function ($) {
  // HMRで同じ処理が二重に走らないように一度解除してから付ける
  const NS = ".vite"; // 名前空間

  // ページトップボタン
  const topBtn = $(".js-pagetop");
  topBtn.hide();

  // 既存イベント解除 → 再登録
  $(window)
    .off("scroll" + NS)
    .on("scroll" + NS, function () {
      if ($(this).scrollTop() > 70) {
        topBtn.fadeIn();
      } else {
        topBtn.fadeOut();
      }
    });

  topBtn.off("click" + NS).on("click" + NS, function () {
    $("body,html").animate({ scrollTop: 0 }, 300, "swing");
    return false;
  });

  // スムーススクロール
  $(document)
    .off("click" + NS, 'a[href*="#"]')
    .on("click" + NS, 'a[href*="#"]', function () {
      const time = 400;
      const header = $("header").innerHeight() || 0;
      const target = $(this.hash);
      if (!target.length) return;

      const targetY = target.offset().top - header;
      $("html,body").animate({ scrollTop: targetY }, time, "swing");
      return false;
    });

  console.log("end");
})(jQuery);
