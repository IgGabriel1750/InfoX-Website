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

  // ---------- 4. Tabbed forms (community.html) ----------
  var tabs = document.querySelectorAll('.form-tab');
  if (tabs.length) {
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var targetId = tab.getAttribute('data-tab');
        // Deactivate all
        tabs.forEach(function (t) {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        document.querySelectorAll('.form-tab-panel').forEach(function (p) {
          p.hidden = true;
          p.classList.remove('active');
        });
        // Activate clicked
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        var panel = document.getElementById(targetId);
        if (panel) {
          panel.hidden = false;
          panel.classList.add('active');
          // Lazy-load iframe on first view
          var iframe = panel.querySelector('iframe[data-src]');
          if (iframe) {
            iframe.src = iframe.getAttribute('data-src');
            iframe.removeAttribute('data-src');
          }
        }
      });
    });
    // Load the first tab's iframe on page load
    var firstIframe = document.querySelector('.form-tab-panel.active iframe[data-src]');
    if (firstIframe) {
      firstIframe.src = firstIframe.getAttribute('data-src');
      firstIframe.removeAttribute('data-src');
    }
  }

  // ---------- 5. Deep-link to tab via hash (e.g. #tab-join) ----------
  if (location.hash && document.querySelector('.form-tab[data-tab="' + location.hash.slice(1) + '"]')) {
    var targetTab = document.querySelector('.form-tab[data-tab="' + location.hash.slice(1) + '"]');
    if (targetTab) targetTab.click();
    var formsSection = document.getElementById('community-forms');
    if (formsSection) {
      setTimeout(function () { formsSection.scrollIntoView({ behavior: 'smooth' }); }, 300);
    }
  }

  // ---------- 6. JS-driven marquee scroll (mobile-safe) ----------
  // On mobile, navigating away kills rAF loops. When the page is
  // restored from bfcache (back button), loops stay dead.
  // Fix: track each loop's state and restart on pageshow / visibility.
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var marquees = [];

  if (!reducedMotion) {
    document.querySelectorAll('.flag-track, .social-track').forEach(function (track) {
      var state = {
        track: track,
        speed: track.classList.contains('flag-track') ? 0.6 : 0.5,
        pos: 0,
        halfWidth: track.scrollWidth / 2,
        paused: false,
        running: false
      };

      var parent = track.parentElement;
      if (parent) {
        parent.addEventListener('mouseenter', function () { state.paused = true; });
        parent.addEventListener('mouseleave', function () { state.paused = false; });
        // Touch devices: pause while touching
        parent.addEventListener('touchstart', function () { state.paused = true; }, { passive: true });
        parent.addEventListener('touchend', function () { state.paused = false; }, { passive: true });
      }

      state.lastTime = 0;
      state.tick = function (timestamp) {
        if (!state.lastTime) state.lastTime = timestamp;
        var delta = timestamp - state.lastTime;
        state.lastTime = timestamp;
        // Cap delta at 50ms (20fps min) so returning from background
        // doesn't cause a huge jump
        if (delta > 50) delta = 16;
        if (!state.paused) {
          state.pos -= state.speed * (delta / 16);
          if (Math.abs(state.pos) >= state.halfWidth) state.pos = 0;
          state.track.style.transform = 'translateX(' + state.pos + 'px)';
        }
        if (state.running) requestAnimationFrame(state.tick);
      };

      marquees.push(state);
    });

    function startAll() {
      marquees.forEach(function (m) {
        if (!m.running) {
          m.running = true;
          m.lastTime = 0; // reset so first frame doesn't jump
          m.halfWidth = m.track.scrollWidth / 2;
          requestAnimationFrame(m.tick);
        }
      });
    }

    function stopAll() {
      marquees.forEach(function (m) { m.running = false; });
    }

    // Start immediately
    startAll();

    // Mobile bfcache restore (back button) — always restart, not just persisted
    window.addEventListener('pageshow', function () {
      stopAll();
      startAll();
    });

    // Tab switch / app switch on mobile
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState === 'visible') {
        stopAll();
        startAll();
      } else {
        stopAll();
      }
    });

    // Extra safety: window focus
    window.addEventListener('focus', function () {
      stopAll();
      startAll();
    });

    // Nuclear fallback: heartbeat every 2s checks if loops died and restarts.
    // On some mobile browsers none of the above events fire reliably.
    setInterval(function () {
      if (document.visibilityState === 'visible') {
        var anyDead = marquees.some(function (m) { return !m.running; });
        if (anyDead) startAll();
      }
    }, 2000);
  }

  // ---------- 7. FAQ accordion ----------
  document.querySelectorAll('.faq-question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      var isOpen = item.classList.contains('open');

      // Close all siblings in the same section
      var section = item.closest('.faq-section');
      if (section) {
        section.querySelectorAll('.faq-item.open').forEach(function (openItem) {
          openItem.classList.remove('open');
          openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        });
      }

      // Toggle clicked
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

})();
