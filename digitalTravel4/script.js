// Initialize Lucide icons
lucide.createIcons();

// ============ LOADER ============
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (loader) {
    setTimeout(() => {
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 500);
    }, 1500);
  }
  
  // Trigger hero animations
  setTimeout(() => {
    document.querySelectorAll('#hero .reveal, #hero .reveal-scale').forEach(el => {
      el.classList.add('active');
    });
  }, 800);
});

// ============ SCROLL PROGRESS BAR ============
const scrollProgress = document.getElementById('scroll-progress');
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = (scrollTop / docHeight) * 100;
  scrollProgress.style.width = scrollPercent + '%';
});

// ============ NAVBAR ============
const nav = document.getElementById('main-nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    nav.classList.add('nav-scrolled');
  } else {
    nav.classList.remove('nav-scrolled');
  }
});

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
mobileMenuBtn.addEventListener('click', () => {
  mobileMenu.classList.toggle('hidden');
});

// Close mobile menu on link click
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.add('hidden');
  });
});

// ============ SCROLL REVEAL ANIMATIONS ============
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
});

document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-rotate, .draw-line').forEach(el => {
  // Don't observe hero elements - they're triggered on load
  if (!el.closest('#hero')) {
    revealObserver.observe(el);
  }
});

// ============ COUNTER ANIMATION ============
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const target = parseInt(entry.target.getAttribute('data-target'));
      animateCounter(entry.target, target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.counter-value').forEach(el => {
  counterObserver.observe(el);
});

function animateCounter(element, target) {
  let current = 0;
  const duration = 2000;
  const step = target / (duration / 16);
  const format = (n) => {
    if (n >= 1000) return (n / 1000).toFixed(0) + 'K+';
    if (n >= 100) return Math.floor(n) + '+';
    return Math.floor(n);
  };
  
  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    element.textContent = format(current);
  }, 16);
}

// ============ PARALLAX ON SCROLL ============
const parallaxImg = document.getElementById('parallax-img');
window.addEventListener('scroll', () => {
  if (!parallaxImg) return;
  const rect = parallaxImg.closest('section').getBoundingClientRect();
  if (rect.top < window.innerHeight && rect.bottom > 0) {
    const scrollPercent = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
    const translateY = (scrollPercent - 0.5) * 80;
    parallaxImg.style.transform = `translateY(${translateY}px) scale(1.1)`;
  }
});

// ============ CURSOR FOLLOWER (Desktop) ============
const cursorFollower = document.getElementById('cursor-follower');
if (window.innerWidth > 768 && cursorFollower) {
  document.addEventListener('mousemove', (e) => {
    cursorFollower.style.left = e.clientX + 'px';
    cursorFollower.style.top = e.clientY + 'px';
  });
}

// ============ TILT EFFECT ON CARDS ============
document.querySelectorAll('.tilt-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    if (window.innerWidth < 768) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / centerY * -5;
    const rotateY = (x - centerX) / centerX * 5;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ============ RIPPLE EFFECT ============
document.querySelectorAll('.ripple-container').forEach(container => {
  container.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

// ============ TOUCH INTERACTIONS (Mobile) ============
if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
  document.querySelectorAll('.guide-card, .img-zoom').forEach(el => {
    el.addEventListener('touchstart', function() {
      this.classList.add('touched');
    }, { passive: true });
    
    el.addEventListener('touchend', function() {
      setTimeout(() => {
        this.classList.remove('touched');
      }, 300);
    }, { passive: true });
  });
}

// ============ MAGNETIC BUTTONS ============
document.querySelectorAll('.magnetic-btn').forEach(btn => {
  if (window.innerWidth < 768) return;
  
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px) scale(1.02)`;
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

// ============ PARTICLES CANVAS ============
const canvas = document.getElementById('particles-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let mouseX = 0;
let mouseY = 0;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

class Particle {
  constructor() {
    this.reset();
  }
  
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 2 + 0.5;
    this.speedX = (Math.random() - 0.5) * 0.3;
    this.speedY = (Math.random() - 0.5) * 0.3;
    this.opacity = Math.random() * 0.4 + 0.1;
    this.life = Math.random() * 200 + 100;
    this.maxLife = this.life;
  }
  
  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life--;
    
    // Mouse interaction
    const dx = mouseX - this.x;
    const dy = mouseY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 150) {
      this.x -= dx * 0.01;
      this.y -= dy * 0.01;
      this.opacity = Math.min(0.6, this.opacity + 0.02);
    }
    
    if (this.life <= 0 || this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
      this.reset();
    }
  }
  
  draw() {
    const lifeRatio = this.life / this.maxLife;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(134, 239, 172, ${this.opacity * lifeRatio})`;
    ctx.fill();
  }
}

// Create particles
for (let i = 0; i < 80; i++) {
  particles.push(new Particle());
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  
  // Draw connections
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `rgba(74, 222, 128, ${0.06 * (1 - dist / 120)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
  
  requestAnimationFrame(animateParticles);
}
animateParticles();

// ============ NEWSLETTER ============
function handleNewsletter() {
  const email = document.getElementById('newsletter-email').value;
  const msg = document.getElementById('newsletter-msg');
  
  if (email) {
    msg.classList.remove('hidden');
    msg.innerHTML = '<span class="text-emerald-400 flex items-center justify-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Welcome aboard! Check your inbox for a surprise.</span>';
    document.getElementById('newsletter-email').value = '';
    
    setTimeout(() => {
      msg.classList.add('hidden');
    }, 5000);
  }
}

// ============ SMOOTH SCROLL FOR ANCHOR LINKS ============
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const offset = 80;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// ============ SECTION BACKGROUND PARALLAX ORBS ============
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  document.querySelectorAll('.orb-1, .orb-2').forEach(orb => {
    const speed = orb.classList.contains('orb-1') ? 0.02 : -0.015;
    orb.style.transform = `translateY(${scrollY * speed}px)`;
  });
});

// ============ INTERACTIVE HOVER GLOW ON DESTINATION CARDS ============
document.querySelectorAll('.guide-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    if (window.innerWidth < 768) return;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mouse-x', x + '%');
    card.style.setProperty('--mouse-y', y + '%');
    card.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(51,153,255,0.06) 0%, transparent 50%)`;
  });
  
  card.addEventListener('mouseleave', () => {
    card.style.background = '';
  });
});

// ============ PERFORMANCE: Reduce animations on low-end devices ============
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.float, .float-slow, .float-reverse, .orb-1, .orb-2, .morph-blob').forEach(el => {
    el.style.animation = 'none';
  });
  particles = []; // Disable particles
}