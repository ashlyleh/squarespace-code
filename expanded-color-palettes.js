document.addEventListener("DOMContentLoaded", () => {
  const swatches = document.querySelectorAll(".color-swatch");

  swatches.forEach((swatch) => {
    const hex = swatch.dataset.hex;
    if (!hex) return;

    // Set background color
    swatch.style.backgroundColor = hex;

    // Update HEX display
    const hexDisplay = swatch.querySelector(".hex");
    if (hexDisplay) hexDisplay.textContent = hex;

    // Convert and update RGB
    const rgb = hexToRgb(hex);
    const rgbDisplay = swatch.querySelector(".rgb");
    if (rgbDisplay && rgb) {
      rgbDisplay.textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    }

    // Convert and update CMYK
    const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
    const cmykDisplay = swatch.querySelector(".cmyk");
    if (cmykDisplay && cmyk) {
      cmykDisplay.textContent = `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;
    }
  });
});

// HEX ➡️ RGB
function hexToRgb(hex) {
  hex = hex.replace("#", "");
  if (hex.length === 3) {
    hex = hex.split("").map(c => c + c).join("");
  }

  const bigint = parseInt(hex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

// RGB ➡️ CMYK
function rgbToCmyk(r, g, b) {
  const rP = r / 255;
  const gP = g / 255;
  const bP = b / 255;

  const k = 1 - Math.max(rP, gP, bP);
  const c = k < 1 ? (1 - rP - k) / (1 - k) : 0;
  const m = k < 1 ? (1 - gP - k) / (1 - k) : 0;
  const y = k < 1 ? (1 - bP - k) / (1 - k) : 0;

  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100)
  };
}
