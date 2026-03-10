// script.js — improved mobile nav behavior, accessibility, theme persistence, smooth scroll, and reveal animations
(function () {
  const THEME_KEY = 'theme-preference';
  const root = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  // --- Theme management ---
  function readSavedTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (e) {
      return null;
    }
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      if (themeToggle) themeToggle.setAttribute('aria-pressed', 'true');
    } else {
      root.setAttribute('data-theme', 'light');
      if (themeToggle) themeToggle.setAttribute('aria-pressed', 'false');
    }
  }

  function initTheme() {
    const saved = readSavedTheme();
    if (saved === 'dark' || saved === 'light') {
      applyTheme(saved);
      return;
    }
    // fallback to system preference
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }

  function setTheme(theme) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      // ignore write errors (e.g., privacy mode)
    }
    applyTheme(theme);
  }

  function toggleTheme() {
    const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    setTheme(current === 'dark' ? 'light' : 'dark');
  }

  // --- Smooth scroll + update aria-current + close mobile nav on link click ---
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', function (e) {
        const target = this.getAttribute('href');
        if (!target || target === '#') return;
        // links to IDs only
        if (target.length > 1) {
          const el = document.querySelector(target);
          if (el) {
            e.preventDefault();
            // update aria-current on nav links if present
            updateAriaCurrent(this);
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // Close mobile nav if data-close-on-click is set
            if (navLinks && navLinks.dataset.closeOnClick === 'true' && navLinks.classList.contains('show')) {
              closeMobileNav();
            }
          }
        }
      });
    });
  }

  function updateAriaCurrent(linkElement) {
    if (!navLinks) return;
    // Remove aria-current from all menu links in navLinks
    navLinks.querySelectorAll('a[role="menuitem"], a').forEach(a => {
      a.removeAttribute('aria-current');
    });
    // Set aria-current on the provided link if it's inside navLinks
    if (linkElement && navLinks.contains(linkElement)) {
      linkElement.setAttribute('aria-current', 'page');
    }
  }

  // --- Mobile nav control ---
  function openMobileNav() {
    if (!navLinks || !navToggle) return;
    navLinks.classList.add('show');
    navToggle.setAttribute('aria-expanded', 'true');
  }

  function closeMobileNav() {
    if (!navLinks || !navToggle) return;
    navLinks.classList.remove('show');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  function toggleMobileNav() {
    if (!navLinks || !navToggle) return;
    const isOpen = navLinks.classList.contains('show');
    if (isOpen) closeMobileNav();
    else openMobileNav();
  }

  function initNavToggle() {
    if (!navToggle || !navLinks) return;

    // click on toggle button
    navToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleMobileNav();
      // move focus to first menu item when opening
      if (navLinks.classList.contains('show')) {
        const first = navLinks.querySelector('a');
        if (first) first.focus();
      }
    });

    // close when clicking outside nav (for mobile)
    document.addEventListener('click', function (e) {
      if (!navLinks.classList.contains('show')) return;
      const target = e.target;
      if (!navLinks.contains(target) && !navToggle.contains(target)) {
        closeMobileNav();
      }
    });

    // close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || e.key === 'Esc') {
        if (navLinks.classList.contains('show')) {
          closeMobileNav();
          navToggle.focus();
        }
      }
    });

    // If data-close-on-click present, close nav when a menu link is clicked
    if (navLinks.dataset.closeOnClick === 'true') {
      navLinks.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          // small timeout to allow any click handler (like smooth scroll) to run
          setTimeout(() => {
            if (navLinks.classList.contains('show')) closeMobileNav();
          }, 120);
        });
      });
    }
  }

  // --- Intersection Observer reveals ---
  function initReveal() {
    const items = document.querySelectorAll('.reveal');
    if (!items || items.length === 0) return;
    const obs = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(i => obs.observe(i));
  }

  // --- Init all on DOMContentLoaded ---
  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initSmoothScroll();
    initNavToggle();
    initReveal();

    // attach theme toggle listener
    if (themeToggle) {
      themeToggle.addEventListener('click', function (e) {
        e.preventDefault();
        toggleTheme();
      });
    }

    // ensure aria-current initially set to the 'Beranda' link if present
    if (navLinks) {
      const current = navLinks.querySelector('a[aria-current="page"]') || navLinks.querySelector('a[href="#home"]');
      if (current) updateAriaCurrent(current);
    }
  });

  // Export for debugging in console if needed
  window.__havid_portfolio = {
    openMobileNav,
    closeMobileNav,
    toggleTheme,
    setTheme,
    readSavedTheme
  };
})();
