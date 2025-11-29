/**
 * Color Swatches - Automatic Color Conversion
 * Handles both brand colors (HEX → RGB/CMYK) and website colors (CSS variables → HEX)
 * @version 2.0.0
 */
(function() {
  'use strict';

  /**
   * Converts HEX color to RGB
   * @param {string} hex - Hex color code (e.g., "#FFFFFF")
   * @returns {object} RGB values {r, g, b}
   */
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Converts RGB to CMYK
   * @param {number} r - Red value (0-255)
   * @param {number} g - Green value (0-255)
   * @param {number} b - Blue value (0-255)
   * @returns {object} CMYK values {c, m, y, k}
   */
  function rgbToCmyk(r, g, b) {
    let c = 1 - (r / 255);
    let m = 1 - (g / 255);
    let y = 1 - (b / 255);
    let k = Math.min(c, m, y);
    
    if (k === 1) {
      c = m = y = 0;
    } else {
      c = Math.round(((c - k) / (1 - k)) * 100);
      m = Math.round(((m - k) / (1 - k)) * 100);
      y = Math.round(((y - k) / (1 - k)) * 100);
      k = Math.round(k * 100);
    }
    
    return { c, m, y, k };
  }

  /**
   * Converts RGB color format to Hex
   * @param {string} rgb - RGB color string (e.g., "rgb(255, 255, 255)")
   * @returns {string} Hex color code (e.g., "#FFFFFF")
   */
  function rgbToHex(rgb) {
    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return rgb;
    
    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);
    
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  }

  /**
   * Initializes brand color palette with automatic RGB and CMYK conversion
   */
  function initBrandPalette() {
    const palette = document.querySelector('.brand-color-palette');
    
    if (!palette) {
      console.log('Color Swatches: No brand-color-palette found');
      return;
    }
    
    const swatches = palette.querySelectorAll('.color-swatch[data-hex]');
    
    swatches.forEach(function(swatch) {
      const hexColor = swatch.getAttribute('data-hex');
      const rgb = hexToRgb(hexColor);
      
      if (!rgb) {
        console.warn('Color Swatches: Invalid hex color', hexColor);
        return;
      }
      
      const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
      
      // Set background color and determine text color
      swatch.style.backgroundColor = hexColor;
      const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
      swatch.style.color = brightness > 128 ? '#000' : '#fff';
      
      // Update text content
      const hexElement = swatch.querySelector('.hex');
      const rgbElement = swatch.querySelector('.rgb');
      const cmykElement = swatch.querySelector('.cmyk');
      
      if (hexElement) hexElement.textContent = hexColor;
      if (rgbElement) rgbElement.textContent = rgb.r + ', ' + rgb.g + ', ' + rgb.b;
      if (cmykElement) cmykElement.textContent = cmyk.c + ', ' + cmyk.m + ', ' + cmyk.y + ', ' + cmyk.k;
    });
    
    console.log('Color Swatches: brand-color-palette initialized successfully');
  }

/**
 * Initializes website color palette from CSS variables
 */
function initWebsitePalette() {
  const palette = document.querySelector('.website-color-palette');
  
  if (!palette) {
    console.log('Color Swatches: No website-color-palette found');
    return;
  }
  
  const swatches = palette.querySelectorAll('.color-swatch[data-var]');
  
  swatches.forEach(function(swatch) {
    const hexElement = swatch.querySelector('.hex');
    const varName = swatch.getAttribute('data-var');
    
    if (!hexElement || !varName) {
      console.warn('Color Swatches: Missing .hex element or data-var attribute');
      return;
    }
    
    // Get the CSS variable value from :root
    const cssVarValue = getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim();
    
    if (!cssVarValue) {
      console.warn('Color Swatches: CSS variable not found:', varName);
      return;
    }
    
    // If it's already a hex color, use it directly
    if (cssVarValue.startsWith('#')) {
      hexElement.textContent = cssVarValue.toUpperCase();
    } 
    // If it's an RGB color, convert it to hex
    else if (cssVarValue.startsWith('rgb')) {
      const hexColor = rgbToHex(cssVarValue);
      hexElement.textContent = hexColor;
    }
    else {
      console.warn('Color Swatches: Unsupported color format:', cssVarValue);
    }
  });
  
  console.log('Color Swatches: website-color-palette initialized successfully');
}

  /**
   * Initializes all color palettes
   */
  function initAllPalettes() {
    initBrandPalette();
    initWebsitePalette();
  }

  // Wait for DOM to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllPalettes);
  } else {
    initAllPalettes();
  }

})();
