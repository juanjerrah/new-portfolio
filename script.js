/* ══════════════════════════════════════════════════════════════
   Portfolio — Juan Jerrah Barreto de Oliveira
   Vanilla JS — No external dependencies
   ══════════════════════════════════════════════════════════════ */

'use strict';

// ──────────────────────────────────────
// UTILITIES
// ──────────────────────────────────────

function $(selector, ctx = document) {
  return ctx.querySelector(selector);
}

function $$(selector, ctx = document) {
  return Array.from(ctx.querySelectorAll(selector));
}

function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// ──────────────────────────────────────
// NAVBAR — scroll behaviour + mobile menu
// ──────────────────────────────────────

(function initNavbar() {
  const navbar    = $('.navbar');
  const toggle    = $('.navbar__toggle');
  const mobileMenu = $('#mobile-menu');
  const mobileLinks = $$('.mobile-nav-link');
  const navLinks    = $$('.nav-link');

  // Scroll: add glass background when not at top
  let lastScroll = 0;
  function onScroll() {
    const y = window.scrollY;
    if (y > 20) {
      navbar.classList.add('navbar--scrolled');
    } else {
      navbar.classList.remove('navbar--scrolled');
    }
    lastScroll = y;
  }

  window.addEventListener('scroll', debounce(onScroll, 8), { passive: true });
  onScroll(); // run once on load

  // Toggle mobile menu
  function openMenu() {
    mobileMenu.classList.add('mobile-menu--open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Fechar menu de navegação');
  }

  function closeMenu() {
    mobileMenu.classList.remove('mobile-menu--open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu de navegação');
  }

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  });

  // Close menu when a mobile nav link is clicked
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) closeMenu();
  });

  // Active nav link on scroll
  const sections = $$('section[id]');

  function updateActiveLink() {
    const scrollPos = window.scrollY + 120;

    let currentId = '';
    sections.forEach(section => {
      if (section.offsetTop <= scrollPos) {
        currentId = section.id;
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      link.classList.toggle('nav-link--active', href === currentId);
    });
  }

  window.addEventListener('scroll', debounce(updateActiveLink, 50), { passive: true });
  updateActiveLink();
})();

// ──────────────────────────────────────
// TYPEWRITER EFFECT
// ──────────────────────────────────────

(function initTypewriter() {
  const el = $('#typewriter');
  if (!el) return;

  const roles = [
    'Full Stack',
    'Front-end',
    'Back-end',
    'React',
    'Node.js',
  ];

  let roleIndex   = 0;
  let charIndex   = 0;
  let isDeleting  = false;

  // Append cursor span
  const cursor = document.createElement('span');
  cursor.className = 'typewriter-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  el.after(cursor);

  function type() {
    const current = roles[roleIndex];

    if (isDeleting) {
      charIndex--;
      el.textContent = current.slice(0, charIndex);
    } else {
      charIndex++;
      el.textContent = current.slice(0, charIndex);
    }

    let delay = isDeleting ? 60 : 110;

    if (!isDeleting && charIndex === current.length) {
      delay = 1800; // pause before deleting
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      delay = 300;
    }

    setTimeout(type, delay);
  }

  // Start after hero animation delay
  setTimeout(type, 1400);
})();

// ──────────────────────────────────────
// SCROLL REVEAL — IntersectionObserver
// ──────────────────────────────────────

(function initScrollReveal() {
  // Add .reveal class to target elements
  const targets = [
    '.about__grid',
    '.stat-card',
    '.project-card',
    '.contact__form-wrapper',
    '.contact__info',
    '.contact-channel',
    '.section__title',
    '.section__subtitle',
    '.section__label',
    '.projects__filters',
  ];

  targets.forEach(selector => {
    $$(selector).forEach((el, i) => {
      el.classList.add('reveal');
      el.style.transitionDelay = `${i * 60}ms`;
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal--visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px',
  });

  $$('.reveal').forEach(el => observer.observe(el));
})();

// ──────────────────────────────────────
// COUNTER ANIMATION (about stats)
// ──────────────────────────────────────

(function initCounters() {
  const counters = $$('[data-target]');
  if (!counters.length) return;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1500;
    const start    = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const value    = Math.floor(easeOutCubic(progress) * target);
      el.textContent = value;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const numberEl = entry.target.querySelector('[data-target]');
        if (numberEl) animateCounter(numberEl);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  $$('.stat-card').forEach(card => counterObserver.observe(card));
})();

// ──────────────────────────────────────
// PROJECT FILTER
// ──────────────────────────────────────

(function initProjectFilter() {
  const filterBtns = $$('.filter-btn');
  const cards      = $$('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Update button states
      filterBtns.forEach(b => {
        b.classList.remove('filter-btn--active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('filter-btn--active');
      btn.setAttribute('aria-selected', 'true');

      // Filter cards with fade
      cards.forEach((card, i) => {
        const category = card.dataset.category;
        const show = filter === 'all' || category === filter;

        if (show) {
          card.style.display = '';
          // Stagger entrance
          requestAnimationFrame(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
              card.style.transition = `opacity 0.3s ease, transform 0.3s ease`;
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, i * 50);
          });
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
})();

// ──────────────────────────────────────
// CONTACT FORM — validation + submission
// ──────────────────────────────────────

(function initContactForm() {
  const form      = $('#contact-form');
  const submitBtn = $('#submit-btn');
  const successEl = $('#form-success');
  if (!form) return;

  // Simple email regex (RFC-compliant enough for UI validation)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function getFieldError(id, value) {
    switch (id) {
      case 'name':
        if (!value.trim()) return 'O nome é obrigatório.';
        if (value.trim().length < 2) return 'O nome deve ter ao menos 2 caracteres.';
        return '';
      case 'email':
        if (!value.trim()) return 'O e-mail é obrigatório.';
        if (!emailRegex.test(value.trim())) return 'Informe um e-mail válido.';
        return '';
      case 'message':
        if (!value.trim()) return 'A mensagem é obrigatória.';
        if (value.trim().length < 10) return 'A mensagem deve ter ao menos 10 caracteres.';
        return '';
      default:
        return '';
    }
  }

  function showError(inputEl, errorId, message) {
    const errorEl = $(`#${errorId}`);
    inputEl.classList.toggle('form-input--error', !!message);
    if (errorEl) errorEl.textContent = message;
  }

  // Validate on blur (validate after user finishes typing)
  ['name', 'email', 'message'].forEach(id => {
    const input = $(`#${id}`);
    if (!input) return;

    input.addEventListener('blur', () => {
      const error = getFieldError(id, input.value);
      showError(input, `${id}-error`, error);
    });

    // Clear error on focus
    input.addEventListener('focus', () => {
      showError(input, `${id}-error`, '');
    });
  });

  // Form submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validate all required fields
    const fields = [
      { id: 'name',    el: $('#name')    },
      { id: 'email',   el: $('#email')   },
      { id: 'message', el: $('#message') },
    ];

    let firstErrorEl = null;
    let hasError = false;

    fields.forEach(({ id, el }) => {
      if (!el) return;
      const error = getFieldError(id, el.value);
      showError(el, `${id}-error`, error);
      if (error && !firstErrorEl) firstErrorEl = el;
      if (error) hasError = true;
    });

    if (hasError) {
      // Focus first invalid field for accessibility
      if (firstErrorEl) firstErrorEl.focus();
      return;
    }

    // Simulate async submission
    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      showSuccessState();
    }, 1800);
  });

  function setSubmitting(loading) {
    submitBtn.disabled = loading;
    submitBtn.classList.toggle('btn--loading', loading);
  }

  function showSuccessState() {
    form.reset();
    successEl.removeAttribute('aria-hidden');
    successEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    showToast('Mensagem enviada com sucesso!');

    setTimeout(() => {
      successEl.setAttribute('aria-hidden', 'true');
    }, 6000);
  }
})();

// ──────────────────────────────────────
// TOAST NOTIFICATION
// ──────────────────────────────────────

function showToast(message, duration = 4000) {
  const toast = $('#toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('toast--visible');

  setTimeout(() => {
    toast.classList.remove('toast--visible');
  }, duration);
}

// ──────────────────────────────────────
// SMOOTH SCROLL — offset for fixed navbar
// ──────────────────────────────────────

(function initSmoothScroll() {
  const NAVBAR_HEIGHT = 80;

  document.addEventListener('click', (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const target = $(anchor.getAttribute('href'));
    if (!target) return;

    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - NAVBAR_HEIGHT;
    window.scrollTo({ top, behavior: 'smooth' });

    // Update URL hash without triggering scroll
    history.pushState(null, '', anchor.getAttribute('href'));
  });
})();

// ──────────────────────────────────────
// KEYBOARD NAVIGATION — focus on route change
// ──────────────────────────────────────

(function initFocusManagement() {
  // After smooth-scroll, move focus to main heading of target section
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash;
    if (!hash) return;
    const target = $(hash);
    if (target) {
      const heading = target.querySelector('h1, h2, h3') || target;
      heading.setAttribute('tabindex', '-1');
      heading.focus({ preventScroll: true });
    }
  });
})();
