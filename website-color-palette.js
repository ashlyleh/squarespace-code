function rgbToHex(rgb) {
  const rgbArray = rgb.match(/\d+/g);
  if (!rgbArray) return null;
  return "#" + rgbArray.map(x => {
    const hex = parseInt(x).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
}

function renderColorSwatches() {
  document.querySelectorAll('.website-color-palette').forEach(swatch => {
    const varName = swatch.getAttribute('data-color');
    if (!varName) return;

    // Use the swatch itself to resolve the CSS variable
    const colorValue = getComputedStyle(swatch).getPropertyValue(varName).trim();
    
    if (colorValue) {
      swatch.style.backgroundColor = colorValue;
      const resolvedColor = getComputedStyle(swatch).backgroundColor;
      const hex = rgbToHex(resolvedColor);
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
