/* ==========================================================================
   Cartera — mazo de cartas (Swiper effect: cards)
   Solo en responsive (≤900px). En desktop se muestra el showcase/lista.
   Al deslizar la carta de arriba, pasa al final del mazo.
   ========================================================================== */
(function () {
  "use strict";

  if (typeof window.Swiper === "undefined") return;

  var MQ = "(max-width: 900px)";
  var media = window.matchMedia(MQ);

  function syncCount(root, swiper) {
    var current = root.querySelector("[data-deck-current]");
    var total = root.querySelector("[data-deck-total]");
    var n = swiper.slides.length;
    if (total) total.textContent = String(n);
    if (current) {
      var top = swiper.slides[swiper.activeIndex];
      var numEl = top && top.querySelector(".deck-card__num");
      var parsed = numEl ? parseInt(numEl.textContent, 10) : NaN;
      current.textContent = String(Number.isFinite(parsed) ? parsed : swiper.activeIndex + 1);
    }
  }

  function sendPassedToEnd(swiper) {
    var wrapper = swiper.wrapperEl;
    var guard = 0;
    while (swiper.activeIndex > 0 && guard < swiper.slides.length) {
      wrapper.appendChild(swiper.slides[0]);
      swiper.slideTo(0, 0, false);
      guard += 1;
    }
    swiper.update();
  }

  function pullLastToFront(swiper) {
    if (swiper.slides.length < 2) return;
    var last = swiper.slides[swiper.slides.length - 1];
    swiper.wrapperEl.insertBefore(last, swiper.slides[0]);
    swiper.slideTo(0, 0, false);
    swiper.update();
  }

  function initDeck(root) {
    var el = root.querySelector(".swiper");
    if (!el || el.swiper) return;

    var touchStartX = null;
    var cycled = false;

    var swiper = new Swiper(el, {
      effect: "cards",
      grabCursor: true,
      speed: 520,
      cardsEffect: {
        perSlideOffset: 10,
        perSlideRotate: 2.5,
        rotate: true,
        slideShadows: false,
      },
      keyboard: { enabled: true, onlyInViewport: true },
      resistanceRatio: 0.65,
      preventClicks: true,
      preventClicksPropagation: true,
      on: {
        init: function (sw) {
          syncCount(root, sw);
        },
        slideNextTransitionStart: function () {
          cycled = false;
        },
        slideNextTransitionEnd: function (sw) {
          if (cycled) return;
          cycled = true;
          sendPassedToEnd(sw);
          syncCount(root, sw);
        },
        touchStart: function (sw, e) {
          var t = e.touches && e.touches[0] ? e.touches[0] : e;
          touchStartX = typeof t.clientX === "number" ? t.clientX : null;
        },
        touchEnd: function (sw, e) {
          if (touchStartX == null || sw.animating) return;
          var t = e.changedTouches && e.changedTouches[0] ? e.changedTouches[0] : e;
          var endX = typeof t.clientX === "number" ? t.clientX : null;
          if (endX == null) return;
          var dx = endX - touchStartX;
          if (dx > 90 && sw.activeIndex === 0) {
            pullLastToFront(sw);
            syncCount(root, sw);
          }
          touchStartX = null;
        },
      },
    });

    var prev = root.querySelector("[data-deck-prev]");
    var next = root.querySelector("[data-deck-next]");

    if (next) {
      next.addEventListener("click", function () {
        if (swiper.animating) return;
        swiper.slideNext();
      });
    }

    if (prev) {
      prev.addEventListener("click", function () {
        if (swiper.animating) return;
        pullLastToFront(swiper);
        syncCount(root, swiper);
      });
    }
  }

  function destroyDecks() {
    document.querySelectorAll("[data-deck] .swiper").forEach(function (el) {
      if (el.swiper) el.swiper.destroy(true, true);
    });
  }

  function syncMode() {
    if (media.matches) {
      document.querySelectorAll("[data-deck]").forEach(initDeck);
    } else {
      destroyDecks();
    }
  }

  function boot() {
    syncMode();
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", syncMode);
    } else if (typeof media.addListener === "function") {
      media.addListener(syncMode);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
