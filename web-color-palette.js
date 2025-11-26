/**
 * Color Swatches - Automatic Hex Display
 * Automatically converts CSS variable colors to hex codes
 * @version 1.0.0
 */

(function() {
  'use strict';

  /**
   * Converts RGB color format to Hex
   * @param {string} rgb - RGB color string (e.g., "rgb(255, 255, 255)")
   * @returns {string} Hex color code (e.g., "#FFFFFF")
   */
  function rgbToHex(rgb) {
    // Extract RGB values from rgb(r, g, b) format
    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return rgb; // Return original if not RGB format
    
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  }

  /**
   * Initializes color swatches with hex values
   */
  function initColorSwatches() {
    const swatches = document.querySelectorAll('.color-swatch');
    
    if (swatches.length === 0) {
      console.warn('Color Swatches: No .color-swatch elements found');
      return;
    }
    
    swatches.forEach(function(swatch) {
      const hexElement = swatch.querySelector('.hex');
      
      if (!hexElement) {
        console.warn('Color Swatches: No .hex element found in swatch');
        return;
      }
      
      // Get the computed background color
      const bgColor = window.getComputedStyle(swatch).backgroundColor;
      
      // Convert to hex and display
      const hexColor = rgbToHex(bgColor);
      hexElement.textContent = hexColor;
    });
    
    console.log('Color Swatches: Initialized successfully');
  }

  // Wait for DOM to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initColorSwatches);
  } else {
    // DOM already loaded
    initColorSwatches();
  }

})();
