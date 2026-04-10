/* =========================================================
   Student InfoX Hub — Main JS
   Three responsibilities:
     1. Nav scroll state
     2. Mobile hamburger toggle
     3. Scroll reveal observer + hero load trigger
   ========================================================= */

(function () {
  'use strict';

  const nav = document.querySelector('.nav');
  const hero = document.querySelector('.hero');

  // ---------- 1. Nav scroll state ----------
  function updateNavState() {
    if (!nav) return;
    const threshold = hero ? hero.offsetHeight * 0.8 : 120;
    if (window.scrollY > threshold) {
      nav.classList.add('nav-scrolled');
    } else {
      nav.classList.remove('nav-scrolled');
    }
  }
  window.addEventListener('scroll', updateNavState, { passive: true });
  window.addEventListener('resize', updateNavState);
  updateNavState();

  // ---------- 2. Mobile hamburger ----------
  const toggle = document.querySelector('.nav-toggle');
  if (toggle && nav) {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.addEventListener('click', function () {
      const isOpen = nav.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      const icon = toggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars', !isOpen);
        icon.classList.toggle('fa-xmark', isOpen);
      }
    });

    // Close menu when a link is clicked
    document.querySelectorAll('.nav-links a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
        const icon = toggle.querySelector('i');
        if (icon) {
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-xmark');
        }
      });
    });
  }

  // ---------- Mark active nav link ----------
  const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    const href = (a.getAttribute('href') || '').toLowerCase();
    if (href === current || (current === '' && href === 'index.html')) {
      a.classList.add('active');
    }
  });

  // ---------- 3. Scroll reveal + hero load ----------
  const reveals = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(function (el) { io.observe(el); });
  } else {
    // Fallback: just show them
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Hero load stagger
  setTimeout(function () {
    document.body.classList.add('loaded');
  }, 100);

})();
