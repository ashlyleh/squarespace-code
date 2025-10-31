window.copyBoxLoaded = true;
console.log("✅ copybox.js loaded from GitHub");


document.addEventListener("DOMContentLoaded", function() {
  document.querySelectorAll(".code-box").forEach(box => {
    const button = document.createElement("button");
    button.classList.add("copy-btn");
    button.innerHTML = '<span class="material-symbols-rounded">content_copy</span> Copy';
    box.appendChild(button);

    const template = box.querySelector("template");
    const displayCode = box.querySelector("pre code");

    if (template && displayCode) {
      const templateContent = template.innerHTML.trim();
      displayCode.textContent = templateContent;

      button.addEventListener("click", function() {
        navigator.clipboard.writeText(templateContent);
        button.innerHTML = '<span class="material-symbols-rounded">check</span> Copied!';
        setTimeout(() => {
          button.innerHTML = '<span class="material-symbols-rounded">content_copy</span> Copy';
        }, 2000);
      });
    }
  });
});
