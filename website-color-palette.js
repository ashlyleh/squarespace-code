function rgbToHex(rgb) {
  const rgbArray = rgb.match(/\d+/g);
  return "#" + rgbArray.map(x => {
    const hex = parseInt(x).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
}

function renderColorSwatches() {
  document.querySelectorAll('.website-color-palette').forEach(swatch => {
    const varName = swatch.getAttribute('data-color');
    const colorValue = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    if (colorValue) {
      swatch.style.backgroundColor = colorValue;
      const hex = rgbToHex(getComputedStyle(swatch).backgroundColor);
      const hexElement = swatch.querySelector('.hex');
      if (hexElement) {
        hexElement.textContent = hex;
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", renderColorSwatches);
