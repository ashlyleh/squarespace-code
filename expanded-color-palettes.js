document.addEventListener("DOMContentLoaded", () => {
  const swatches = document.querySelectorAll(".color-swatch");

  swatches.forEach((swatch) => {
    const hex = swatch.dataset.hex;
    if (!hex) return;

    // Apply background color
    swatch.style.backgroundColor = hex;

    // Set HEX
    const hexSpan = swatch.querySelector(".hex");
    if (hexSpan) hexSpan.textContent = hex;

    // Convert HEX to RGB
    const rgb = hexToRgb(hex);
    if (rgb) {
      const rgbSpan = swatch.querySelector(".rgb");
      if (rgbSpan) {
        rgbSpan.textContent = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      }

      // Convert RGB to CMYK
      const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
      const cmykSpan = swatch.querySelector(".cmyk");
      if (cmykSpan) {
        cmykSpan.textContent = `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;
      }
    }
  });
});

function hexToRgb(hex) {
  hex = hex.replace("#", "");
  if (hex.length === 3) {
    hex = hex.split("").map(c => c + c).join("");
  }
  const num = parseInt(hex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function rgbToCmyk(r, g, b) {
  const rP = r / 255;
  const gP = g / 255;
  const bP = b / 255;

  const k = 1 - Math.max(rP, gP, bP);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };

  const c = ((1 - rP - k) / (1 - k)) * 100;
  const m = ((1 - gP - k) / (1 - k)) * 100;
  const y = ((1 - bP - k) / (1 - k)) * 100;

  return {
    c: Math.round(c),
    m: Math.round(m),
    y: Math.round(y),
    k: Math.round(k * 100)
  };
}
