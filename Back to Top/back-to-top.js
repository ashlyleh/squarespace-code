/**
 * Back to Top Button
 * Scroll-triggered back-to-top button with CSS custom property configuration.
 * Supports icon-only or icon + text modes, left/center/right positioning,
 * and dynamic Material Symbols font variant loading.
 * @version 3.0.0
 */
(function () {
  'use strict';

  /* ─── Constants ─────────────────────────────────────────── */
  const SCROLL_THRESHOLD = 300;
  const BUTTON_ID        = 'back-to-top';
  const ANCHOR_ID        = 'top';
  const FONT_URLS = {
    outlined: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap',
    rounded:  'https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap',
    sharp:    'https://fonts.googleapis.com/css2?family=Material+Symbols+Sharp:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap',
  };

  /* ─── Read a CSS custom property from an element ────────── */
  function getCSSProp(el, prop) {
    return getComputedStyle(el).getPropertyValue(prop).trim().replace(/^["']|["']$/g, '');
  }

  /* ─── Resolve config from CSS custom properties ─────────── */
  function resolveConfig(button) {
    return {
      position:    getCSSProp(button, '--btt-position')     || 'right',
      icon:        getCSSProp(button, '--btt-icon')         || 'arrow_upward',
      variant:     getCSSProp(button, '--btt-icon-variant') || 'outlined',
      showLabel:   getCSSProp(button, '--btt-show-label')   === '1',
      label:       getCSSProp(button, '--btt-label')        || 'Back to top',
      ariaLabel:   getCSSProp(button, '--btt-aria-label')   || 'Back to top',
    };
  }

  /* ─── Dynamically load the correct Material Symbols font ── */
  function loadFont(variant) {
    const url = FONT_URLS[variant] || FONT_URLS.outlined;
    if (document.querySelector(`link[href="${url}"]`)) return;
    const link  = document.createElement('link');
    link.rel    = 'stylesheet';
    link.href   = url;
    document.head.appendChild(link);
  }

  /* ─── Detect the scrolling container ────────────────────── */
  function detectScrollContainer() {
    /* Squarespace sometimes uses a wrapper element as the scroll root.
       Walk up from body looking for an element that actually scrolls. */
    const candidates = [
      document.querySelector('#canvas'),
      document.querySelector('.Site'),
      document.querySelector('[data-controller="HashManager"]'),
      document.documentElement,
      document.body,
    ];

    for (const el of candidates) {
      if (!el) continue;
      if (el.scrollHeight > el.clientHeight) {
        const overflow = getComputedStyle(el).overflowY;
        if (overflow === 'scroll' || overflow === 'auto') {
          return el;
        }
      }
    }

    console.warn('Back to Top: Could not detect scroll container — falling back to window.');
    return window;
  }

  /* ─── Inject anchor + button HTML ───────────────────────── */
  function injectHTML() {
    /* Top anchor */
    if (!document.getElementById(ANCHOR_ID)) {
      const anchor  = document.createElement('div');
      anchor.id     = ANCHOR_ID;
      document.body.insertBefore(anchor, document.body.firstChild);
    }

    /* Button wrapper — inject early so we can read CSS props from it */
    if (!document.getElementById(BUTTON_ID)) {
      const wrapper = document.createElement('div');
      wrapper.id    = BUTTON_ID;
      document.body.appendChild(wrapper);
    }
  }

  /* ─── Build button inner content from resolved config ────── */
  function buildButtonContent(button) {
    const config   = resolveConfig(button);
    const iconClass = `material-symbols-${config.variant}`;

    loadFont(config.variant);

    button.setAttribute('aria-label', config.ariaLabel);

    const labelHTML = config.showLabel
      ? `<span class="btt-label">${config.label}</span>`
      : '';

    button.innerHTML = `
      <a href="#${ANCHOR_ID}" aria-hidden="true" tabindex="-1">
        <span class="${iconClass}">${config.icon}</span>${labelHTML}
      </a>
    `;

    /* Apply position class */
    button.classList.remove('btt-left', 'btt-center', 'btt-right');
    button.classList.add(`btt-${config.position}`);
  }

  /* ─── Scroll visibility handler ─────────────────────────── */
  function initScrollListener(button, container) {
    const getScrollTop = () =>
      container === window ? window.scrollY : container.scrollTop;

    const onScroll = () => {
      if (getScrollTop() > SCROLL_THRESHOLD) {
        button.classList.add('show');
      } else {
        button.classList.remove('show');
      }
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); /* Run once on init in case page loads mid-scroll */
  }

  /* ─── Entry point ────────────────────────────────────────── */
  function init() {
    injectHTML();

    const button    = document.getElementById(BUTTON_ID);
    const container = detectScrollContainer();

    buildButtonContent(button);
    initScrollListener(button, container);

    console.log('Back to Top: Initialized successfully.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
