/**
 * Back to Top Button & AOS Initialization
 * Handles scroll-triggered back-to-top button visibility and AOS animations
 * Injects HTML and loads required libraries
 * @version 2.1.0
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
    
    // Create back to top button HTML with text label
    const buttonHTML = `
      <a id="back-to-top" href="#top">
        <span>To Top</span>
        <span class="material-symbols-outlined">arrow_upward</span>
      </a>
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
    const backToTop = document.getElementById('back-to-top');
    
    if (!backToTop || backToTop.dataset.initialized) return;
    
    backToTop.dataset.initialized = 'true';
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
      if (window.scrollY > 300) {
        backToTop.classList.add('show');
      } else {
        backToTop.classList.remove('show');
      }
    });
    
    // Smooth scroll to top on click
    backToTop.addEventListener('click', function(e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
  
  // Watch for dynamically loaded content (Section Loader Supreme compatibility)
  const observer = new MutationObserver(function(mutations) {
    for (const mutation of mutations) {
      if (mutation.addedNodes.length) {
        initBackToTop();
      }
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Wait for DOM to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
