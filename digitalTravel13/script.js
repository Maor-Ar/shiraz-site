const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

/** RTL when html/body dir is rtl or computed direction is rtl (e.g. body dir="rtl" with html dir="ltr"). */
const rtlDoc =
  document.documentElement.dir === 'rtl' ||
  document.body.dir === 'rtl' ||
  getComputedStyle(document.body).direction === 'rtl';

function isPathCtaWiggleEl(el) {
  if (!(el instanceof HTMLElement)) return false;
  if (el.id === 'ctaPathShake' || el.classList.contains('cta-path-scroll-wiggle')) return true;
  return (
    el.matches('main a.cta-main[href="#purchase"]') &&
    (el.textContent || '').includes('מסלול הדיגיטלי')
  );
}

function initNavbar() {
  const navbar = qs('#navbar');
  if (!navbar) return;
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function initMenu() {
  const toggle = qs('#menuToggle');
  const links = qs('#navLinks');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    links.classList.toggle('open');
  });
  qsa('a', links).forEach((link) => {
    link.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

function initReveal() {
  const motionReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.body.classList.add('motion-ready');

  const baseTargets = qsa('.reveal, .reveal-scale, .reveal-stagger > *');
  const autoTargets = qsa(
    [
      'main section h2',
      'main section h3',
      'main section p',
      'main section article',
      'main section img',
      'main section .btn',
      'main section form',
      'main section label',
      'main section .faq-card'
    ].join(', ')
  );

  const preservePositionSelectors = [
    '.device-phone',
    '.intro-stamp'
  ];

  const targets = [...new Set([...baseTargets, ...autoTargets])]
    .filter((el) => !el.closest('.hero-video'))
    .filter((el) => !el.closest('.hero-social--icons'))
    .filter((el) => !preservePositionSelectors.some((selector) => el.matches(selector)))
    .filter((el) => !isPathCtaWiggleEl(el))
    /* FAQ answers live in collapsed panels — IO often never intersects; scroll-reveal leaves opacity:0 */
    .filter((el) => !el.closest('.faq-answer'))
    /* Testimonial slides / ratings in carousel — same intersection issue as FAQ when off-axis */
    .filter((el) => !el.closest('.testimonials-ds3-carousel'));

  targets.forEach((el) => el.classList.add('scroll-reveal'));

  const buckets = new Map();
  const bucketSelector = '.reveal-stagger, .pain-grid, .audience-grid-simple, .faq-list, .simple-process-grid, .features-row';

  targets.forEach((el) => {
    const bucket = el.closest(bucketSelector) || el.parentElement;
    if (!bucket) return;
    if (!buckets.has(bucket)) buckets.set(bucket, []);
    buckets.get(bucket).push(el);
  });

  buckets.forEach((elements) => {
    elements.forEach((el, index) => {
      const delay = Math.min(index * 90, 540);
      el.style.setProperty('--reveal-delay', `${delay}ms`);
    });
  });

  if (motionReduce || !('IntersectionObserver' in window)) {
    targets.forEach((el) => {
      el.classList.add('is-visible', 'visible');
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible', 'visible');
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.14,
      rootMargin: '0px 0px -12% 0px'
    }
  );

  targets.forEach((el) => observer.observe(el));
}

function resolvePathCtaLink() {
  const byId = qs('#ctaPathShake');
  if (byId) return byId;
  return qsa('main a.cta-main[href="#purchase"]').find((a) =>
    (a.textContent || '').includes('מסלול הדיגיטלי')
  );
}

function initCtaPathShake() {
  const link = resolvePathCtaLink();
  if (!link) return;

  link.classList.remove('scroll-reveal', 'is-visible', 'visible', 'cta-path-shake--play');
  link.style.removeProperty('--reveal-delay');

  const motionReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (motionReduce) return;

  let played = false;
  const play = () => {
    if (played) return;
    played = true;
    link.classList.add('cta-path-shake--play');
    link.addEventListener(
      'animationend',
      (ev) => {
        if (ev.target !== link) return;
        link.classList.remove('cta-path-shake--play');
      },
      { once: true }
    );
  };

  if (!('IntersectionObserver' in window)) {
    play();
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        window.requestAnimationFrame(() => play());
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -10% 0px' }
  );

  io.observe(link);
}

function initTestimonialsCarousel() {
  const root = qs('.testimonials-ds3-carousel');
  const viewport = root ? qs('.testimonials-carousel__viewport', root) : null;
  const track = root ? qs('.testimonials-carousel__track', root) : null;
  const slides = root ? qsa('.testimonials-carousel__slide', root) : [];
  const prevBtn = root ? qs('[data-carousel-prev]', root) : null;
  const nextBtn = root ? qs('[data-carousel-next]', root) : null;
  const dotsRoot = root ? qs('[data-carousel-dots]', root) : null;

  if (!root || !viewport || !track || slides.length === 0) return;

  const motionReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const transitionMs = motionReduce ? 0 : 520;
  const parsed = Number(root.dataset.carouselIntervalMs);
  const intervalMs = Number.isFinite(parsed) && parsed >= 3200 ? parsed : 6400;

  let index = 0;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragDx = 0;
  let dragging = false;
  let dragAxis = null; // null | 'x' | 'y' — once vertical wins, abort carousel drag
  let activePointerId = null;
  let lastMoveX = 0;
  let lastMoveT = 0;
  let velocityX = 0;
  let autoTimer = null;

  function stopAuto() {
    if (autoTimer != null) {
      window.clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  /** Slide stride = viewport width + CSS gap between slides */
  function gapPx() {
    const cg = getComputedStyle(track).columnGap || getComputedStyle(track).gap;
    const v = parseFloat(cg);
    return Number.isFinite(v) ? v : 14;
  }

  function slideWidth() {
    return viewport.offsetWidth || 0;
  }

  function stridePx() {
    const w = slideWidth();
    if (!w) return 0;
    return w + gapPx();
  }

  function scheduleAuto() {
    stopAuto();
    if (motionReduce || document.hidden) return;
    const step = rtlDoc ? -1 : 1;
    autoTimer = window.setInterval(() => go(step), intervalMs);
  }

  function setTransition(enabled) {
    track.style.transition =
      enabled && !motionReduce
        ? `transform ${transitionMs}ms cubic-bezier(0.22, 1, 0.36, 1)`
        : 'none';
  }

  function applyTransform(offsetPx = 0) {
    const stride = stridePx();
    if (!stride) return;
    const x = -(index * stride) + offsetPx;
    track.style.transform = `translate3d(${x}px, 0, 0)`;
  }

  function layout() {
    const w = slideWidth();
    slides.forEach((s) => {
      s.style.flexBasis = `${w}px`;
      s.style.maxWidth = `${w}px`;
      s.style.minWidth = `${w}px`;
    });
    applyTransform(dragging ? dragDx : 0);
  }

  function updateDots() {
    qsa('.testimonials-carousel__dot', root).forEach((dot, i) => {
      const on = i === index;
      dot.classList.toggle('is-active', on);
      dot.setAttribute('aria-selected', String(on));
      dot.tabIndex = on ? 0 : -1;
    });
  }

  function updateA11y() {
    slides.forEach((s, i) => {
      s.setAttribute('aria-hidden', String(i !== index));
    });
  }

  function goTo(nextIndex, animate = true) {
    const n = slides.length;
    index = ((nextIndex % n) + n) % n;
    setTransition(animate && !dragging);
    applyTransform();
    updateDots();
    updateA11y();
    scheduleAuto();
  }

  function go(delta) {
    goTo(index + delta);
  }

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'testimonials-carousel__dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `המלצה ${i + 1} מתוך ${slides.length}`);
    dot.addEventListener('click', () => goTo(i));
    dotsRoot?.appendChild(dot);
  });

  function resetDragUi() {
    dragging = false;
    dragAxis = null;
    activePointerId = null;
    dragDx = 0;
    velocityX = 0;
    lastMoveX = 0;
    lastMoveT = 0;
    setTransition(true);
    applyTransform();
    scheduleAuto();
  }

  prevBtn?.addEventListener('click', () => go(-1));
  nextBtn?.addEventListener('click', () => go(1));

  viewport.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragging = true;
    dragAxis = null;
    activePointerId = e.pointerId;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragDx = 0;
    velocityX = 0;
    lastMoveX = e.clientX;
    lastMoveT = performance.now();
    stopAuto();
    setTransition(false);
    try {
      viewport.setPointerCapture(e.pointerId);
    } catch (_) {
      /* noop */
    }
  });

  viewport.addEventListener('pointermove', (e) => {
    if (!dragging || e.pointerId !== activePointerId) return;
    const tdx = e.clientX - dragStartX;
    const tdy = e.clientY - dragStartY;
    if (!dragAxis && (Math.abs(tdx) > 10 || Math.abs(tdy) > 10)) {
      if (Math.abs(tdy) > Math.abs(tdx) * 1.12) {
        dragAxis = 'y';
        dragging = false;
        try {
          viewport.releasePointerCapture(e.pointerId);
        } catch (_) {
          /* noop */
        }
        activePointerId = null;
        dragDx = 0;
        setTransition(true);
        applyTransform();
        scheduleAuto();
        return;
      }
      dragAxis = 'x';
    }
    if (dragAxis !== 'x') return;

    const now = performance.now();
    const dt = now - lastMoveT;
    if (dt > 0 && dt < 80) {
      velocityX = (e.clientX - lastMoveX) / dt;
    }
    lastMoveX = e.clientX;
    lastMoveT = now;
    dragDx = e.clientX - dragStartX;
    applyTransform(dragDx);
  });

  function finishDrag(e) {
    if (e.pointerId !== activePointerId) return;
    const wasDragging = dragging;
    if (wasDragging) {
      try {
        viewport.releasePointerCapture(e.pointerId);
      } catch (_) {
        /* noop */
      }
    }
    dragging = false;
    activePointerId = null;

    if (!wasDragging || dragAxis === 'y') {
      dragAxis = null;
      dragDx = 0;
      return;
    }
    dragAxis = null;

    const w = slideWidth();
    const threshold = Math.min(52, Math.max(22, w * 0.07));
    const flickPxPerMs = 0.45;
    let delta = 0;
    if (dragDx > threshold || velocityX > flickPxPerMs) delta = -1;
    else if (dragDx < -threshold || velocityX < -flickPxPerMs) delta = 1;
    dragDx = 0;
    velocityX = 0;
    lastMoveX = 0;
    lastMoveT = 0;

    if (delta !== 0) go(delta);
    else {
      setTransition(true);
      applyTransform();
      scheduleAuto();
    }
  }

  viewport.addEventListener('pointerup', finishDrag);
  viewport.addEventListener('pointercancel', finishDrag);

  viewport.addEventListener('lostpointercapture', () => {
    if (dragging || activePointerId != null) resetDragUi();
  });

  root.addEventListener('mouseenter', stopAuto);
  root.addEventListener('mouseleave', scheduleAuto);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAuto();
    else scheduleAuto();
  });

  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(() => layout());
    ro.observe(viewport);
  }
  window.addEventListener('resize', layout);

  root.setAttribute('aria-live', 'polite');

  layout();
  if (!slideWidth()) window.requestAnimationFrame(layout);

  updateDots();
  updateA11y();
  setTransition(true);
  applyTransform();
  scheduleAuto();
}

function initFaqAccordion() {
  const cards = qsa('.faq-card');
  cards.forEach((card) => {
    const btn = qs('.faq-toggle', card);
    if (!btn) return;
    btn.addEventListener('click', () => {
      const open = card.classList.contains('open');
      cards.forEach((item) => {
        item.classList.remove('open');
        const b = qs('.faq-toggle', item);
        b?.setAttribute('aria-expanded', 'false');
      });
      if (!open) {
        card.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

function initForm() {
  const form = qs('.form-card');
  if (!form) return;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    alert('תודה! הפרטים נקלטו בהצלחה.');
    form.reset();
  });
}

function initPlanePromoScroll() {
  const section = qs('#second-promo');
  if (!section) return;
  const motionReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (motionReduce) {
    section.style.setProperty('--plane-progress', '1');
    return;
  }

  const update = () => {
    const r = section.getBoundingClientRect();
    const vh = window.innerHeight;
    /* 0 = section not yet reached; 1 = section well into view (parallax settles) */
    const enterStart = vh * 0.98;
    const enterEnd = vh * 0.28;
    const y = r.top;
    let p = (enterStart - y) / (enterStart - enterEnd);
    p = Math.max(0, Math.min(1, p));
    p = p * p * (3 - 2 * p);
    section.style.setProperty('--plane-progress', p.toFixed(4));
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
}

function initLineDrawSections() {
  qsa('[data-line-draw-section]').forEach((section) => {
    attachLineDrawLoop(section);
  });
}

function attachLineDrawLoop(section) {
  if (!(section instanceof HTMLElement)) return;

  const motionReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const paths = qsa('.la-line-draw path', section);

  const resetPathsStatic = () => {
    paths.forEach((path) => {
      path.style.strokeDasharray = '';
      path.style.strokeDashoffset = '';
    });
  };

  const resetPathsHidden = () => {
    paths.forEach((path) => {
      const len = path.getTotalLength();
      if (Number.isFinite(len) && len > 0) {
        path.style.strokeDasharray = String(len);
        path.style.strokeDashoffset = String(len);
      }
    });
  };

  if (motionReduce) {
    resetPathsStatic();
    return;
  }

  if (!paths.length || typeof paths[0].animate !== 'function') {
    resetPathsStatic();
    paths.forEach((path) => {
      path.style.strokeDashoffset = '0';
    });
    return;
  }

  /** @type {Animation[]} */
  let running = [];

  const stop = () => {
    running.forEach((a) => {
      try {
        a.cancel();
      } catch {
        /* ignore */
      }
    });
    running = [];
    resetPathsHidden();
  };

  /* Brief gap hidden → quick draw → long hold (lines visible) → quick erase → brief gap; paths in each SVG stagger */
  const start = () => {
    if (running.length) return;
    paths.forEach((path) => {
      const svg = path.closest('.la-line-draw');
      if (!svg) return;
      const pathIndex = [...svg.querySelectorAll('path')].indexOf(path);
      const len = path.getTotalLength();
      if (!Number.isFinite(len) || len <= 0) return;

      path.style.strokeDasharray = String(len);

      const anim = path.animate(
        [
          { strokeDashoffset: len },
          { strokeDashoffset: len, offset: 0.015 },
          { strokeDashoffset: 0, offset: 0.09 },
          { strokeDashoffset: 0, offset: 0.91 },
          { strokeDashoffset: len, offset: 0.98 },
          { strokeDashoffset: len, offset: 1 },
        ],
        {
          duration: 10000,
          iterations: Infinity,
          easing: 'cubic-bezier(0.45, 0.05, 0.25, 1)',
          delay: pathIndex * 380,
          fill: 'both',
        }
      );
      running.push(anim);
    });
  };

  if (!('IntersectionObserver' in window)) {
    start();
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) start();
        else stop();
      });
    },
    { threshold: 0.06, rootMargin: '0px 0px 12% 0px' }
  );
  io.observe(section);
}

function initGuidePromoForm() {
  qsa('form.la-sign1__form').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const purchase = qs('#purchase');
      if (purchase) {
        purchase.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

function initLegalModals() {
  const map = {
    terms: 'legal-modal-terms',
    accessibility: 'legal-modal-accessibility',
    purchase: 'legal-modal-purchase',
    privacy: 'legal-modal-privacy',
  };

  qsa('[data-open-legal]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-open-legal');
      const id = key ? map[key] : null;
      if (!id) return;
      const dlg = document.getElementById(id);
      if (dlg && typeof dlg.showModal === 'function') {
        dlg.showModal();
      }
    });
  });

  qsa('.legal-modal').forEach((dlg) => {
    dlg.addEventListener('click', (e) => {
      const closer = e.target && e.target.closest && e.target.closest('[data-close-legal]');
      if (closer) dlg.close();
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMenu();
  initReveal();
  initCtaPathShake();
  initTestimonialsCarousel();
  initFaqAccordion();
  initPlanePromoScroll();
  initLineDrawSections();
  initGuidePromoForm();
  initForm();
  initLegalModals();
});
