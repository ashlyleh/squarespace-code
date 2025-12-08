/**
 * Back to Top Button & AOS Initialization
 * Handles scroll-triggered back-to-top button visibility and AOS animations
 * Injects HTML and loads required libraries
 * @version 2.0.0
 */
(function() {
  'use strict';

  /**
   * Inject the Back to Top HTML and AOS library
   */
  function injectHTML() {
    // Create anchor target at top of page
    const topAnchor = document.createElement('div');
    topAnchor.id = 'top';
    document.body.insertBefore(topAnchor, document.body.firstChild);
    
    // Create back to top button HTML
    const buttonHTML = `
      <div id="back-to-top">
        <a href="#top" aria-label="Back to top">
          <span class="material-symbols-outlined">arrow_upward</span>
        </a>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', buttonHTML);
    
    // Load AOS CSS
    const aosCSS = document.createElement('link');
    aosCSS.href = 'https://unpkg.com/aos@2.3.4/dist/aos.css';
    aosCSS.rel = 'stylesheet';
    document.head.appendChild(aosCSS);
    
    // Load AOS JS
    const aosScript = document.createElement('script');
    aosScript.src = 'https://unpkg.com/aos@2.3.4/dist/aos.js';
    aosScript.onload = initAOS;
    document.head.appendChild(aosScript);
    
    console.log('Back to Top: HTML injected successfully');
  }

  /**
   * Initialize Back to Top button functionality
   */
  function initBackToTop() {
    const button = document.getElementById('back-to-top');
    
    if (!button) {
      console.warn('Back to Top: No #back-to-top element found');
      return;
    }
    
    window.addEventListener('scroll', function() {
      if (window.scrollY > 300) {
        button.classList.add('show');
      } else {
        button.classList.remove('show');
      }
    });
    
    console.log('Back to Top: Initialized successfully');
  }

  /**
   * Initialize AOS (Animate On Scroll) library
   */
  function initAOS() {
    if (typeof AOS === 'undefined') {
      console.warn('Back to Top: AOS library not loaded');
      return;
    }
    
    AOS.init({
      duration: 800,
      once: true
    });
    
    console.log('Back to Top: AOS initialized successfully');
  }

  /**
   * Initialize all functionality
   */
  function init() {
    injectHTML();
    initBackToTop();
  }

  // Wait for DOM to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
