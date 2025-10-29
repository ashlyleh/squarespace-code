document.addEventListener("DOMContentLoaded", function () {
  /* ------------------ BLOG FILTER BUTTONS ------------------ */
  const filterContainer = document.getElementById("filter-buttons-1");
  const blogGrid = document.querySelector(".blog-basic-grid");
  const blogItems = Array.from(blogGrid ? blogGrid.querySelectorAll(".blog-item") : []);
  const activeFilters = new Set();

  // Exit early if nothing found or already initialized
  if (filterContainer && blogItems.length && filterContainer.dataset.initialized !== "true") {
    filterContainer.dataset.initialized = "true"; // Prevent double execution

    // Collect unique categories across all posts
    const allCategories = new Set();
    blogItems.forEach(item => {
      const catLinks = item.querySelectorAll("a.blog-categories");
      catLinks.forEach(link => {
        const label = link.textContent.trim();
        if (label) allCategories.add(label);
      });
    });

    // Create unique buttons for each category
    allCategories.forEach(label => {
      const btn = document.createElement("div");
      btn.className = "filter-button";
      btn.textContent = label;
      btn.dataset.filter = label.toLowerCase();
      filterContainer.appendChild(btn);
    });

    // Add "All Posts" button to the beginning
    const reset = document.createElement("div");
    reset.className = "filter-button reset-button";
    reset.textContent = "All Posts";
    filterContainer.insertBefore(reset, filterContainer.firstChild);

    function updateFiltering() {
      blogItems.forEach(item => {
        const cats = Array.from(item.querySelectorAll("a.blog-categories"))
          .map(link => link.textContent.trim().toLowerCase());
        const match = Array.from(activeFilters).some(filter => cats.includes(filter));
        item.classList.toggle("blog-item-hidden", activeFilters.size && !match);
      });
    }

    // Click behavior for filters
    filterContainer.addEventListener("click", function (e) {
      if (!e.target.classList.contains("filter-button")) return;
      const filter = e.target.dataset.filter;

      if (e.target.classList.contains("reset-button")) {
        activeFilters.clear();
        filterContainer.querySelectorAll(".filter-button").forEach(btn => btn.classList.remove("active"));
        blogItems.forEach(item => item.classList.remove("blog-item-hidden"));
      } else {
        activeFilters.clear();
        filterContainer.querySelectorAll(".filter-button").forEach(btn => {
          if (!btn.classList.contains("reset-button")) btn.classList.remove("active");
        });
        e.target.classList.add("active");
        activeFilters.add(filter);
        updateFiltering();
      }
    });

    // Optional: auto-select filter via ?filter= in URL
    const params = new URLSearchParams(window.location.search);
    const filterParam = params.get("filter");
    if (filterParam) {
      const btn = filterContainer.querySelector(`[data-filter="${filterParam.toLowerCase()}"]`);
      if (btn) {
        btn.classList.add("active");
        activeFilters.add(filterParam.toLowerCase());
        updateFiltering();
      }
    }
  }

  /* ------------------ BLOG SORT DROPDOWN ------------------ */
  const dropdown = document.getElementById("sort-dropdown-1");
  if (!dropdown) return;

  const trigger = dropdown.querySelector(".dropdown-trigger");
  const icon = dropdown.querySelector(".dropdown-icon");
  const label = dropdown.querySelector(".dropdown-label");
  const options = dropdown.querySelector(".dropdown-options");
  const container = document.querySelector(".blog-basic-grid");

  if (trigger && icon && label && options && container && blogItems.length) {
    // Open/close dropdown menu
    trigger.addEventListener("click", () => {
      const open = options.style.display === "block";
      options.style.display = open ? "none" : "block";
      icon.textContent = open ? "keyboard_arrow_down" : "keyboard_arrow_up";
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", e => {
      if (!e.target.closest("#sort-dropdown-1")) {
        options.style.display = "none";
        icon.textContent = "keyboard_arrow_down";
      }
    });

    // Sorting logic
    options.querySelectorAll(".dropdown-option").forEach(option => {
      option.addEventListener("click", () => {
        const sort = option.dataset.sort;

        options.querySelectorAll(".dropdown-option").forEach(o => o.classList.remove("active"));
        option.classList.add("active");
        label.textContent = option.textContent;
        icon.textContent = "keyboard_arrow_down";
        options.style.display = "none";

        let sorted = [...blogItems];

        if (sort === "newest") {
          sorted.sort((a, b) => new Date(b.querySelector(".blog-date").innerText) - new Date(a.querySelector(".blog-date").innerText));
        } else if (sort === "oldest") {
          sorted.sort((a, b) => new Date(a.querySelector(".blog-date").innerText) - new Date(b.querySelector(".blog-date").innerText));
        } else if (sort === "az") {
          sorted.sort((a, b) => a.querySelector(".blog-title").innerText.localeCompare(b.querySelector(".blog-title").innerText));
        } else if (sort === "za") {
          sorted.sort((a, b) => b.querySelector(".blog-title").innerText.localeCompare(a.querySelector(".blog-title").innerText));
        }

        sorted.forEach(item => container.appendChild(item));
      });
    });
  }
});
