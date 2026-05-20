/**
 * AOS (Animate On Scroll) Initializer
 * Loads the AOS library and initializes it with default settings.
 * Override AOS options via window.AOSConfig before this script loads.
 * @version 1.0.0
 */
(function () {
  'use strict';

  var config = Object.assign({
    duration: 800,
    once: true,
  }, window.AOSConfig || {});

  /* Load AOS CSS */
  var css  = document.createElement('link');
  css.rel  = 'stylesheet';
  css.href = 'https://unpkg.com/aos@2.3.4/dist/aos.css';
  document.head.appendChild(css);

  /* Load AOS JS, then init */
  var script    = document.createElement('script');
  script.src    = 'https://unpkg.com/aos@2.3.4/dist/aos.js';
  script.onload = function () {
    if (typeof AOS === 'undefined') {
      console.warn('AOS Init: Library failed to load.');
      return;
    }
    AOS.init(config);
    console.log('AOS Init: Initialized successfully.');
  };
  document.head.appendChild(script);

})();
