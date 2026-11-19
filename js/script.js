/* =========================================================
   Adarsh Wagadre – Portfolio scripts (Vanilla ES6+)
   ========================================================= */
(() => {
  "use strict";

  const root = document.documentElement;
  root.classList.add("js");

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Safe localStorage wrapper */
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
  };

  /* ---------- 1. Theme toggle (persisted) ---------- */
  const themeBtn = $("#themeToggle");
  const applyTheme = (theme) => {
    root.setAttribute("data-theme", theme);
    themeBtn.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#070b1a" : "#f5f7ff");
    particles.refreshColor();
  };
  const savedTheme = store.get("theme");
  const initialTheme = savedTheme || (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");

  themeBtn.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    store.set("theme", next);
  });

  /* ---------- 2. Particle background (lightweight canvas) ---------- */
  const particles = (() => {
    const canvas = $("#particles");
    const ctx = canvas.getContext("2d");
    let w = 0, h = 0, dots = [], raf = 0, running = false, rgb = "34, 211, 238";

    const refreshColor = () => {
      const v = getComputedStyle(root).getPropertyValue("--particle").trim();
      if (v) rgb = v;
    };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(70, Math.floor((w * h) / 18000));
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.6 + 0.6,
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < dots.length; i++) {
        const a = dots[i];
        a.x += a.vx; a.y += a.vy;
        if (a.x < 0 || a.x > w) a.vx *= -1;
        if (a.y < 0 || a.y > h) a.vy *= -1;
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb}, 0.7)`; ctx.fill();
        for (let j = i + 1; j < dots.length; j++) {
          const b = dots[j], dx = a.x - b.x, dy = a.y - b.y, d = dx * dx + dy * dy;
          if (d < 14400) {
            ctx.strokeStyle = `rgba(${rgb}, ${0.16 * (1 - d / 14400)})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    const start = () => { if (!running && !prefersReducedMotion) { running = true; raf = requestAnimationFrame(draw); } };
    const stop = () => { running = false; cancelAnimationFrame(raf); };

    const init = () => {
      refreshColor(); resize();
      if (prefersReducedMotion) { draw(); cancelAnimationFrame(raf); return; }
      let t;
      window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(resize, 200); });
      // Only animate while the hero is visible
      new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0 }).observe($("#home"));
      document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
    };
    return { init, refreshColor };
  })();

  applyTheme(initialTheme);
  particles.init();

  /* ---------- 3. Typing animation ---------- */
  const typingEl = $("#typing");
  const phrases = ["Java Developer", "Spring Boot Developer", "Full Stack Developer", "Backend Developer"];
  if (typingEl) {
    if (prefersReducedMotion) {
      typingEl.textContent = phrases[0];
    } else {
      let p = 0, c = 0, deleting = false;
      const tick = () => {
        const word = phrases[p];
        c += deleting ? -1 : 1;
        typingEl.textContent = word.slice(0, c);
        let delay = deleting ? 45 : 95;
        if (!deleting && c === word.length) { deleting = true; delay = 1600; }
        else if (deleting && c === 0) { deleting = false; p = (p + 1) % phrases.length; delay = 350; }
        setTimeout(tick, delay);
      };
      typingEl.textContent = "";
      setTimeout(tick, 600);
    }
  }

  /* ---------- 4. Mobile navigation ---------- */
  const header = $("#header");
  const navLinks = $("#navLinks");
  const menuBtn = $("#menuToggle");

  const setMenu = (open) => {
    navLinks.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    header.classList.toggle("scrolled", open || window.scrollY > 20);
  };
  menuBtn.addEventListener("click", () => setMenu(!navLinks.classList.contains("open")));
  $$(".nav-link", navLinks).forEach((l) => l.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navLinks.classList.contains("open")) { setMenu(false); menuBtn.focus(); }
  });
  document.addEventListener("click", (e) => {
    if (navLinks.classList.contains("open") && !navLinks.contains(e.target) && !menuBtn.contains(e.target)) setMenu(false);
  });
  window.matchMedia("(min-width: 992px)").addEventListener("change", (e) => { if (e.matches) setMenu(false); });

  /* ---------- 5. Smooth scrolling (CSS handles it; this adds hash + focus handling) ---------- */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id.length < 2) return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });
      history.replaceState(null, "", id);
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    });
  });

  /* ---------- 6. Scroll-driven UI: header, progress, back-to-top ---------- */
  const progress = $("#scrollProgress");
  const toTop = $("#backToTop");
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle("scrolled", y > 20 || navLinks.classList.contains("open"));
    progress.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
    toTop.classList.toggle("show", y > 600);
    ticking = false;
  };
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
  toTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    $("#home").setAttribute("tabindex", "-1"); $("#home").focus({ preventScroll: true });
  });

  /* ---------- 7. Reveal on scroll (Intersection Observer) ---------- */
  const revealEls = $$(".reveal");
  // Light stagger for siblings
  revealEls.forEach((el) => {
    const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
    el.style.setProperty("--d", `${Math.min(siblings.indexOf(el), 6) * 0.08}s`);
  });
  const revealObs = new IntersectionObserver((entries, obs) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("visible"); obs.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  revealEls.forEach((el) => revealObs.observe(el));

  /* ---------- 8. Animated counters (genuine figures only) ---------- */
  const animateCounter = (el) => {
    const target = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const suffix = el.dataset.suffix || "";
    const fmt = (v) => v.toFixed(decimals) + suffix;
    if (prefersReducedMotion) { el.textContent = fmt(target); return; }
    const dur = 1400, t0 = performance.now();
    const step = (now) => {
      const t = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = fmt(target * eased);
      if (t < 1) requestAnimationFrame(step); else el.textContent = fmt(target);
    };
    requestAnimationFrame(step);
  };
  const counterObs = new IntersectionObserver((entries, obs) => {
    entries.forEach((en) => { if (en.isIntersecting) { animateCounter(en.target); obs.unobserve(en.target); } });
  }, { threshold: 0.6 });
  $$(".counter").forEach((c) => counterObs.observe(c));

  /* ---------- 9. Active nav highlighting ---------- */
  const sections = $$("main section[id]");
  const linkFor = new Map($$(".nav-link").map((l) => [l.getAttribute("href").slice(1), l]));
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      linkFor.forEach((l) => { l.classList.remove("active"); l.removeAttribute("aria-current"); });
      const l = linkFor.get(en.target.id);
      if (l) { l.classList.add("active"); l.setAttribute("aria-current", "true"); }
    });
  }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
  sections.forEach((s) => spy.observe(s));

  /* ---------- 10. Interactive project cards ---------- */
  $$(".toggle-btn").forEach((btn) => {
    const panel = document.getElementById(btn.getAttribute("aria-controls"));
    const label = $(".toggle-label", btn);
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      panel.hidden = open;
      label.textContent = open ? "View features" : "Hide features";
    });
  });

  // Subtle tilt on pointer devices
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && !prefersReducedMotion) {
    $$(".project-card").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `translateY(-6px) perspective(900px) rotateX(${(-y * 3).toFixed(2)}deg) rotateY(${(x * 3).toFixed(2)}deg)`;
      });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });
  }

  /* ---------- 11. Contact form: validation + mailto fallback ---------- */
  const form = $("#contactForm");
  const status = $("#formStatus");
  const EMAIL_TO = "adarshwagadre1806@gmail.com";
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const rules = {
    name: (v) => (v.length < 2 ? "Please enter your name (at least 2 characters)." : ""),
    email: (v) => (!v ? "Please enter your email." : !emailRe.test(v) ? "Please enter a valid email address." : ""),
    subject: (v) => (v.length < 3 ? "Please enter a subject (at least 3 characters)." : ""),
    message: (v) => (v.length < 10 ? "Please write a message (at least 10 characters)." : ""),
  };
  const validateField = (input) => {
    const msg = rules[input.name](input.value.trim());
    const field = input.closest(".field");
    field.classList.toggle("invalid", Boolean(msg));
    input.setAttribute("aria-invalid", String(Boolean(msg)));
    $(".error", field).textContent = msg;
    return !msg;
  };
  const fields = $$("input, textarea", form);
  fields.forEach((f) => {
    f.addEventListener("blur", () => validateField(f));
    f.addEventListener("input", () => { if (f.closest(".field").classList.contains("invalid")) validateField(f); });
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    status.className = "form-note";
    const results = fields.map(validateField);
    if (results.includes(false)) {
      status.textContent = "Please fix the highlighted fields.";
      status.classList.add("err");
      fields.find((f) => f.getAttribute("aria-invalid") === "true")?.focus();
      return;
    }
    const data = Object.fromEntries(fields.map((f) => [f.name, f.value.trim()]));
    const body = `Hi Adarsh,\n\n${data.message}\n\nRegards,\n${data.name}\n${data.email}`;
    const url = `mailto:${EMAIL_TO}?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
    status.textContent = "Your email app should open with the message ready. Press send there to deliver it. If nothing opened, email me directly at " + EMAIL_TO + ".";
    status.classList.add("ok");
  });

  /* ---------- 12. Footer year ---------- */
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* =======================================================
     Enhancements: interaction layer
     ======================================================= */
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* A. Seamless tech ticker: clone the list once */
  const track = $("#marqueeTrack");
  if (track) {
    [...track.children].forEach((li) => { const c = li.cloneNode(true); c.setAttribute("aria-hidden", "true"); track.appendChild(c); });
  }

  /* B. Stagger skill chips */
  $$(".skill-group").forEach((g) => $$(".chip", g).forEach((chip, i) => chip.style.setProperty("--ci", i)));

  /* C. Cursor-tracked spotlight on cards */
  const spotSel = ".skill-group, .timeline-card, .project-card, .stat, .contact-list li, .profile-card, .achievement, .contact-form";
  $$(spotSel).forEach((el) => {
    el.classList.add("spot");
    if (!finePointer) return;
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  if (finePointer && !prefersReducedMotion) {
    /* D. Smooth page-wide cursor glow */
    const glow = $("#cursorGlow");
    let gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy, glowRaf = 0;
    const glowLoop = () => {
      gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12;
      glow.style.transform = `translate3d(${gx}px, ${gy}px, 0)`;
      glowRaf = Math.abs(tx - gx) + Math.abs(ty - gy) > 0.5 ? requestAnimationFrame(glowLoop) : 0;
    };
    window.addEventListener("pointermove", (e) => {
      tx = e.clientX; ty = e.clientY; glow.classList.add("on");
      if (!glowRaf) glowRaf = requestAnimationFrame(glowLoop);
    }, { passive: true });
    document.addEventListener("pointerleave", () => glow.classList.remove("on"));

    /* E. Hero: orb parallax + 3D tilt of the code window */
    const hero = $("#home");
    const tilt = $("#tiltWrap");
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      hero.style.setProperty("--px", nx.toFixed(3));
      hero.style.setProperty("--py", ny.toFixed(3));
      if (tilt) tilt.style.transform = `perspective(1100px) rotateY(${(nx * 10).toFixed(2)}deg) rotateX(${(-ny * 8).toFixed(2)}deg)`;
    });
    hero.addEventListener("pointerleave", () => {
      hero.style.setProperty("--px", 0); hero.style.setProperty("--py", 0);
      if (tilt) tilt.style.transform = "";
    });

    /* F. Magnetic buttons */
    $$(".btn").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        btn.style.setProperty("--tx", `${((e.clientX - (r.left + r.width / 2)) * 0.14).toFixed(1)}px`);
        btn.style.setProperty("--ty", `${((e.clientY - (r.top + r.height / 2)) * 0.2).toFixed(1)}px`);
      });
      btn.addEventListener("pointerleave", () => { btn.style.removeProperty("--tx"); btn.style.removeProperty("--ty"); });
    });
  }

  /* G. Timelines fill as you scroll */
  const timelines = $$(".timeline");
  const updateTimelines = () => {
    const mid = window.innerHeight * 0.6;
    timelines.forEach((tl) => {
      const r = tl.getBoundingClientRect();
      const p = Math.min(Math.max((mid - r.top) / r.height, 0), 1);
      tl.style.setProperty("--fill", p.toFixed(3));
    });
  };
  window.addEventListener("scroll", updateTimelines, { passive: true });
  window.addEventListener("resize", updateTimelines);
  updateTimelines();
})();
