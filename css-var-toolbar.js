/**
 * CSS Variable Quick-Copy Toolbar
 * Injects a color + font variable picker into the Squarespace Custom CSS editor.
 * Only activates on /config/ admin pages.
 *
 * Usage (Footer Code Injection):
 * <script src="https://cdn.jsdelivr.net/gh/ashlyleh/squarespace-code@main/css-var-toolbar.js"></script>
 */

(function () {
  if (!window.location.pathname.startsWith('/config')) return;

  // ── Config ─────────────────────────────────────────────────────────────────

  var COLORS = [
    { label: 'Background',       cssVar: '--background-color',    hslVar: '--white-hsl' },
    { label: 'Sec. Background',  cssVar: '--secondary-background', hslVar: '--lightAccent-hsl' },
    { label: 'Primary Accent',   cssVar: '--primary-accent',      hslVar: '--accent-hsl' },
    { label: 'Secondary Accent', cssVar: '--secondary-accent',    hslVar: '--darkAccent-hsl' },
    { label: 'Body Text',        cssVar: '--body-text',           hslVar: '--black-hsl' },
  ];

  var HEADING_CHIPS = [
    { label: 'Header',   cssVar: '--heading' },
    { label: 'Header 1', cssVar: '--heading-1' },
    { label: 'Header 2', cssVar: '--heading-2' },
    { label: 'Header 3', cssVar: '--heading-3' },
    { label: 'Header 4', cssVar: '--heading-4' },
  ];

  var PARA_CHIPS = [
    { label: 'Paragraph',   cssVar: '--paragraph' },
    { label: 'Paragraph 1', cssVar: '--paragraph-1' },
    { label: 'Paragraph 2', cssVar: '--paragraph-2' },
    { label: 'Paragraph 3', cssVar: '--paragraph-3' },
  ];

  // ── Live data from preview iframe ──────────────────────────────────────────

  var swatchColors = {};
  var headingFontName = 'Heading Font';
  var paraFontName = 'Paragraph Font';

  try {
    var iframe = document.getElementById('sqs-site-frame');
    if (iframe && iframe.contentDocument) {
      var rs = getComputedStyle(iframe.contentDocument.documentElement);
      COLORS.forEach(function (c) {
        var val = rs.getPropertyValue(c.hslVar).trim();
        if (val) swatchColors[c.hslVar] = val;
      });
      var hf = rs.getPropertyValue('--heading-font-font-family').trim().replace(/['"]/g, '');
      var pf = (rs.getPropertyValue('--paragraph-font-font-family').trim() ||
                rs.getPropertyValue('--body-font-font-family').trim()).replace(/['"]/g, '');
      if (hf) headingFontName = hf;
      if (pf) paraFontName = pf;
    }
  } catch (e) {}

  // ── Toast ──────────────────────────────────────────────────────────────────

  var toast = document.createElement('div');
  toast.id = 'ccv-toast';
  toast.style.cssText = [
    'position:fixed', 'bottom:28px', 'left:50%',
    'transform:translateX(-50%) translateY(10px)',
    'background:#1a1a1a', 'color:#fff',
    'padding:6px 16px', 'border-radius:20px', 'font-size:11.5px',
    'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
    'opacity:0', 'transition:opacity 0.18s,transform 0.18s',
    'z-index:100001', 'pointer-events:none', 'letter-spacing:0.02em',
  ].join(';');
  document.body.appendChild(toast);

  function showToast(msg) {
    toast.textContent = msg;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(toast._t);
    toast._t = setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(10px)';
    }, 1600);
  }

  // ── Copy ───────────────────────────────────────────────────────────────────

  function copyText(text, btn) {
    var flash = function () {
      showToast('\u2713 Copied!');
      btn.style.outline = '2px solid #6dba6d';
      btn.style.outlineOffset = '2px';
      setTimeout(function () { btn.style.outline = ''; btn.style.outlineOffset = ''; }, 800);
    };
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(flash).catch(function () { fallbackCopy(text); flash(); });
    } else { fallbackCopy(text); flash(); }
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0;';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }

  // ── Chevron SVG ────────────────────────────────────────────────────────────

  function chevronSVG() {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '14'); svg.setAttribute('height', '14');
    svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor'); svg.setAttribute('stroke-width', '2.5');
    svg.setAttribute('stroke-linecap', 'round'); svg.setAttribute('stroke-linejoin', 'round');
    svg.style.cssText = 'transition:transform 0.2s ease;flex-shrink:0;';
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M6 9l6 6 6-6');
    svg.appendChild(path);
    return svg;
  }

  // ── Collapsible section ────────────────────────────────────────────────────

  function makeSection(titleText, contentEl) {
    var wrap = document.createElement('div');
    wrap.style.cssText = 'border-bottom:1px solid #ebebeb;';
    var header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;cursor:pointer;padding:10px 0;user-select:none;';
    var title = document.createElement('span');
    title.textContent = titleText;
    title.style.cssText = 'font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:#111;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;';
    var chev = chevronSVG();
    header.appendChild(title); header.appendChild(chev);
    contentEl.style.paddingBottom = '12px';
    var open = true;
    header.addEventListener('click', function () {
      open = !open;
      contentEl.style.display = open ? '' : 'none';
      chev.style.transform = open ? 'rotate(0deg)' : 'rotate(-90deg)';
    });
    wrap.appendChild(header); wrap.appendChild(contentEl);
    return wrap;
  }

  // ── Color swatches ─────────────────────────────────────────────────────────

  function makeColorContent() {
    var row = document.createElement('div');
    row.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;';
    COLORS.forEach(function (c) {
      var hslVal = swatchColors[c.hslVar];
      var bg = hslVal ? 'hsla(' + hslVal + ',1)' : '#eee';
      var swatch = document.createElement('button');
      swatch.title = 'Click to copy: var(' + c.cssVar + ')';
      swatch.style.cssText = [
        'width:52px', 'height:52px', 'border-radius:10px',
        'border:1px solid rgba(0,0,0,0.10)', 'cursor:pointer',
        'flex-shrink:0', 'background:' + bg,
        'transition:transform 0.1s,outline 0.1s',
        'outline:2px solid transparent', 'outline-offset:2px', 'padding:0',
      ].join(';');
      swatch.addEventListener('mouseenter', function () { swatch.style.transform = 'scale(1.07)'; });
      swatch.addEventListener('mouseleave', function () { swatch.style.transform = 'scale(1)'; });
      swatch.addEventListener('click', function (e) { e.preventDefault(); copyText('var(' + c.cssVar + ')', swatch); });
      row.appendChild(swatch);
    });
    return row;
  }

  // ── Font chip ──────────────────────────────────────────────────────────────

  function makeFontChip(label, cssVar) {
    var btn = document.createElement('button');
    btn.title = 'Click to copy: var(' + cssVar + ')';
    btn.style.cssText = [
      'display:inline-flex', 'align-items:center',
      'background:#fff', 'border:1.5px solid #ddd', 'border-radius:8px',
      'padding:6px 14px', 'cursor:pointer', 'font-size:10px',
      'font-weight:600', 'letter-spacing:0.06em', 'text-transform:uppercase',
      'color:#333', 'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
      'transition:background 0.12s,border-color 0.12s',
      'outline:2px solid transparent', 'outline-offset:2px', 'white-space:nowrap',
    ].join(';');
    btn.textContent = label;
    btn.addEventListener('mouseenter', function () { btn.style.background = '#f0f4ff'; btn.style.borderColor = '#afc0f5'; });
    btn.addEventListener('mouseleave', function () { btn.style.background = '#fff'; btn.style.borderColor = '#ddd'; });
    btn.addEventListener('mousedown',  function () { btn.style.transform = 'scale(0.95)'; });
    btn.addEventListener('mouseup',    function () { btn.style.transform = 'scale(1)'; });
    btn.addEventListener('click', function (e) { e.preventDefault(); copyText('var(' + cssVar + ')', btn); });
    return btn;
  }

  // ── Font content ───────────────────────────────────────────────────────────

  function makeFontContent() {
    var wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex;flex-direction:column;gap:12px;';

    function fontGroup(name, chips) {
      var group = document.createElement('div');
      var lbl = document.createElement('p');
      lbl.textContent = name.toUpperCase();
      lbl.style.cssText = 'font-size:9px;font-weight:700;letter-spacing:0.10em;color:#999;margin:0 0 6px 0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;';
      group.appendChild(lbl);
      var row = document.createElement('div');
      row.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;';
      chips.forEach(function (c) { row.appendChild(makeFontChip(c.label, c.cssVar)); });
      group.appendChild(row);
      return group;
    }

    wrap.appendChild(fontGroup(headingFontName, HEADING_CHIPS));
    wrap.appendChild(fontGroup(paraFontName, PARA_CHIPS));
    return wrap;
  }

  // ── Build & inject ─────────────────────────────────────────────────────────

  function buildWidget() {
    if (document.getElementById('ccv-widget')) return;

    var openBtn = Array.from(document.querySelectorAll('button')).find(function (b) {
      return b.textContent.trim().toLowerCase().indexOf('open in new window') !== -1;
    });
    if (!openBtn) return;

    var widget = document.createElement('div');
    widget.id = 'ccv-widget';
    widget.style.cssText = 'padding:4px 0 0 0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;';

    widget.appendChild(makeSection('Colors', makeColorContent()));
    widget.appendChild(makeSection('Fonts', makeFontContent()));

    var spacer = document.createElement('div');
    spacer.style.height = '10px';
    widget.appendChild(spacer);

    openBtn.parentNode.insertBefore(widget, openBtn);
  }

  // ── MutationObserver ───────────────────────────────────────────────────────

  var observer = new MutationObserver(function () {
    var openBtn = Array.from(document.querySelectorAll('button')).find(function (b) {
      return b.textContent.trim().toLowerCase().indexOf('open in new window') !== -1;
    });
    if (openBtn && !document.getElementById('ccv-widget')) buildWidget();
  });

  observer.observe(document.body, { childList: true, subtree: true });
  buildWidget();

})();
