<script>
  // 👇 YOUR HEX COLORS: Put them in the same order as your HTML blocks
  const hexColors = [
    "#fffdfc",  // Background
    "#ffe8d6",  // Secondary Background
    "#d97b4c",  // Primary Accent
    "#b45430",  // Secondary Accent
    "#0a0a0a"   // Body Text
  ];

  function getContrastingTextColor(hex) {
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000' : '#fff';
  }

  function renderHexSwatches() {
    const swatches = document.querySelectorAll('.website-color-palette');

    swatches.forEach((swatch, index) => {
      const hex = hexColors[index] || '#ccc';
      swatch.style.backgroundColor = hex;
      swatch.style.color = getContrastingTextColor(hex);

      const hexElement = swatch.querySelector('.hex');
      if (hexElement) {
        hexElement.textContent = hex;
      }
    });
  }

  document.addEventListener("DOMContentLoaded", renderHexSwatches);
</script>
