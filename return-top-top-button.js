<!-- Anchor Target -->
<div id="top"></div>

<!-- Back to Top Button -->
<div id="back-to-top">
  <a href="#top" aria-label="Back to top">
    <span class="material-symbols-outlined">arrow_upward</span>
  </a>
</div>

<!-- Load Material Symbols Icon Font -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />

<!-- Show/Hide Logic -->
<script>
  window.addEventListener('scroll', function () {
    const button = document.getElementById('back-to-top');
    if (window.scrollY > 300) {
      button.classList.add('show');
    } else {
      button.classList.remove('show');
    }
  });
</script>
