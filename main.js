/* ==========================================================================
   Desktop Agent 官网交互 · 2026-11 重设计
   仅原生 JS，无外部依赖（境内无 CDN 阻塞）
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------
     1. 导航：滚动描边 + 移动端菜单
     ------------------------------------------------------------------ */
  var nav = document.getElementById("nav");
  var burger = document.getElementById("navBurger");
  var links = document.getElementById("navLinks");

  function onScroll() {
    if (!nav) return;
    nav.classList.toggle("is-stuck", window.scrollY > 12);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (burger && links) {
    burger.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        links.classList.remove("is-open");
        burger.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ------------------------------------------------------------------
     2. 滚动揭示（IntersectionObserver，带错峰）
     ------------------------------------------------------------------ */
  var rvs = document.querySelectorAll(".rv");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var el = en.target;
          var sibs = Array.prototype.filter.call(
            el.parentNode.children,
            function (c) { return c.classList && c.classList.contains("rv"); }
          );
          var idx = sibs.indexOf(el);
          el.style.transitionDelay = Math.min(idx, 6) * 55 + "ms";
          el.classList.add("in");
          io.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    rvs.forEach(function (el) { io.observe(el); });
  } else {
    rvs.forEach(function (el) { el.classList.add("in"); });
  }

  /* ------------------------------------------------------------------
     3. 数字滚动（数据条）
     ------------------------------------------------------------------ */
  var counters = document.querySelectorAll("[data-count]");
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    if (reduceMotion) { el.textContent = String(target); return; }
    var dur = 1100;
    var t0 = null;
    function tick(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); /* easeOutCubic */
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          animateCount(en.target);
          cio.unobserve(en.target);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* ------------------------------------------------------------------
     4. 产品实拍 Tabs
     ------------------------------------------------------------------ */
  var tabs = document.querySelectorAll(".show__tab");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) {
        t.classList.remove("is-on");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-on");
      tab.setAttribute("aria-selected", "true");
      document.querySelectorAll(".show__panel").forEach(function (p) {
        p.classList.toggle("is-on", p.id === tab.getAttribute("data-panel"));
      });
    });
  });

  /* ------------------------------------------------------------------
     5. 平滑锚点（补偿 sticky 导航高度）
     ------------------------------------------------------------------ */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var y = target.getBoundingClientRect().top + window.scrollY - 78;
      window.scrollTo({ top: y, behavior: reduceMotion ? "auto" : "smooth" });
      history.replaceState(null, "", id);
    });
  });
})();
