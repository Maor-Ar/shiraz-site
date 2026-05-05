const qs = (selector, root = document) => root.querySelector(selector);
const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];

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
      'main section .faq-card',
      'footer .footer-grid > section',
      'footer .footer-list li',
      'footer .footer-bottom p'
    ].join(', ')
  );

  const preservePositionSelectors = [
    '.device-phone',
    '.intro-stamp'
  ];

  const targets = [...new Set([...baseTargets, ...autoTargets])]
    .filter((el) => !el.closest('.hero-video'))
    .filter((el) => !preservePositionSelectors.some((selector) => el.matches(selector)));

  targets.forEach((el) => el.classList.add('scroll-reveal'));

  const buckets = new Map();
  const bucketSelector = '.reveal-stagger, .pain-grid, .audience-grid-simple, .faq-list, .simple-process-grid, .testimonials-ds3-grid, .features-row, .footer-grid';

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

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMenu();
  initReveal();
  initFaqAccordion();
  initForm();
});
