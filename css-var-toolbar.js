/**
 * CSS Variable Quick-Copy Toolbar
 * Injects a color + font variable picker into the Squarespace Custom CSS editor.
 * Only activates on /config/ admin pages.
 *
 * Usage: <script src="https://cdn.jsdelivr.net/gh/YOUR_USER/YOUR_REPO@main/css-var-toolbar.js"></script>
 */

(function () {
  if (!window.location.pathname.startsWith('/config')) return;

  // ── Config ────────────────────────────────────────────────────────────────

  var COLORS = [
    { label: 'Background',       cssVar: '--background-color',    hslVar: '--white-hsl' },
    { label: 'Sec. Background',  cssVar: '--secondary-background', hslVar: '--lightAccent-hsl' },
    { label: 'Primary Accent',   cssVar: '--primary-accent',      hslVar: '--accent-hsl' },
    { label: 'Secondary Accent', cssVar: '--secondary-accent',    hslVar: '--darkAccent-hsl' },
    { label: 'Body Text',        cssVar: '--body-text',           hslVar: '--black-hsl' },
  ];

  var FONTS = [
    { label: 'Heading',     cssVar: '--heading' },
    { label: 'Heading 1',   cssVar: '--heading-1' },
    { label: 'Heading 2',   cssVar: '--heading-2' },
    { label: 'Heading 3',   cssVar: '--heading-3' },
    { label: 'Heading 4',   cssVar: '--heading-4' },
    { label: 'Paragraph',   cssVar: '--paragraph' },
    { label: 'Paragraph 1', cssVar: '--paragraph-1' },
    { label: 'Paragraph 2', cssVar: '--paragraph-2' },
    { label: 'Paragraph 3', cssVar: '--paragraph-3' },
  ];

  // ── Helpers ───────────────────────────────────────────────────────────────

  function getSwatchColors() {
    var out = {};
    try {
      var iframe = document.getElementById('sqs-site-frame');
      if (iframe && iframe.contentDocument) {
        var rs = getComputedStyle(iframe.contentDocument.documentElement);
        COLORS.forEach(function (c) {
          var val = rs.getPropertyValue(c.hslVar).trim();
          if (val) out[c.hslVar] = val;
        });
      }
    } catch (e) {}
    return out;
  }

  function copyText(text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(function () { fallbackCopy(text); });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0;';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }

  // ── Toast ─────────────────────────────────────────────────────────────────

  function createToast() {
    var t = document.createElement('div');
    t.id = 'ccv-toast';
    t.style.cssText = [
      'position:fixed', 'bottom:28px', 'left:50%',
      'transform:translateX(-50%) translateY(10px)',
      'background:#1a1a1a', 'color:#fff',
      'padding:6px 16px', 'border-radius:20px',
      'font-size:11.5px', 'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
      'opacity:0', 'transition:opacity 0.18s,transform 0.18s',
      'z-index:100001', 'pointer-events:none', 'letter-spacing:0.02em',
    ].join(';');
    document.body.appendChild(t);
    return t;
  }

  function showToast(toast, msg) {
    toast.textContent = msg;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(toast._t);
    toast._t = setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(10px)';
    }, 1600);
  }

  // ── Chip (button) factory ─────────────────────────────────────────────────

  function makeChip(opts, toast) {
    // opts: { label, copyText, swatchBg? }
    var btn = document.createElement('button');
    btn.title = 'Click to copy: ' + opts.copyText;
    btn.style.cssText = [
      'display:inline-flex', 'align-items:center',
      'gap:' + (opts.swatchBg !== undefined ? '6px' : '5px'),
      'background:#f6f6f6', 'border:1px solid #e3e3e3', 'border-radius:7px',
      'padding:4px 9px 4px ' + (opts.swatchBg !== undefined ? '6px' : '9px'),
      'cursor:pointer', 'font-size:10.5px',
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
      'transition:background 0.12s,border-color 0.12s,transform 0.08s',
      'outline:none', 'margin:0',
    ].join(';');

    // Icon: colour swatch or 'T' for fonts
    var icon = document.createElement('span');
    if (opts.swatchBg !== undefined) {
      icon.style.cssText = [
        'width:13px', 'height:13px', 'border-radius:50%', 'flex-shrink:0',
        'border:1px solid rgba(0,0,0,0.13)', 'display:inline-block',
        'background:' + (opts.swatchBg || '#ddd'),
      ].join(';');
    } else {
      icon.textContent = 'T';
      icon.style.cssText = 'font-size:9px;font-weight:700;color:#bbb;line-height:1;flex-shrink:0;';
    }
    btn.appendChild(icon);

    var lbl = document.createElement('span');
    lbl.textContent = opts.label;
    lbl.style.cssText = 'color:#2d2d2d;font-weight:500;white-space:nowrap;';
    btn.appendChild(lbl);

    btn.addEventListener('mouseenter', function () {
      btn.style.background = '#eef1ff';
      btn.style.borderColor = '#afc0f5';
    });
    btn.addEventListener('mouseleave', function () {
      btn.style.background = '#f6f6f6';
      btn.style.borderColor = '#e3e3e3';
    });
    btn.addEventListener('mousedown',  function () { btn.style.transform = 'scale(0.95)'; });
    btn.addEventListener('mouseup',    function () { btn.style.transform = 'scale(1)'; });
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      copyText(opts.copyText);
      showToast(toast, '\u2713 Copied!');
      btn.style.background = '#e8fbe8';
      btn.style.borderColor = '#6dba6d';
      setTimeout(function () {
        btn.style.background = '#f6f6f6';
        btn.style.borderColor = '#e3e3e3';
      }, 800);
    });

    return btn;
  }

  // ── Section label ─────────────────────────────────────────────────────────

  function sectionLabel(text) {
    var p = document.createElement('p');
    p.textContent = text;
    p.style.cssText = [
      'font-size:9.5px', 'font-weight:700',
      'letter-spacing:0.10em', 'text-transform:uppercase',
      'color:#aaa', 'margin:0 0 7px 0',
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
    ].join(';');
    return p;
  }

  // ── Build & inject widget ─────────────────────────────────────────────────

  function buildWidget() {
    if (document.getElementById('ccv-widget')) return;

    var openBtn = Array.from(document.querySelectorAll('button')).find(function (b) {
      return b.textContent.trim().toLowerCase().indexOf('open in new window') !== -1;
    });
    if (!openBtn) return;

    var swatchColors = getSwatchColors();
    var toast = document.getElementById('ccv-toast') || createToast();

    // Wrapper
    var widget = document.createElement('div');
    widget.id = 'ccv-widget';
    widget.style.cssText = [
      'padding:14px 0 8px 0',
      'border-bottom:1px solid #e8e8e8',
      'margin-bottom:10px',
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
    ].join(';');

    // — Colors section —
    var colorSection = document.createElement('div');
    colorSection.style.marginBottom = '10px';
    colorSection.appendChild(sectionLabel('Colors'));
    var colorRow = document.createElement('div');
    colorRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:5px;';
    COLORS.forEach(function (c) {
      var hslVal = swatchColors[c.hslVar];
      colorRow.appendChild(makeChip({
        label: c.label,
        copyText: 'var(' + c.cssVar + ')',
        swatchBg: hslVal ? 'hsla(' + hslVal + ',1)' : undefined,
      }, toast));
    });
    colorSection.appendChild(colorRow);
    widget.appendChild(colorSection);

    // — Fonts section —
    var fontSection = document.createElement('div');
    fontSection.style.marginBottom = '4px';
    fontSection.appendChild(sectionLabel('Fonts'));
    var fontRow = document.createElement('div');
    fontRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:5px;';
    FONTS.forEach(function (f) {
      fontRow.appendChild(makeChip({
        label: f.label,
        copyText: 'var(' + f.cssVar + ')',
      }, toast));
    });
    fontSection.appendChild(fontRow);
    widget.appendChild(fontSection);

    // Insert above "Open in New Window"
    openBtn.parentNode.insertBefore(widget, openBtn);
  }

  // ── MutationObserver: wait for the panel to load ──────────────────────────

  var observer = new MutationObserver(function () {
    var openBtn = Array.from(document.querySelectorAll('button')).find(function (b) {
      return b.textContent.trim().toLowerCase().indexOf('open in new window') !== -1;
    });
    if (openBtn && !document.getElementById('ccv-widget')) {
      buildWidget();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Also attempt immediately if panel is already rendered
  buildWidget();

})();
