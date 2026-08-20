/**
 * ═══════════════════════════════════════════════════════════════════════════
 * FLIPBOOK VIEWER - Self-hosted for Squarespace
 * ═══════════════════════════════════════════════════════════════════════════
 * Renders a PDF as a paginated book with flip animation, TOC navigation,
 * lazy loading, and keyboard/touch support. Designed for 50+ page PDFs.
 *
 * Usage: Include in Squarespace header/footer, configure window.flipbookConfig
 * ═══════════════════════════════════════════════════════════════════════════
 */

(function () {
  // ✏️ CONFIGURATION - Edit these values for each client
  const config = window.flipbookConfig || {
    pdfUrl: 'https://command-dev.squarespace.com/s/LoveYOU-Booklet_Single-Pages_April-2026.pdf',
    totalPages: 56, // Total page count in PDF
    containerId: 'lyp-flipbook-container',
    coverPage: 1, // Cover page number
  };

  // 🔧 INTERNAL STATE
  let pdfDoc = null;
  let currentPage = 1;
  let isFlipping = false;
  let renderedPages = new Map(); // Cache: { pageNum: canvasElement }
  let touchStartX = 0;
  let touchStartY = 0;

  // ════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ════════════════════════════════════════════════════════════════════════

  async function initFlipbook() {
    try {
      // Load PDF.js library from CDN
      if (!window.pdfjsLib) {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }

      // Fetch and load PDF
      const pdf = await window.pdfjsLib.getDocument(config.pdfUrl).promise;
      pdfDoc = pdf;

      // Render initial spread (cover + first content page)
      await renderSpread(config.coverPage);

      // Attach event listeners
      attachEventListeners();
      console.log(`Flipbook initialized: ${config.totalPages} pages`);
    } catch (error) {
      console.error('Flipbook error:', error);
      showFallback();
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  // PAGE RENDERING
  // ════════════════════════════════════════════════════════════════════════

  async function renderPage(pageNum) {
    // Return cached page if available
    if (renderedPages.has(pageNum)) {
      return renderedPages.get(pageNum);
    }

    if (!pdfDoc || pageNum < 1 || pageNum > config.totalPages) {
      return null;
    }

    try {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 }); // 1.5x for crisp rendering
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: context,
        viewport: viewport,
      }).promise;

      // Cache rendered page
      renderedPages.set(pageNum, canvas);

      // Limit cache size (keep ~5 pages in memory)
      if (renderedPages.size > 5) {
        const firstKey = renderedPages.keys().next().value;
        renderedPages.delete(firstKey);
      }

      return canvas;
    } catch (error) {
      console.error(`Error rendering page ${pageNum}:`, error);
      return null;
    }
  }

  async function renderSpread(leftPageNum) {
    const leftCanvas = await renderPage(leftPageNum);
    if (!leftCanvas) return;

    const leftImg = leftCanvas.toDataURL('image/jpeg', 0.9);
    const leftPage = document.querySelector('[data-page="left"]');
    if (leftPage) leftPage.style.backgroundImage = `url(${leftImg})`;

    // Render right page (unless it's the cover)
    if (leftPageNum === config.coverPage) {
      const rightPage = document.querySelector('[data-page="right"]');
      if (rightPage) rightPage.style.backgroundImage = 'none';
    } else {
      const rightPageNum = leftPageNum + 1;
      const rightCanvas = await renderPage(rightPageNum);
      if (rightCanvas) {
        const rightImg = rightCanvas.toDataURL('image/jpeg', 0.9);
        const rightPage = document.querySelector('[data-page="right"]');
        if (rightPage) rightPage.style.backgroundImage = `url(${rightImg})`;
      }
    }

    updatePageCounter(leftPageNum);
  }

  // ════════════════════════════════════════════════════════════════════════
  // NAVIGATION
  // ════════════════════════════════════════════════════════════════════════

  // Public function: called by TOC onclick handlers (lypGoTo)
  window.lypGoTo = async function (pageNum) {
    if (isFlipping || pageNum < 1 || pageNum > config.totalPages) return;

    isFlipping = true;

    // Calculate spread pages
    let leftPage = pageNum;
    if (pageNum > config.coverPage && pageNum % 2 !== 0) {
      leftPage = pageNum - 1; // Ensure even page on left
    }

    currentPage = leftPage;

    // Animate flip
    const container = document.querySelector('.lyp-flipbook-spread');
    if (container) {
      container.classList.add('flipping');
      await renderSpread(leftPage);
      setTimeout(() => container.classList.remove('flipping'), 300);
    } else {
      await renderSpread(leftPage);
    }

    isFlipping = false;
  };

  async function nextSpread() {
    let nextPage = currentPage;
    if (currentPage === config.coverPage) {
      nextPage = 2; // Jump to first content spread
    } else {
      nextPage = Math.min(currentPage + 2, config.totalPages - 1);
    }
    await window.lypGoTo(nextPage);
  }

  async function prevSpread() {
    let prevPage = currentPage;
    if (currentPage > 2) {
      prevPage = Math.max(currentPage - 2, 2);
    } else {
      prevPage = config.coverPage;
    }
    await window.lypGoTo(prevPage);
  }

  // ════════════════════════════════════════════════════════════════════════
  // PAGE COUNTER & CONTROLS
  // ════════════════════════════════════════════════════════════════════════

  function updatePageCounter(pageNum) {
    const counter = document.querySelector('.lyp-flipbook-counter');
    if (counter) {
      if (pageNum === config.coverPage) {
        counter.textContent = 'Cover';
      } else {
        counter.textContent = `${pageNum}–${pageNum + 1}`;
      }
    }
  }

  function downloadPDF() {
    const link = document.createElement('a');
    link.href = config.pdfUrl;
    link.download = 'booklet.pdf';
    link.click();
  }

  // ════════════════════════════════════════════════════════════════════════
  // EVENT LISTENERS
  // ════════════════════════════════════════════════════════════════════════

  function attachEventListeners() {
    // Navigation buttons
    document.querySelector('.lyp-flipbook-prev')?.addEventListener('click', prevSpread);
    document.querySelector('.lyp-flipbook-next')?.addEventListener('click', nextSpread);

    // Download button
    document.querySelector('.lyp-flipbook-download')?.addEventListener('click', downloadPDF);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') prevSpread();
      if (e.key === 'ArrowRight') nextSpread();
    });

    // Touch swipe
    const spread = document.querySelector('.lyp-flipbook-spread');
    if (spread) {
      spread.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      });

      spread.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaX = touchEndX - touchStartX;
        const deltaY = Math.abs(touchEndY - touchStartY);

        // Only trigger if horizontal swipe (not vertical scroll)
        if (Math.abs(deltaX) > 50 && deltaY < 50) {
          if (deltaX > 0) prevSpread(); // Swipe right = previous
          else nextSpread(); // Swipe left = next
        }
      });
    }

    // Fullscreen toggle (optional)
    document.querySelector('.lyp-flipbook-fullscreen')?.addEventListener('click', toggleFullscreen);
  }

  function toggleFullscreen() {
    const container = document.querySelector('.lyp-flipbook-container');
    if (!document.fullscreenElement) {
      container?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  // UTILITIES
  // ════════════════════════════════════════════════════════════════════════

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function showFallback() {
    const container = document.querySelector(`.${config.containerId}`);
    if (container) {
      container.innerHTML = `
        <div style="padding: 2rem; text-align: center; background: #f5f5f5; border-radius: 8px;">
          <p style="margin: 0 0 1rem 0; font-size: 1rem;">Flipbook failed to load.</p>
          <a href="${config.pdfUrl}" style="color: var(--primary-accent, #007bff); text-decoration: none; font-weight: 500;">
            Download PDF instead →
          </a>
        </div>
      `;
    }
  }

  // ════════════════════════════════════════════════════════════════════════
  // START
  // ════════════════════════════════════════════════════════════════════════

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFlipbook);
  } else {
    initFlipbook();
  }
})();
