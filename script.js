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
  const navbar     = $('.navbar');
  const toggle     = $('.navbar__toggle');
  const mobileMenu = $('#mobile-menu');

  // Scroll: add glass background when not at top
  function onScroll() {
    navbar.classList.toggle('navbar--scrolled', window.scrollY > 20);
  }
  window.addEventListener('scroll', debounce(onScroll, 8), { passive: true });
  onScroll();

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

  // Event delegation — works with dynamically-rendered links
  mobileMenu.addEventListener('click', e => {
    if (e.target.classList.contains('mobile-nav-link')) closeMenu();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) closeMenu();
  });

  // Active nav link on scroll — fresh query to support dynamic links
  function updateActiveLink() {
    const scrollPos = window.scrollY + 120;
    let currentId   = '';
    $$('section[id]').forEach(section => {
      if (section.offsetTop <= scrollPos) currentId = section.id;
    });
    $$('.nav-link').forEach(link => {
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

function initTypewriter(roles) {
  const el = $('#typewriter');
  if (!el) return;

  let roleIndex  = 0;
  let charIndex  = 0;
  let isDeleting = false;

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
}

// ──────────────────────────────────────
// CONTENT — Carrega data.json e injeta no DOM
// ──────────────────────────────────────

(async function loadContent() {
  const FALLBACK_ROLES = ['Full Stack', 'Backend', 'C# .NET', 'Golang', 'Microservices'];

  let data;
  try {
    const response = await fetch('data.json');
    data = await response.json();
  } catch (e) {
    console.warn('Falha ao carregar data.json; usando conteúdo estático.');
    initTypewriter(FALLBACK_ROLES);
    return;
  }

  const { meta, navbar, hero, about, experience, projects, contact, footer } = data;

  function setText(sel, text) {
    const el = document.querySelector(sel);
    if (el) el.textContent = text;
  }

  function setHTML(sel, html) {
    const el = document.querySelector(sel);
    if (el) el.innerHTML = html;
  }

  function setAttr(sel, attr, val) {
    const el = document.querySelector(sel);
    if (el) el.setAttribute(attr, val);
  }

  // ── Meta
  document.title = meta.title;
  setAttr('meta[name="description"]', 'content', meta.description);

  // ── Hero
  setText('.hero__greeting', hero.greeting);
  setHTML('#hero-heading',
    `${hero.name}<br><span class="hero__name--accent">${hero.nameAccent}</span>`
  );

  const heroRoleEl = document.querySelector('.hero__role');
  if (heroRoleEl) {
    const typewriterSpan = heroRoleEl.querySelector('#typewriter');
    heroRoleEl.textContent = `${hero.rolePrefix} `;
    if (typewriterSpan) heroRoleEl.appendChild(typewriterSpan);
  }

  setText('.hero__description', hero.description);

  const ctaPrimary = document.querySelector('.hero__actions .btn--primary');
  if (ctaPrimary) {
    const svg = ctaPrimary.querySelector('svg');
    ctaPrimary.textContent = hero.ctaPrimary + ' ';
    if (svg) ctaPrimary.appendChild(svg);
  }

  setText('.hero__actions .btn--secondary', hero.ctaSecondary);

  // ── About
  setText('#about .section__label', about.sectionLabel);
  setText('#about-heading', about.title);

  const aboutParas = document.querySelectorAll('.about__text > p');
  about.paragraphs.forEach((html, i) => {
    if (aboutParas[i]) aboutParas[i].innerHTML = html;
  });

  setText('.tech-stack__label', about.techStackLabel);
  const techList = document.querySelector('.tech-stack__list');
  if (techList) {
    techList.innerHTML = about.techStack
      .map(t => `<li class="tech-badge">${t}</li>`)
      .join('');
  }

  const statCards = document.querySelectorAll('.stat-card');
  about.stats.forEach((stat, i) => {
    if (!statCards[i]) return;
    const numEl = statCards[i].querySelector('.stat-card__number');
    const sufEl = statCards[i].querySelector('.stat-card__suffix');
    const lblEl = statCards[i].querySelector('.stat-card__label');
    if (numEl) numEl.setAttribute('data-target', stat.target);
    if (sufEl) sufEl.textContent = stat.suffix;
    if (lblEl) lblEl.innerHTML = stat.label;
  });

  // ── Experience
  setText('#experience .section__label', experience.sectionLabel);
  setText('#experience-heading', experience.title);
  setText('#experience .section__subtitle', experience.subtitle);

  // ── Projects
  setText('#projects .section__label', projects.sectionLabel);
  setText('#projects-heading', projects.title);
  setText('#projects .section__subtitle', projects.subtitle);

  const viewAllLink = document.querySelector('.projects__more a');
  if (viewAllLink) {
    viewAllLink.href = projects.viewAllUrl;
    const svg = viewAllLink.querySelector('svg');
    viewAllLink.textContent = projects.viewAllLabel + ' ';
    if (svg) viewAllLink.appendChild(svg);
  }

  // ── Contact
  setText('#contact .section__label', contact.sectionLabel);
  setText('#contact-heading', contact.title);
  setText('#contact .section__subtitle', contact.subtitle);
  setAttr('#name',    'placeholder', contact.form.namePlaceholder);
  setAttr('#email',   'placeholder', contact.form.emailPlaceholder);
  setAttr('#subject', 'placeholder', contact.form.subjectPlaceholder);
  setAttr('#message', 'placeholder', contact.form.messagePlaceholder);
  setText('.btn__text', contact.form.submitLabel);

  const successEl = document.querySelector('#form-success');
  if (successEl) {
    const svg = successEl.querySelector('svg');
    successEl.textContent = contact.form.successMessage;
    if (svg) successEl.insertBefore(svg, successEl.firstChild);
  }

  setText('.contact__info-title', contact.infoTitle);

  const availBadge = document.querySelector('.availability-badge');
  if (availBadge) {
    const dot = availBadge.querySelector('.availability-dot');
    availBadge.textContent = contact.availabilityText;
    if (dot) availBadge.insertBefore(dot, availBadge.firstChild);
    availBadge.setAttribute('aria-label', `Status: ${contact.availabilityText.toLowerCase()}`);
  }

  // ── Footer
  const footerCopy = document.querySelector('.footer__copy');
  if (footerCopy) footerCopy.innerHTML = footer.copy;

  // ── Navbar links
  const desktopNav = document.querySelector('.navbar__links');
  const mobileNav  = document.querySelector('.mobile-menu__links');
  if (desktopNav) {
    desktopNav.innerHTML = navbar.links
      .map(l => `<li><a href="${l.href}" class="nav-link">${l.label}</a></li>`)
      .join('');
  }
  if (mobileNav) {
    mobileNav.innerHTML = navbar.links
      .map(l => `<li><a href="${l.href}" class="mobile-nav-link">${l.label}</a></li>`)
      .join('');
  }

  // ── Hero socials
  const SOCIAL_SVG = {
    github:   `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>`,
    linkedin: `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
    twitter:  `<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.906-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>`,
  };
  const socialsEl = document.querySelector('.hero__socials');
  if (socialsEl) {
    socialsEl.innerHTML = hero.socials
      .map(s => `<a href="${s.href}" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="${s.label}">${SOCIAL_SVG[s.type] || ''}</a>`)
      .join('');
  }

  // ── Experience timeline
  const CLOCK_SVG = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`;
  const timeline = document.querySelector('.timeline');
  if (timeline) {
    timeline.innerHTML = experience.items.map(item => {
      const sideClass  = `timeline__item--${item.side}`;
      const lastClass  = item.isLast  ? ' timeline__item--last'    : '';
      const dotClass   = item.isCurrent ? ' timeline__dot--current'  : '';
      const badgeClass = item.isCurrent ? ' timeline__badge--current' : '';
      const lineHTML   = item.isLast  ? '' : '<div class="timeline__line"></div>';
      const hiHTML     = item.highlights.map(h => `<li>${h}</li>`).join('');
      const tagHTML    = item.tags.map(t => `<span class="tag" role="listitem">${t}</span>`).join('');
      return `
        <article class="timeline__item ${sideClass}${lastClass}" role="listitem">
          <div class="timeline__axis" aria-hidden="true">
            <div class="timeline__dot${dotClass}"></div>
            ${lineHTML}
          </div>
          <div class="timeline__card">
            <div class="timeline__card-header">
              <div class="timeline__top-row">
                <span class="timeline__period">${CLOCK_SVG} ${item.period}</span>
                <span class="timeline__badge${badgeClass}">${item.badge}</span>
              </div>
              <h3 class="timeline__role">${item.role}</h3>
              <p class="timeline__company-line">
                <span class="timeline__company">${item.company}</span>
                <span class="timeline__sep" aria-hidden="true">·</span>
                <span class="timeline__location">${item.location}</span>
              </p>
            </div>
            <ul class="timeline__highlights" role="list">${hiHTML}</ul>
            <div class="timeline__tags" role="list" aria-label="Tecnologias utilizadas">${tagHTML}</div>
          </div>
        </article>`;
    }).join('');
  }

  // ── Project filters
  const filtersEl = document.querySelector('.projects__filters');
  if (filtersEl) {
    filtersEl.innerHTML = projects.filters
      .map(f => `<button class="filter-btn${f.default ? ' filter-btn--active' : ''}" role="tab" aria-selected="${f.default}" data-filter="${f.value}">${f.label}</button>`)
      .join('');
  }

  // ── Project cards
  const GITHUB_SVG16 = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>`;

  function buildMock(p) {
    const M = { POST: 'mock-method--post', PUT: 'mock-method--put', DELETE: 'mock-method--delete' };
    switch (p.mockType) {
      case 'terminal': {
        const lines = p.mockTerminal.lines
          .map(l => `<div class="mock-terminal__line ${l.cls}">${l.text}</div>`).join('');
        return `<div class="project-card__mock project-card__mock--5"><div class="mock-terminal"><span class="mock-terminal__prompt">$</span><span class="mock-terminal__cmd">${p.mockTerminal.cmd}</span>${lines}</div></div>`;
      }
      case 'endpoints': {
        const eps = p.mockEndpoints
          .map(e => `<div class="mock-endpoint"><span class="mock-method ${M[e.method] || ''}">${e.method}</span><span>${e.path}</span></div>`).join('');
        return `<div class="project-card__mock project-card__mock--2">${eps}</div>`;
      }
      case 'phone':
        return `<div class="project-card__mock project-card__mock--3"><div class="mock-phone"><div class="mock-phone__screen"><div class="mock-app-bar"></div><div class="mock-list-item"></div><div class="mock-list-item"></div><div class="mock-list-item mock-list-item--short"></div></div></div></div>`;
      default:
        return `<div class="project-card__mock project-card__mock--1"><div class="mock-bar"></div><div class="mock-bar mock-bar--short"></div><div class="mock-row"><div class="mock-block"></div><div class="mock-block mock-block--accent"></div></div></div>`;
    }
  }

  const grid = document.querySelector('#projects-grid');
  if (grid) {
    grid.innerHTML = projects.items.map(p => {
      const featuredBadge = p.featured
        ? `<div class="project-card__featured-badge" aria-label="Projeto em destaque">${p.featuredLabel}</div>` : '';
      const tagsHTML  = p.tags.map(t => `<span class="tag">${t}</span>`).join('');
      const linksHTML = p.github
        ? `<a href="${p.github}" target="_blank" rel="noopener noreferrer" class="project-link" aria-label="Ver repositório ${p.id} no GitHub">${GITHUB_SVG16} ${p.githubLabel}</a>` : '';
      return `
        <article class="project-card${p.featured ? ' project-card--featured' : ''}" data-category="${p.category}" role="listitem">
          ${featuredBadge}
          <div class="project-card__image" aria-hidden="true">${buildMock(p)}</div>
          <div class="project-card__body">
            <div class="project-card__tags">${tagsHTML}</div>
            <h3 class="project-card__title">${p.title}</h3>
            <p class="project-card__description">${p.description}</p>
            <div class="project-card__links">${linksHTML}</div>
          </div>
        </article>`;
    }).join('');
  }

  // ── Contact channels
  const CHANNEL_SVG = {
    email:    `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
    linkedin: `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`,
    github:   `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>`,
    location: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  };
  const channelsEl = document.querySelector('.contact__channels');
  if (channelsEl) {
    channelsEl.innerHTML = contact.channels.map(ch => {
      const isExternal = ch.type !== 'email';
      const valueEl = ch.href
        ? `<a href="${ch.href}"${isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''} class="contact-channel__value">${ch.value}</a>`
        : `<span class="contact-channel__value">${ch.value}</span>`;
      return `
        <li class="contact-channel">
          <div class="contact-channel__icon" aria-hidden="true">${CHANNEL_SVG[ch.type] || ''}</div>
          <div class="contact-channel__text">
            <span class="contact-channel__label">${ch.label}</span>
            ${valueEl}
          </div>
        </li>`;
    }).join('');
  }

  // ── Inicia o typewriter com os papéis do data.json
  initTypewriter(hero.typewriterRoles);

  // ── Init dynamic features (require rendered DOM)
  initProjectFilter();
  initScrollReveal();
  initCounters();
})();

// ──────────────────────────────────────
// SCROLL REVEAL — IntersectionObserver
// ──────────────────────────────────────

function initScrollReveal() {
  // Add .reveal class to target elements
  const targets = [
    '.about__grid',
    '.stat-card',
    '.timeline__card',
    '.timeline__dot',
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
      // Stagger timeline cards with longer delay between items
      if (selector === '.timeline__card') {
        el.style.transitionDelay = `${i * 120}ms`;
      } else {
        el.style.transitionDelay = `${i * 60}ms`;
      }
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
}

// ──────────────────────────────────────
// COUNTER ANIMATION (about stats)
// ──────────────────────────────────────

function initCounters() {
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
}

// ──────────────────────────────────────
// PROJECT FILTER
// ──────────────────────────────────────

function initProjectFilter() {
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
}

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
// TIMELINE — activate dots on scroll reveal
// ──────────────────────────────────────

(function initTimeline() {
  const items = $$('.timeline__item');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const dot = entry.target.querySelector('.timeline__dot');
        if (dot && !dot.classList.contains('timeline__dot--current')) {
          dot.style.borderColor = 'var(--color-accent)';
          dot.style.background  = 'var(--color-accent-glow)';
        }
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.35 });

  items.forEach(item => observer.observe(item));
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
