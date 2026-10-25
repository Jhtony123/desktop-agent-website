/* ==========================================================================
   Desktop Agent 官网交互
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
    // 点任意链接后收起
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
          // 同批兄弟节点错峰，避免整排同时弹出
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
     3. 卡片光晕跟随鼠标（--mx / --my）
     ------------------------------------------------------------------ */
  if (!reduceMotion) {
    document.querySelectorAll(".cell, .pillar, .scene").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
        card.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
      });
    });
  }

  /* ------------------------------------------------------------------
     4. 数字滚动
     ------------------------------------------------------------------ */
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count") || "0");
    var suffix = el.querySelector("small");
    var sfx = suffix ? suffix.outerHTML : "";
    if (target === 0 || reduceMotion) {
      el.innerHTML = target + sfx;
      return;
    }
    var dur = 1100, t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.innerHTML = Math.round(target * eased) + sfx;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var stats = document.querySelectorAll(".stat__v[data-count]");
  if ("IntersectionObserver" in window) {
    var sio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { countUp(en.target); sio.unobserve(en.target); }
        });
      },
      { threshold: 0.5 }
    );
    stats.forEach(function (el) { sio.observe(el); });
  } else {
    stats.forEach(countUp);
  }

  /* ------------------------------------------------------------------
     5. 终端打字演示
     ------------------------------------------------------------------ */
  var demo = {
    prompt: "把竞品官网的价格页抓下来，整理成对比表",
    lines: [
      { id: "termOut1", cls: "t-ok", text: "✓ 命中技能 scrapling · 已激活工具组" },
      { id: "termOut2", cls: "t-o",  text: "  抓取 3 页 → 解析 12 档套餐 → output/tables/pricing.xlsx" },
      { id: "termOut3", cls: "t-c",  text: "  已固化为脚本，可挂 cron 每周复跑" }
    ]
  };

  var target = document.getElementById("typeTarget");
  if (target) {
    var play = function () {
      if (reduceMotion) {
        target.textContent = demo.prompt;
        demo.lines.forEach(function (l) {
          var el = document.getElementById(l.id);
          if (el) { el.textContent = l.text; el.className = l.cls; }
        });
        return;
      }
      target.textContent = "";
      demo.lines.forEach(function (l) {
        var el = document.getElementById(l.id);
        if (el) { el.textContent = ""; el.className = "t-c"; }
      });

      var i = 0;
      var typing = setInterval(function () {
        target.textContent = demo.prompt.slice(0, ++i);
        if (i >= demo.prompt.length) {
          clearInterval(typing);
          var d = 320;
          demo.lines.forEach(function (l) {
            setTimeout(function () {
              var el = document.getElementById(l.id);
              if (el) { el.textContent = l.text; el.className = l.cls; }
            }, d);
            d += 480;
          });
        }
      }, 52);
    };

    if ("IntersectionObserver" in window) {
      var tio = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) { play(); tio.unobserve(en.target); }
          });
        },
        { threshold: 0.4 }
      );
      tio.observe(target);
    } else {
      play();
    }
  }

  /* ------------------------------------------------------------------
     6. 调色板自动渲染（取自 tokens.css 真值）
     ------------------------------------------------------------------ */
  var palette = [
    { n: "--acid",     v: "#E8FF4A", d: "主色 / CTA" },
    { n: "--bg",       v: "#050506", d: "页面底" },
    { n: "--surface",  v: "#0B0B0D", d: "卡片面" },
    { n: "--s2",       v: "#121214", d: "输入底" },
    { n: "--elev",     v: "#18181B", d: "悬浮层" },
    { n: "--line",     v: "#2A2A30", d: "描边" },
    { n: "--fg",       v: "#e6edf3", d: "主文字" },
    { n: "--fgm",      v: "#c5cedd", d: "次文字" },
    { n: "--fgs",      v: "#9eacbe", d: "弱文字" },
    { n: "--cyan",     v: "#22d3ee", d: "辅 · 终端" },
    { n: "--ice",      v: "#4DE8D0", d: "辅 · 引用" },
    { n: "--violet",   v: "#a78bfa", d: "辅 · 关键字" },
    { n: "--flare",    v: "#FF7A18", d: "辅 · 报告" },
    { n: "--magenta",  v: "#FF3D8A", d: "辅 · 插件" },
    { n: "--lime",     v: "#6EFF3A", d: "辅 · 文件" },
    { n: "--emerald",  v: "#34d399", d: "成功态" }
  ];

  var sw = document.getElementById("swatches");
  if (sw) {
    sw.innerHTML = palette.map(function (c) {
      var dark = ["#050506", "#0B0B0D", "#121214", "#18181B", "#2A2A30"].indexOf(c.v.toLowerCase()) > -1;
      return '<div class="sw" data-hex="' + c.v + '" title="点击复制 ' + c.v + '">' +
        '<span class="sw__chip" style="background:' + c.v + (dark ? ';border-color:var(--line2)' : '') + '"></span>' +
        '<span class="sw__n mono">' + c.n + '</span>' +
        '<span class="sw__v mono">' + c.v + '</span>' +
        '<span class="sw__d">' + c.d + '</span>' +
        '</div>';
    }).join("");

    sw.addEventListener("click", function (e) {
      var el = e.target.closest ? e.target.closest(".sw") : null;
      if (!el) return;
      var hex = el.getAttribute("data-hex");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(hex).then(function () { flash(el, "已复制"); }, function () { flash(el, hex); });
      } else { flash(el, hex); }
    });
  }

  function flash(el, msg) {
    var v = el.querySelector(".sw__v");
    if (!v) return;
    var old = v.textContent;
    v.textContent = msg;
    v.style.color = "var(--acid)";
    setTimeout(function () { v.textContent = old; v.style.color = ""; }, 1100);
  }

  /* ------------------------------------------------------------------
     7. 缓存命中率进度条（进入视口时填充 + 数字滚动）
     ------------------------------------------------------------------ */
  function fillBar(bar) {
    var pct = parseFloat(bar.getAttribute("data-pct") || "0");
    var fill = bar.querySelector(".bar__fill");
    var label = bar.querySelector(".bar__top b");
    if (fill) fill.style.width = (reduceMotion ? pct : 0) + "%";
    if (reduceMotion) { if (label) label.textContent = pct + "%"; return; }

    requestAnimationFrame(function () {
      if (fill) fill.style.width = pct + "%";
    });

    if (!label) return;
    var dur = 1150, t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min((ts - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      label.textContent = Math.round(pct * eased) + "%";
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var bars = document.querySelectorAll(".bar");
  if (bars.length) {
    if ("IntersectionObserver" in window) {
      var bio = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (en) {
            if (en.isIntersecting) { fillBar(en.target); bio.unobserve(en.target); }
          });
        },
        { threshold: 0.45 }
      );
      bars.forEach(function (b) { bio.observe(b); });
    } else {
      bars.forEach(fillBar);
    }
  }

  /* ------------------------------------------------------------------
     8. 下载占位：未配置网盘链接时给出明确提示
     ------------------------------------------------------------------ */
  document.querySelectorAll("a[data-placeholder]").forEach(function (a) {
    a.addEventListener("click", function (e) {
      var href = a.getAttribute("href");
      if (href && href !== "#") return; // 已配置真实链接则放行
      e.preventDefault();
      toast("下载链接待配置 —— 请把夸克网盘分享地址填入 index.html 对应按钮的 href");
    });
  });

  var toastEl = null;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(function () { toastEl.classList.remove("is-on"); }, 3600);
  }
})();
