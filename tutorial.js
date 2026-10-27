/* ==========================================================================
   Desktop Agent · 教程页交互
   仅原生 JS，无外部依赖
   ========================================================================== */
(function () {
  "use strict";

  var toc = document.getElementById("tutToc");
  var top = document.getElementById("tutTop");
  if (!toc) return;

  var links = Array.prototype.slice.call(toc.querySelectorAll("a[href^='#']"));
  var targets = links
    .map(function (a) { return document.getElementById(a.getAttribute("href").slice(1)); })
    .filter(Boolean);

  /* 1. 滚动高亮当前小节 */
  function currentId() {
    var y = window.scrollY + 120;
    var hit = null;
    for (var i = 0; i < targets.length; i++) {
      if (targets[i].offsetTop <= y) hit = targets[i];
    }
    if (!hit && targets.length) hit = targets[0];
    return hit ? hit.id : null;
  }

  function syncToc() {
    var id = currentId();
    links.forEach(function (a) {
      a.classList.toggle("is-active", a.getAttribute("href") === "#" + id);
    });
    if (top) top.classList.toggle("is-on", window.scrollY > 420);
  }

  var ticking = false;
  window.addEventListener(
    "scroll",
    function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        syncToc();
        ticking = false;
      });
    },
    { passive: true }
  );
  syncToc();

  /* 2. 点击目录：平滑滚动（尊重 prefers-reduced-motion） */
  links.forEach(function (a) {
    a.addEventListener("click", function (e) {
      var el = document.getElementById(a.getAttribute("href").slice(1));
      if (!el) return;
      e.preventDefault();
      var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - 92,
        behavior: reduce ? "auto" : "smooth"
      });
      if (history.replaceState) history.replaceState(null, "", a.getAttribute("href"));
    });
  });

  /* 3. 回到顶部 */
  if (top) {
    top.addEventListener("click", function () {
      var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
  }

  /* 4. 带 hash 打开时定位到小节 */
  if (location.hash) {
    var el = document.getElementById(location.hash.slice(1));
    if (el) {
      window.requestAnimationFrame(function () {
        window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 92, behavior: "auto" });
      });
    }
  }
})();
