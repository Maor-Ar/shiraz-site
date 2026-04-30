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
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = qsa('.reveal, .reveal-scale');
  const groups = qsa('.reveal-stagger');

  if (reduceMotion) {
    items.forEach((el) => el.classList.add('visible'));
    groups.forEach((group) => [...group.children].forEach((el) => el.classList.add('visible')));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    });
  }, { root: null, threshold: 0.16, rootMargin: '0px 0px -8% 0px' });

  items.forEach((el) => io.observe(el));

  groups.forEach((group) => {
    const go = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        [...group.children].forEach((child, i) => {
          window.setTimeout(() => child.classList.add('visible'), i * 120);
        });
        go.unobserve(group);
      });
    }, { root: null, threshold: 0.12 });
    go.observe(group);
  });
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
