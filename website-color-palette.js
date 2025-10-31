function rgbToHex(rgb) {
  const rgbArray = rgb.match(/\d+/g);
  if (!rgbArray) return null;
  return "#" + rgbArray.map(x => {
    const hex = parseInt(x).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
}

function getContrastingTextColor(rgb) {
  const [r, g, b] = rgb.match(/\d+/g).map(Number);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#000' : '#fff';
}

function renderColorSwatches() {
  document.querySelectorAll('.website-color-palette').forEach(swatch => {
    const varName = swatch.getAttribute('data-color');
    if (!varName) return;

    const colorValue = getComputedStyle(swatch).getPropertyValue(varName).trim();

    if (colorValue) {
      swatch.style.backgroundColor = colorValue;

      const resolvedColor = getComputedStyle(swatch).backgroundColor;
      const hex = rgbToHex(resolvedColor);
      const textColor = getContrastingTextColor(resolvedColor);

      swatch.style.color = textColor;

      const hexElement = swatch.querySelector('.hex');
      if (hexElement) {
        hexElement.textContent = hex || 'Invalid Color';
      }
    } else {
      const hexElement = swatch.querySelector('.hex');
      if (hexElement) {
        hexElement.textContent = 'Unavailable';
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", renderColorSwatches);
