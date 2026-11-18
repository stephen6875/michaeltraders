(function () {
  "use strict";

  // ----- Page loader (never blocks longer than 1.6s)
  var loader = document.querySelector(".loader");
  function hideLoader() { if (loader) loader.classList.add("hide"); document.body.classList.add("ready"); }
  window.addEventListener("load", function () { setTimeout(hideLoader, 250); });
  setTimeout(hideLoader, 1600);

  // ----- Sticky header + back to top
  var header = document.querySelector(".header");
  var toTop = document.querySelector(".to-top");
  function onScroll() {
    var y = window.scrollY;
    if (header) header.classList.toggle("scrolled", y > 10);
    if (toTop) toTop.classList.toggle("show", y > 800);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

  // ----- Mobile menu
  var drawer = document.querySelector(".drawer");
  function setDrawer(open) {
    if (!drawer) return;
    drawer.classList.toggle("open", open);
    drawer.setAttribute("aria-hidden", open ? "false" : "true");
    document.body.style.overflow = open ? "hidden" : "";
  }
  document.querySelectorAll("[data-open-menu]").forEach(function (b) { b.addEventListener("click", function () { setDrawer(true); }); });
  document.querySelectorAll("[data-close-menu]").forEach(function (b) { b.addEventListener("click", function () { setDrawer(false); }); });
  if (drawer) drawer.querySelectorAll("nav a").forEach(function (a) { a.addEventListener("click", function () { setDrawer(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setDrawer(false); });

  // ----- Hero slider
  var slides = document.querySelectorAll(".slide");
  var nums = document.querySelectorAll(".hero-nums button");
  var bar = document.querySelector(".hero-counter .bar i");
  if (slides.length > 1) {
    var cur = 0, timer;
    var restartBar = function () {
      if (!bar) return;
      bar.classList.remove("run"); void bar.offsetWidth; bar.classList.add("run");
    };
    var go = function (i) {
      var old = slides[cur];
      slides.forEach(function (s) { s.classList.remove("leaving"); });
      old.classList.remove("active");
      old.classList.add("leaving");
      setTimeout(function () { old.classList.remove("leaving"); }, 1800);
      if (nums[cur]) nums[cur].classList.remove("active");
      cur = (i + slides.length) % slides.length;
      slides[cur].classList.add("active");
      if (nums[cur]) nums[cur].classList.add("active");
      restartBar();
    };
    var start = function () { clearInterval(timer); timer = setInterval(function () { go(cur + 1); }, 6000); };
    nums.forEach(function (b, i) { b.addEventListener("click", function () { if (i !== cur) { go(i); start(); } }); });
    restartBar();
    start();
  }

  // ----- Godown carousel
  var gd = document.querySelector(".godown");
  if (gd) {
    var gTrack = gd.querySelector(".g-track"), gSlides = gd.querySelectorAll(".g-slide"), gDots = gd.querySelectorAll(".g-dots button");
    var gi = 0, gTimer;
    var gGo = function (n) {
      gi = (n + gSlides.length) % gSlides.length;
      gTrack.style.transform = "translateX(" + (-gi * 100) + "%)";
      gSlides.forEach(function (s, k) { s.classList.toggle("active", k === gi); });
      gDots.forEach(function (d, k) { d.classList.toggle("active", k === gi); });
    };
    var gPlay = function () { clearInterval(gTimer); gTimer = setInterval(function () { gGo(gi + 1); }, 5000); };
    gd.querySelector(".g-prev").addEventListener("click", function () { gGo(gi - 1); gPlay(); });
    gd.querySelector(".g-next").addEventListener("click", function () { gGo(gi + 1); gPlay(); });
    gDots.forEach(function (d, k) { d.addEventListener("click", function () { gGo(k); gPlay(); }); });
    gd.addEventListener("mouseenter", function () { clearInterval(gTimer); });
    gd.addEventListener("mouseleave", gPlay);
    var gx = null;
    gd.addEventListener("touchstart", function (e) { gx = e.touches[0].clientX; }, { passive: true });
    gd.addEventListener("touchend", function (e) {
      if (gx === null) return;
      var dx = e.changedTouches[0].clientX - gx; gx = null;
      if (Math.abs(dx) > 40) { gGo(gi + (dx < 0 ? 1 : -1)); gPlay(); }
    }, { passive: true });
    gPlay();
  }

  // ----- Reveal on scroll
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -50px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  // ----- Counters (final value is already in the HTML)
  function runCounter(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    var t0 = performance.now(), dur = 2000;
    (function step(now) {
      var p = Math.min((now - t0) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }
  if ("IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { runCounter(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    document.querySelectorAll("[data-count]").forEach(function (el) { co.observe(el); });
  }

  // ----- Gentle parallax
  var par = document.querySelectorAll("[data-parallax]");
  if (par.length && window.matchMedia("(min-width: 1025px)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var tick = false;
    window.addEventListener("scroll", function () {
      if (tick) return; tick = true;
      requestAnimationFrame(function () {
        par.forEach(function (el) {
          var r = el.parentElement.getBoundingClientRect();
          el.style.transform = "translateY(" + ((r.top + r.height / 2 - window.innerHeight / 2) * -0.15) + "px)";
        });
        tick = false;
      });
    }, { passive: true });
  }

  // ----- Year
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // ----- Enquiry form -> WhatsApp
  var form = document.getElementById("enquiry");
  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var d = new FormData(form);
      var msg = [
        "Hello Michael Traders,", "",
        "*Name:* " + (d.get("name") || ""),
        "*Phone:* " + (d.get("phone") || ""),
        "*Material:* " + (d.get("material") || ""),
        "*Approx. Quantity:* " + (d.get("qty") || "-"),
        "*Message:* " + (d.get("message") || "-")
      ].join("\n");
      window.open("https://wa.me/916380734024?text=" + encodeURIComponent(msg), "_blank");
    });
  }

  // =========================================================
  // HOME PAGE ONLY — signature animations
  // =========================================================
  if (document.body.classList.contains("page-home")) {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Quote: split into words so they can surface one by one
    document.querySelectorAll("blockquote.split").forEach(function (q) {
      var words = q.textContent.trim().split(/\s+/);
      q.innerHTML = words.map(function (w, i) {
        return '<span class="w" style="transition-delay:' + (0.25 + i * 0.07).toFixed(2) + 's">' + w + "</span>";
      }).join(" ");
    });

    // Elements that only need an "in" class (no fade of their own)
    if ("IntersectionObserver" in window) {
      var vo = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); vo.unobserve(e.target); } });
      }, { threshold: 0.3 });
      document.querySelectorAll("[data-inview]").forEach(function (el) { vo.observe(el); });
    }

    if (!reduce) {
      // Scroll progress hairline
      var prog = document.createElement("div");
      prog.className = "scroll-progress";
      document.body.appendChild(prog);
      var setProg = function () {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        prog.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
      };
      window.addEventListener("scroll", setProg, { passive: true });
      setProg();

      // Gold dust particles in the hero
      var canvas = document.querySelector(".hero .dust");
      if (canvas && canvas.getContext) {
        var ctx = canvas.getContext("2d");
        var hero = canvas.parentElement;
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var W = 0, H = 0, parts = [], running = false, visible = true;
        var count = window.innerWidth < 640 ? 26 : 52;
        var resize = function () {
          W = hero.clientWidth; H = hero.clientHeight;
          canvas.width = W * dpr; canvas.height = H * dpr;
          ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        var spawn = function (p, fresh) {
          p.x = Math.random() * W;
          p.y = fresh ? Math.random() * H : H + 10;
          p.r = 0.6 + Math.random() * 1.8;
          p.vy = 0.15 + Math.random() * 0.45;
          p.sway = Math.random() * Math.PI * 2;
          p.sp = 0.004 + Math.random() * 0.01;
          p.a = 0.25 + Math.random() * 0.6;
          return p;
        };
        resize();
        for (var k = 0; k < count; k++) parts.push(spawn({}, true));
        var frame = function () {
          if (!visible || document.hidden) { running = false; return; }
          ctx.clearRect(0, 0, W, H);
          for (var i = 0; i < parts.length; i++) {
            var p = parts[i];
            p.y -= p.vy; p.sway += p.sp; p.x += Math.sin(p.sway) * 0.35;
            if (p.y < -10) spawn(p, false);
            var tw = p.a * (0.65 + 0.35 * Math.sin(p.sway * 3));
            ctx.beginPath();
            ctx.fillStyle = "rgba(235, 211, 154," + tw.toFixed(3) + ")";
            ctx.shadowColor = "rgba(235, 200, 120, .9)";
            ctx.shadowBlur = p.r * 4;
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
          }
          requestAnimationFrame(frame);
        };
        var startDust = function () { if (!running && visible && !document.hidden) { running = true; requestAnimationFrame(frame); } };
        window.addEventListener("resize", resize);
        document.addEventListener("visibilitychange", startDust);
        if ("IntersectionObserver" in window) {
          new IntersectionObserver(function (en) { visible = en[0].isIntersecting; startDust(); }).observe(hero);
        }
        startDust();
      }
    }
  }
})();
