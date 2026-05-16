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
    qs("#backToTop").classList.toggle("show", window.scrollY > 460);
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

function initBackToTop() {
  qs("#backToTop").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
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
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  qsa(".reveal").forEach((el) => observer.observe(el));
  qsa(".reveal-scale").forEach((el) => observer.observe(el));
  qsa(".reveal-stagger").forEach((wrap) => {
    const children = [...wrap.children];
    const staggerObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        children.forEach((child, index) => {
          window.setTimeout(() => child.classList.add("visible"), index * 110);
        });
        staggerObserver.unobserve(wrap);
      });
    }, { threshold: 0.15 });
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
  }, { threshold: 0.5 });
  counters.forEach((counter) => counterObserver.observe(counter));
}

function initPathAnimation() {
  const desktopLine = qs("#desktop-path-line");
  const mobileLine = qs("#mobile-path-line");

  function setupPath(pathEl) {
    if (!pathEl) return null;
    let length = 1000;
    try {
      length = pathEl.getTotalLength ? pathEl.getTotalLength() : 1000;
    } catch {
      length = 1000;
    }
    pathEl.style.strokeDasharray = String(length);
    pathEl.style.strokeDashoffset = String(length);
    return { pathEl, length };
  }

  const desktop = setupPath(desktopLine);
  const mobile = setupPath(mobileLine);
  if (!desktop && !mobile) return;

  const section = qs("#whats-inside");
  if (!section) return;

  const update = () => {
    const rect = section.getBoundingClientRect();
    const viewH = window.innerHeight;
    const progress = Math.min(Math.max((viewH - rect.top) / (rect.height + viewH * 0.3), 0), 1);
    [desktop, mobile].forEach((state) => {
      if (!state) return;
      state.pathEl.style.strokeDashoffset = String(state.length * (1 - progress));
    });
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
  if (!bg) return;
  window.addEventListener("scroll", () => {
    const y = window.scrollY * 0.28;
    bg.style.transform = `translateY(${y}px)`;
  }, { passive: true });
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
  initBackToTop();
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
