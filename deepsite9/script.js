const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

function initLoader() {
  const loader = qs("#loader");
  window.setTimeout(() => {
    loader.style.opacity = "0";
    loader.style.pointerEvents = "none";
    window.setTimeout(() => loader.remove(), 350);
  }, 1800);
}

function initProgressAndNavbar() {
  const progress = qs("#scrollProgress");
  const navbar = qs("#navbar");
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? (window.scrollY / max) * 100 : 0;
    progress.style.width = `${ratio}%`;
    navbar.classList.toggle("scrolled", window.scrollY > 30);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

function initMenu() {
  const toggle = qs("#menuToggle");
  const links = qs("#navLinks");
  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!expanded));
    links.classList.toggle("open");
  });
}

function initCompass() {
  const needle = qs(".compass-needle");
  window.addEventListener("scroll", () => {
    needle.style.transform = `rotate(${window.scrollY * 0.5}deg)`;
  }, { passive: true });
}

function initCursorFollower() {
  const follower = qs("#cursorFollower");
  if (!follower || window.matchMedia("(max-width: 700px)").matches) return;
  window.addEventListener("mousemove", (event) => {
    follower.style.opacity = "1";
    follower.style.transform = `translate(${event.clientX - 90}px, ${event.clientY - 90}px)`;
  });
}

function initParticles() {
  const canvas = qs("#particlesCanvas");
  const ctx = canvas.getContext("2d");
  const pointer = { x: -9999, y: -9999 };
  const particles = [];
  const count = 52;
  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
  });
  for (let i = 0; i < count; i += 1) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5
    });
  }
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      const dx = p.x - pointer.x;
      const dy = p.y - pointer.y;
      const d = Math.hypot(dx, dy);
      if (d < 120) {
        p.x += dx / 16;
        p.y += dy / 16;
      }
      ctx.beginPath();
      ctx.fillStyle = "rgba(212,168,67,0.7)";
      ctx.arc(p.x, p.y, 1.9, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
        const a = particles[i];
        const b = particles[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 100) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(212,168,67,${(100 - d) / 450})`;
          ctx.lineWidth = 1;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    window.requestAnimationFrame(draw);
  };
  draw();
}

function initReveals() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const staggerWraps = qsa(".reveal-stagger");

  if (reduceMotion) {
    qsa(".reveal, .reveal-scale").forEach((el) => el.classList.add("visible"));
    staggerWraps.forEach((wrap) => {
      [...wrap.children].forEach((child) => child.classList.add("visible"));
    });
    return;
  }

  /** Negative bottom inset: element must sit higher in the viewport before we fire (later on scroll). */
  const revealOpts = {
    root: null,
    rootMargin: "0px 0px -14% 0px",
    threshold: 0.28
  };

  const staggerOpts = {
    root: null,
    rootMargin: "0px 0px -12% 0px",
    threshold: 0.22
  };

  const afterIntersectMs = 130;
  const staggerBaseMs = 200;
  const staggerStepMs = 140;

  const observeReveal = (selector, opts) => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const target = entry.target;
        window.setTimeout(() => {
          target.classList.add("visible");
          obs.unobserve(target);
        }, afterIntersectMs);
      });
    }, opts);
    qsa(selector).forEach((el) => obs.observe(el));
  };

  observeReveal(".reveal", revealOpts);
  observeReveal(".reveal-scale", revealOpts);

  staggerWraps.forEach((wrap) => {
    const children = [...wrap.children];
    const staggerObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        children.forEach((child, index) => {
          window.setTimeout(
            () => child.classList.add("visible"),
            staggerBaseMs + index * staggerStepMs
          );
        });
        staggerObserver.unobserve(wrap);
      });
    }, staggerOpts);
    staggerObserver.observe(wrap);
  });
}

function initCounters() {
  const counters = qsa("[data-counter]");
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.counter || 0);
      const start = performance.now();
      const duration = 1100;
      const animate = (now) => {
        const p = Math.min((now - start) / duration, 1);
        el.textContent = String(Math.floor(target * p));
        if (p < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
      counterObserver.unobserve(el);
    });
  }, { root: null, rootMargin: "0px 0px -10% 0px", threshold: 0.42 });
  counters.forEach((counter) => counterObserver.observe(counter));
}

function initPathAnimation() {
  const desktopLine = qs("#desktop-path-line");
  const desktopClipRect = qs("#desktop-path-clip-rect");
  const desktopSvg = qs(".path-svg-desktop");
  const clipRect = qs("#mobile-path-clip-rect");
  const mobileSvg = qs(".path-svg-mobile");
  const mobileInner = qs(".path-mobile-inner");

  if (desktopLine) {
    desktopLine.style.removeProperty("stroke-dasharray");
    desktopLine.style.removeProperty("stroke-dashoffset");
  }

  if (!desktopClipRect && !clipRect) return;

  const section = qs("#whats-inside");
  if (!section) return;

  /** Mobile dashed line: clip-rect height 0→clipMax (dashes stay). Tunables on .path-mobile-inner data-* (see index HTML). */
  function mobileClipProgress(viewH) {
    if (!mobileInner) return 0;
    const ir = mobileInner.getBoundingClientRect();
    if (ir.height <= 0) return 0;
    if (ir.top >= viewH) return 0;
    if (ir.bottom <= 0) return 1;
    const startMv = Number(mobileInner.dataset.pathMobileStartVh || 0.88);
    const denomH = Number(mobileInner.dataset.pathMobileDenomH || 0.99);
    const denomVh = Number(mobileInner.dataset.pathMobileDenomVh || 0.12);
    const start = viewH * startMv;
    const denom = ir.height * denomH + viewH * denomVh;
    const raw = (start - ir.top) / Math.max(denom, 1);
    return Math.min(Math.max(raw, 0), 1);
  }

  const update = () => {
    const rect = section.getBoundingClientRect();
    const viewH = window.innerHeight;
    const vhBias = Number(section.dataset.pathSectionVhBias ?? 0.3);
    const rawProgress = Math.min(Math.max((viewH - rect.top) / (rect.height + viewH * vhBias), 0), 1);
    const dStart = Number(section.dataset.pathDesktopStart ?? 0);
    const dEnd = Number(section.dataset.pathDesktopEnd ?? 1);
    const span = Math.max(dEnd - dStart, 0.0001);
    const progressDesktop = Math.min(Math.max((rawProgress - dStart) / span, 0), 1);
    if (desktopClipRect && desktopSvg) {
      const clipMaxD = Number(desktopSvg.dataset.clipMax || 460);
      desktopClipRect.setAttribute("height", String(progressDesktop * clipMaxD));
    }
    if (clipRect && mobileSvg) {
      const clipMax = Number(mobileSvg.dataset.clipMax || 880);
      const pm = mobileClipProgress(viewH);
      clipRect.setAttribute("height", String(pm * clipMax));
    }
  };

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update, { passive: true });
  update();
}

function initTiltCards() {
  qsa(".tilt-card").forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(700px) rotateY(${x * 8}deg) rotateX(${y * -8}deg) translateY(-3px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });
}

function initMagneticButtons() {
  qsa(".magnetic").forEach((button) => {
    button.addEventListener("mousemove", (event) => {
      const rect = button.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      button.style.transform = `translate(${dx * 0.08}px, ${dy * 0.08}px)`;
    });
    button.addEventListener("mouseleave", () => {
      button.style.transform = "";
    });
  });
}

function initFaqAccordion() {
  const cards = qsa(".faq-card");
  cards.forEach((card) => {
    const toggle = qs(".faq-toggle", card);
    toggle?.addEventListener("click", () => {
      const isOpen = card.classList.contains("open");
      cards.forEach((item) => {
        item.classList.remove("open");
        const button = qs(".faq-toggle", item);
        button?.setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        card.classList.add("open");
        toggle.setAttribute("aria-expanded", "true");
      }
    });
  });
}

function initParallax() {
  const bg = qs(".parallax-bg");
  const section = qs("#travel-ready");
  if (!bg || !section) return;

  const update = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      bg.style.transform = "";
      return;
    }
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight || 1;
    if (rect.bottom < 0 || rect.top > vh) {
      bg.style.transform = "translateY(0px)";
      return;
    }
    /* Offset of section center vs viewport center — stays small so bg stays inside overflow:hidden */
    const centerOffset = rect.top + rect.height / 2 - vh / 2;
    const y = centerOffset * 0.14;
    bg.style.transform = `translateY(${y}px)`;
  };

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update, { passive: true });
  update();
}

function initReducedMotion() {
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const video = qs(".hero-video");
  if (video) {
    video.removeAttribute("autoplay");
    video.pause();
  }
}

/** Hero subtitle — character typing (works for Hebrew; avoids CSS width/ch clipping). */
function initTypingEffect() {
  const el = qs("#hero-sub");
  if (!el) return;
  const raw = el.dataset.text || el.textContent || "";
  const chars = [...raw];
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    el.textContent = raw;
    return;
  }
  el.textContent = "";
  let i = 0;
  const type = () => {
    if (i < chars.length) {
      el.textContent += chars[i];
      i += 1;
      window.setTimeout(type, 65 + Math.random() * 55);
    }
  };
  /* After loader (~1.8s) + short pause — aligned with DigitalTravel2 feel */
  window.setTimeout(type, 2100);
}

document.addEventListener("DOMContentLoaded", () => {
  initLoader();
  initProgressAndNavbar();
  initMenu();
  initCompass();
  initCursorFollower();
  initParticles();
  initTypingEffect();
  initReveals();
  initCounters();
  initPathAnimation();
  initTiltCards();
  initMagneticButtons();
  initFaqAccordion();
  initParallax();
  initReducedMotion();
});
