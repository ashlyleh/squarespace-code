/*!
 * filter-sort.js
 * Unified blog + events filter, sort, and archive enhancement
 * https://github.com/ashlyleh/squarespace-code
 *
 * CONFIG — place this BEFORE the script tag on each page:
 *
 * <script>
 * window.filterSortConfig = {
 *   // ── BLOG ──────────────────────────────────────────────
 *   blogGridSelector:   '.blog-basic-grid',   // or '.blog-alternating-side-by-side'
 *   blogItemSelector:   '.blog-item',
 *   filterContainerId:  'filter-buttons-1',
 *   sortDropdownId:     'sort-dropdown-1',
 *   allPostsLabel:      'All Posts',
 *
 *   // ── ARCHIVE ───────────────────────────────────────────
 *   archiveAllLabel:    '‹ See All',          // link text
 *   archivePosition:    'bottom',             // 'top' or 'bottom'
 *
 *   // ── EVENTS ────────────────────────────────────────────
 *   eventsContainerId:  'evt-filter-app',     // id of your placeholder <div>
 *   upcomingLabel:      'Upcoming',
 *   pastLabel:          'Past',
 *   eventCountLabel:    'events',             // e.g. "6 events"
 *   resetLabel:         'Reset',
 *   noResultsTitle:     'No events match these filters.',
 *   noResultsSub:       'Try adjusting your filters.',
 *   viewEventLabel:     'View Event',
 *
 *   // Toggle which event filters appear
 *   showLocation:       true,
 *   showDate:           true,
 *   showCategory:       true,
 *   showTag:            true,
 *   showEventCount:     true,
 *   showReset:          true,
 *
 *   // Date picker hour format
 *   use24Hour:          false,
 * };
 * </script>
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════
     CONFIG MERGE
  ═══════════════════════════════════════════════════ */
  var cfg = Object.assign({
    blogGridSelector:  '.blog-basic-grid, .blog-alternating-side-by-side',
    blogItemSelector:  '.blog-item',
    filterContainerId: 'filter-buttons-1',
    sortDropdownId:    'sort-dropdown-1',
    allPostsLabel:     'All Posts',

    archiveAllLabel:   '‹ See All',
    archivePosition:   'bottom',

    eventsContainerId: 'evt-filter-app',
    upcomingLabel:     'Upcoming',
    pastLabel:         'Past',
    eventCountLabel:   'events',
    resetLabel:        'Reset',
    noResultsTitle:    'No events match these filters.',
    noResultsSub:      'Try adjusting your filters.',
    viewEventLabel:    'View Event',

    showLocation:      true,
    showDate:          true,
    showCategory:      true,
    showTag:           true,
    showEventCount:    true,
    showReset:         true,

    use24Hour:         false,
  }, window.filterSortConfig || {});


  /* ═══════════════════════════════════════════════════
     UTILITIES
  ═══════════════════════════════════════════════════ */
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  function fetchJSON(url) {
    return fetch(url, { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : {}; })
      .catch(function () { return {}; });
  }

  /** Format a Date as "Mon DD, YYYY" */
  function fmtDate(d) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  /** Format hour for display */
  function fmtHour(h, use24) {
    if (use24) return h + ':00';
    if (h === 0)  return '12 AM';
    if (h === 12) return '12 PM';
    return h < 12 ? h + ' AM' : (h - 12) + ' PM';
  }

  /** Build a simple chevron SVG string */
  var CHEVRON = '<svg class="fs-chevron" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 4.5L7 9.5L12 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';


  /* ═══════════════════════════════════════════════════
     CONTEXT DETECTION
  ═══════════════════════════════════════════════════ */
  ready(function () {
    var hasBlogGrid    = !!qs(cfg.blogGridSelector);
    var hasFilterBtns  = !!qs('#' + cfg.filterContainerId);
    var hasSortDrop    = !!qs('#' + cfg.sortDropdownId);
    var hasArchive     = !!qs('.archive-group-list');
    var hasEventsApp   = !!qs('#' + cfg.eventsContainerId);
    var hasEventlist   = !!qs('.eventlist');

    if (hasBlogGrid || hasFilterBtns || hasSortDrop) initBlog();
    if (hasArchive) initArchive();
    if (hasEventsApp || hasEventlist) initEvents();
  });


  /* ═══════════════════════════════════════════════════
     1 — BLOG FILTER & SORT
  ═══════════════════════════════════════════════════ */
  function initBlog() {
    var filterContainer = qs('#' + cfg.filterContainerId);
    var blogGrid        = qs(cfg.blogGridSelector);
    var blogItems       = blogGrid ? qsa(cfg.blogItemSelector, blogGrid) : [];
    var activeFilters   = new Set();

    /* ── Build filter buttons from JSON ── */
    if (filterContainer && blogItems.length && filterContainer.dataset.initialized !== 'true') {
      filterContainer.dataset.initialized = 'true';

      var pagePath = window.location.pathname.split('?')[0];

      fetchJSON(pagePath + '?format=json-pretty').then(function (data) {
        var allCategories = new Set();

        /* Prefer JSON category data; fall back to DOM */
        var posts = (data.items || data.collection && data.collection.items || []);
        if (posts.length) {
          posts.forEach(function (post) {
            (post.categories || []).forEach(function (cat) { allCategories.add(cat); });
          });
        } else {
          blogItems.forEach(function (item) {
            qsa('a.blog-categories', item).forEach(function (link) {
              var label = link.textContent.trim();
              if (label) allCategories.add(label);
            });
          });
        }

        /* "All Posts" reset button */
        var reset = document.createElement('div');
        reset.className = 'filter-button reset-button';
        reset.textContent = cfg.allPostsLabel;
        filterContainer.appendChild(reset);

        allCategories.forEach(function (label) {
          var btn = document.createElement('div');
          btn.className = 'filter-button';
          btn.textContent = label;
          btn.dataset.filter = label.toLowerCase();
          filterContainer.appendChild(btn);
        });

        /* Move reset to front */
        filterContainer.insertBefore(reset, filterContainer.firstChild);

        function updateFiltering() {
          blogItems.forEach(function (item) {
            var cats = qsa('a.blog-categories', item).map(function (l) {
              return l.textContent.trim().toLowerCase();
            });
            var match = Array.from(activeFilters).some(function (f) { return cats.includes(f); });
            item.classList.toggle('blog-item-hidden', activeFilters.size > 0 && !match);
          });
        }

        filterContainer.addEventListener('click', function (e) {
          if (!e.target.classList.contains('filter-button')) return;
          var filter = e.target.dataset.filter;

          if (e.target.classList.contains('reset-button')) {
            activeFilters.clear();
            qsa('.filter-button', filterContainer).forEach(function (b) { b.classList.remove('active'); });
            blogItems.forEach(function (item) { item.classList.remove('blog-item-hidden'); });
          } else {
            activeFilters.clear();
            qsa('.filter-button', filterContainer).forEach(function (b) {
              if (!b.classList.contains('reset-button')) b.classList.remove('active');
            });
            e.target.classList.add('active');
            activeFilters.add(filter);
            updateFiltering();
          }
        });

        /* URL param auto-select */
        var params     = new URLSearchParams(window.location.search);
        var filterParam = params.get('filter');
        if (filterParam) {
          var btn = qs('[data-filter="' + filterParam.toLowerCase() + '"]', filterContainer);
          if (btn) {
            btn.classList.add('active');
            activeFilters.add(filterParam.toLowerCase());
            updateFiltering();
          }
        }
      });
    }

    /* ── Sort dropdown ── */
    var dropdown  = qs('#' + cfg.sortDropdownId);
    if (!dropdown) return;

    var trigger   = qs('.dropdown-trigger', dropdown);
    var icon      = qs('.dropdown-icon', dropdown);
    var label     = qs('.dropdown-label', dropdown);
    var options   = qs('.dropdown-options', dropdown);
    var container = qs(cfg.blogGridSelector);

    if (!trigger || !icon || !label || !options || !container || !blogItems.length) return;

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = options.style.display === 'block';
      options.style.display = open ? 'none' : 'block';
      icon.textContent = open ? 'keyboard_arrow_down' : 'keyboard_arrow_up';
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('#' + cfg.sortDropdownId)) {
        options.style.display = 'none';
        icon.textContent = 'keyboard_arrow_down';
      }
    });

    function getDate(item) {
      return new Date(
        (qs('.blog-date time', item) && qs('.blog-date time', item).getAttribute('datetime')) ||
        (qs('.blog-date', item) && qs('.blog-date', item).innerText) || ''
      );
    }

    function getTitle(item) {
      return ((qs('.blog-title a', item) || qs('.blog-title', item) || {}).innerText || '').trim();
    }

    qsa('.dropdown-option', options).forEach(function (option) {
      option.addEventListener('click', function () {
        var sort   = option.dataset.sort;
        var sorted = blogItems.slice();

        qsa('.dropdown-option', options).forEach(function (o) { o.classList.remove('active'); });
        option.classList.add('active');
        label.textContent = option.textContent;
        icon.textContent  = 'keyboard_arrow_down';
        options.style.display = 'none';

        if (sort === 'newest') sorted.sort(function (a, b) { return getDate(b) - getDate(a); });
        else if (sort === 'oldest') sorted.sort(function (a, b) { return getDate(a) - getDate(b); });
        else if (sort === 'az') sorted.sort(function (a, b) { return getTitle(a).localeCompare(getTitle(b)); });
        else if (sort === 'za') sorted.sort(function (a, b) { return getTitle(b).localeCompare(getTitle(a)); });

        sorted.forEach(function (item) { container.appendChild(item); });
      });
    });
  }


  /* ═══════════════════════════════════════════════════
     2 — ARCHIVE BLOCK ENHANCEMENT
  ═══════════════════════════════════════════════════ */
  function initArchive() {
    var archiveList = qs('.archive-group-list');
    if (!archiveList) return;

    /* Auto-detect blog root from existing archive links */
    var firstLink = qs('a.archive-group-name-link', archiveList);
    var blogRoot  = '/';
    if (firstLink) {
      var parts = firstLink.pathname.replace(/\/$/, '').split('/');
      parts.pop(); /* remove the month/category slug */
      blogRoot = parts.join('/') || '/';
    }

    var currentPath = window.location.pathname.replace(/\/$/, '');

    var li  = document.createElement('li');
    li.className = 'archive-group';

    var a   = document.createElement('a');
    a.href      = blogRoot;
    a.className = 'archive-group-name-link archive-all-link';
    a.textContent = cfg.archiveAllLabel;

    /* Highlight if currently on root */
    if (currentPath === blogRoot || currentPath === blogRoot + '/') {
      a.classList.add('is-active');
    }

    li.appendChild(a);

    /*
     * Position controlled by CSS:
     *   .archive-group-list .archive-all-link  →  bottom (default, no extra class needed)
     * Add class .archive-position-top to .archive-group-list via config to float it up.
     * To override per-site: set cfg.archivePosition = 'top'
     */
    if (cfg.archivePosition === 'top') {
      archiveList.insertBefore(li, archiveList.firstChild);
    } else {
      archiveList.appendChild(li);
    }
  }


  /* ═══════════════════════════════════════════════════
     3 — EVENTS FILTER
  ═══════════════════════════════════════════════════ */
  function initEvents() {
    var mountEl = qs('#' + cfg.eventsContainerId) || qs('.eventlist');
    if (!mountEl) return;

    /* Hide native eventlist while we load */
    var nativeList = qs('.eventlist');
    if (nativeList) nativeList.style.setProperty('display', 'none', 'important');

    var pagePath = window.location.pathname.split('?')[0];

    Promise.all([
      fetchJSON(pagePath + '?format=json-pretty'),
      fetchJSON(pagePath + '?view=past&format=json-pretty')
    ]).then(function (results) {
      var upcomingRaw = results[0];
      var pastRaw     = results[1];

      var upcomingItems = (upcomingRaw.items || upcomingRaw.upcoming || []);
      var pastItems     = (pastRaw.past || pastRaw.items || []);

      /* Deduplicate */
      var seen = new Set();
      function dedup(arr) {
        return arr.filter(function (e) {
          if (!e.id || seen.has(e.id)) return false;
          seen.add(e.id);
          return true;
        });
      }
      upcomingItems = dedup(upcomingItems);
      pastItems     = dedup(pastItems);

      if (!upcomingItems.length && !pastItems.length) {
        if (nativeList) nativeList.style.removeProperty('display');
        return;
      }

      /* Collect filter metadata */
      var allLocations  = new Set();
      var allCategories = new Set();
      var allTags       = new Set();

      function collectMeta(items) {
        items.forEach(function (evt) {
          if (evt.location && evt.location.addressTitle) allLocations.add(evt.location.addressTitle);
          (evt.categories || []).forEach(function (c) { allCategories.add(c); });
          (evt.tags || []).forEach(function (t) { allTags.add(t); });
        });
      }
      collectMeta(upcomingItems);
      collectMeta(pastItems);

      /* ── State ── */
      var state = {
        view:     'upcoming',
        location: null,
        category: null,
        tag:      null,
        dateStart: null,
        dateEnd:   null,
        hourStart: 0,
        hourEnd:   23,
      };

      /* ── Build App Shell ── */
      var app = document.createElement('div');
      app.id  = 'fs-evt-app';
      app.innerHTML = buildAppHTML(allLocations, allCategories, allTags);

      if (nativeList) {
        nativeList.insertAdjacentElement('beforebegin', app);
      } else {
        mountEl.appendChild(app);
      }

      /* ── Render event cards ── */
      renderCards();

      /* ── Wire up controls ── */
      wireToggle();
      wireDropdowns();
      if (cfg.showDate) wireDatePicker();
      wireReset();

      /* ══════════════════════════════════════
         BUILD HTML
      ══════════════════════════════════════ */
      function buildAppHTML(locs, cats, tags) {
        var filterRight = '';

        if (cfg.showLocation && locs.size > 1) {
          filterRight += buildDropdown('location', 'All locations', Array.from(locs));
        }
        if (cfg.showDate) {
          filterRight += buildDateDropdown();
        }
        if (cfg.showCategory && cats.size > 0) {
          filterRight += buildDropdown('category', 'All categories', Array.from(cats));
        }
        if (cfg.showTag && tags.size > 0) {
          filterRight += buildDropdown('tag', 'All tags', Array.from(tags));
        }
        if (cfg.showReset) {
          filterRight += '<button type="button" class="fs-reset-btn" id="fs-reset">' + cfg.resetLabel + '</button>';
        }

        return (
          '<div class="fs-filter-bar">' +
            '<div class="fs-filter-left">' +
              '<div class="fs-toggle">' +
                '<button type="button" class="fs-toggle-btn fs-toggle-btn--active" data-view="upcoming">' + cfg.upcomingLabel + '</button>' +
                '<button type="button" class="fs-toggle-btn" data-view="past">' + cfg.pastLabel + '</button>' +
              '</div>' +
              (cfg.showEventCount ? '<span class="fs-count" id="fs-count">0 ' + cfg.eventCountLabel + '</span>' : '') +
            '</div>' +
            '<div class="fs-filter-right">' + filterRight + '</div>' +
          '</div>' +
          '<div class="fs-evt-list" id="fs-evt-list"></div>' +
          '<div class="fs-no-results" id="fs-no-results" style="display:none;">' +
            '<p class="fs-no-results__title">' + cfg.noResultsTitle + '</p>' +
            '<p class="fs-no-results__sub">' + cfg.noResultsSub + '</p>' +
          '</div>'
        );
      }

      function buildDropdown(id, defaultLabel, options) {
        var opts = options.map(function (o) {
          return '<li class="fs-dd-option" data-value="' + escAttr(o) + '">' + esc(o) + '</li>';
        }).join('');
        return (
          '<div class="fs-dropdown" id="fs-dd-' + id + '" data-filter="' + id + '">' +
            '<button type="button" class="fs-dd-trigger">' +
              '<span class="fs-dd-label">' + defaultLabel + '</span>' +
              CHEVRON +
            '</button>' +
            '<ul class="fs-dd-panel">' +
              '<li class="fs-dd-option fs-dd-option--all" data-value="">' + defaultLabel + '</li>' +
              opts +
            '</ul>' +
          '</div>'
        );
      }

      function buildDateDropdown() {
        var hourOpts = '';
        for (var h = 0; h <= 23; h++) {
          hourOpts += '<option value="' + h + '">' + fmtHour(h, cfg.use24Hour) + '</option>';
        }
        var endHourOpts = hourOpts.replace('value="23"', 'value="23" selected');

        return (
          '<div class="fs-dropdown fs-dropdown--date" id="fs-dd-date">' +
            '<button type="button" class="fs-dd-trigger">' +
              '<span class="fs-dd-label">All dates</span>' +
              CHEVRON +
            '</button>' +
            '<div class="fs-dp-panel">' +
              '<div class="fs-dp-presets">' +
                '<button type="button" class="fs-dp-preset fs-dp-preset--active" data-preset="all">All time</button>' +
                '<button type="button" class="fs-dp-preset" data-preset="today">Today</button>' +
                '<button type="button" class="fs-dp-preset" data-preset="this-week">This week</button>' +
                '<button type="button" class="fs-dp-preset" data-preset="this-month">This month</button>' +
                '<button type="button" class="fs-dp-preset" data-preset="this-year">This year</button>' +
                '<button type="button" class="fs-dp-preset" data-preset="custom">Custom range</button>' +
              '</div>' +
              '<div class="fs-dp-calendars" id="fs-dp-cals">' +
                '<div class="fs-dp-cal" id="fs-dp-cal-left"></div>' +
                '<div class="fs-dp-cal" id="fs-dp-cal-right"></div>' +
              '</div>' +
              '<div class="fs-dp-hours">' +
                '<div class="fs-dp-hour-group">' +
                  '<label class="fs-dp-hour-label">From</label>' +
                  '<select class="fs-dp-hour-sel" id="fs-hour-start">' + hourOpts + '</select>' +
                '</div>' +
                '<div class="fs-dp-hour-group">' +
                  '<label class="fs-dp-hour-label">To</label>' +
                  '<select class="fs-dp-hour-sel" id="fs-hour-end">' + endHourOpts + '</select>' +
                '</div>' +
              '</div>' +
              '<div class="fs-dp-footer">' +
                '<button type="button" class="fs-dp-cancel" id="fs-dp-cancel">Cancel</button>' +
                '<button type="button" class="fs-dp-apply" id="fs-dp-apply">Apply</button>' +
              '</div>' +
            '</div>' +
          '</div>'
        );
      }

      /* ══════════════════════════════════════
         RENDER CARDS
      ══════════════════════════════════════ */
      function renderCards() {
        var list   = qs('#fs-evt-list');
        var items  = state.view === 'upcoming' ? upcomingItems : pastItems;
        var count  = 0;

        list.innerHTML = '';

        items.forEach(function (evt) {
          if (!matchesFilters(evt)) return;
          count++;
          list.appendChild(buildCard(evt));
        });

        /* Count */
        var countEl = qs('#fs-count');
        if (countEl) countEl.textContent = count + ' ' + cfg.eventCountLabel;

        /* No results */
        var noRes = qs('#fs-no-results');
        if (noRes) noRes.style.display = count === 0 ? 'block' : 'none';
      }

      function matchesFilters(evt) {
        /* Location */
        if (state.location) {
          var loc = evt.location && evt.location.addressTitle || '';
          if (loc !== state.location) return false;
        }

        /* Category */
        if (state.category && !(evt.categories || []).includes(state.category)) return false;

        /* Tag */
        if (state.tag && !(evt.tags || []).includes(state.tag)) return false;

        /* Date + hour range */
        if (state.dateStart || state.dateEnd) {
          var evtStart = new Date(evt.startDate);
          var evtEnd   = evt.endDate ? new Date(evt.endDate) : new Date(evt.startDate);

          if (state.dateStart) {
            var rangeStart = new Date(state.dateStart);
            rangeStart.setHours(state.hourStart, 0, 0, 0);
            if (evtEnd < rangeStart) return false;
          }
          if (state.dateEnd) {
            var rangeEnd = new Date(state.dateEnd);
            rangeEnd.setHours(state.hourEnd, 59, 59, 999);
            if (evtStart > rangeEnd) return false;
          }
        }

        return true;
      }

      function buildCard(evt) {
        var card = document.createElement('article');
        card.className = 'fs-evt-card';

        var title    = esc(evt.title || 'Event');
        var url      = evt.fullUrl || evt.urlId || '#';
        var locTitle = evt.location && evt.location.addressTitle ? esc(evt.location.addressTitle) : '';
        var excerpt  = evt.excerpt || '';
        var cats     = (evt.categories || []).map(function (c) {
          return '<span class="fs-evt-badge">' + esc(c) + '</span>';
        }).join('');
        var tags     = (evt.tags || []).map(function (t) {
          return '<span class="fs-evt-badge fs-evt-badge--tag">' + esc(t) + '</span>';
        }).join('');

        var start    = new Date(evt.startDate);
        var end      = evt.endDate ? new Date(evt.endDate) : null;
        var dateStr  = fmtDate(start);
        var timeStr  = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: !cfg.use24Hour });
        var endStr   = end ? ' – ' + fmtDate(end) : '';

        var imgStyle = '';
        if (evt.assetUrl) {
          var focal = evt.mediaFocalPoint
            ? (evt.mediaFocalPoint.x * 100) + '% ' + (evt.mediaFocalPoint.y * 100) + '%'
            : 'center';
          imgStyle = 'background-image: url(' + evt.assetUrl + '?format=1500w); background-position:' + focal + ';';
        }

        card.innerHTML = (
          '<a href="' + url + '" class="fs-evt-card__inner">' +
            '<div class="fs-evt-card__img" style="' + imgStyle + '">' +
              (cats ? '<div class="fs-evt-card__badges">' + cats + '</div>' : '') +
            '</div>' +
            '<div class="fs-evt-card__body">' +
              '<div class="fs-evt-card__meta">' +
                '<span class="fs-evt-card__date">' + dateStr + endStr + '</span>' +
                '<span class="fs-evt-card__time">' + timeStr + '</span>' +
                (locTitle ? '<span class="fs-evt-card__loc">' + locTitle + '</span>' : '') +
              '</div>' +
              '<h3 class="fs-evt-card__title">' + title + '</h3>' +
              (excerpt ? '<p class="fs-evt-card__excerpt">' + esc(excerpt) + '</p>' : '') +
              (tags ? '<div class="fs-evt-card__tags">' + tags + '</div>' : '') +
              '<span class="fs-evt-card__cta">' + cfg.viewEventLabel + '</span>' +
            '</div>' +
          '</a>'
        );

        return card;
      }

      /* ══════════════════════════════════════
         UPCOMING / PAST TOGGLE
      ══════════════════════════════════════ */
      function wireToggle() {
        qsa('.fs-toggle-btn', app).forEach(function (btn) {
          btn.addEventListener('click', function () {
            qsa('.fs-toggle-btn', app).forEach(function (b) { b.classList.remove('fs-toggle-btn--active'); });
            btn.classList.add('fs-toggle-btn--active');
            state.view = btn.dataset.view;
            renderCards();
          });
        });
      }

      /* ══════════════════════════════════════
         DROPDOWNS (location / category / tag)
      ══════════════════════════════════════ */
      function wireDropdowns() {
        qsa('.fs-dropdown:not(.fs-dropdown--date)', app).forEach(function (dd) {
          var trigger = qs('.fs-dd-trigger', dd);
          var panel   = qs('.fs-dd-panel', dd);
          var labelEl = qs('.fs-dd-label', dd);
          var filterId = dd.dataset.filter;
          var defaultLabel = labelEl.textContent;

          trigger.addEventListener('click', function (e) {
            e.stopPropagation();
            closeAllDropdowns(dd);
            dd.classList.toggle('fs-dd--open');
          });

          qsa('.fs-dd-option', dd).forEach(function (opt) {
            opt.addEventListener('click', function () {
              var val = opt.dataset.value;
              state[filterId] = val || null;
              labelEl.textContent = val ? opt.textContent : defaultLabel;
              qsa('.fs-dd-option', dd).forEach(function (o) { o.classList.remove('fs-dd-option--active'); });
              opt.classList.add('fs-dd-option--active');
              dd.classList.remove('fs-dd--open');
              renderCards();
            });
          });
        });

        document.addEventListener('click', function (e) {
          if (!e.target.closest('.fs-dropdown')) closeAllDropdowns();
        });
      }

      function closeAllDropdowns(except) {
        qsa('.fs-dropdown', app).forEach(function (dd) {
          if (dd !== except) dd.classList.remove('fs-dd--open');
        });
      }

      /* ══════════════════════════════════════
         DATE + HOUR RANGE PICKER
      ══════════════════════════════════════ */
      function wireDatePicker() {
        var ddDate   = qs('#fs-dd-date', app);
        if (!ddDate) return;

        var trigger  = qs('.fs-dd-trigger', ddDate);
        var labelEl  = qs('.fs-dd-label', ddDate);
        var calLeft  = qs('#fs-dp-cal-left', app);
        var calRight = qs('#fs-dp-cal-right', app);

        /* Calendar state */
        var dp = {
          leftMonth:  new Date(),
          rightMonth: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
          selecting:  'start',   /* 'start' | 'end' */
          hoverDate:  null,
          tempStart:  null,
          tempEnd:    null,
        };
        dp.leftMonth.setDate(1);
        dp.leftMonth.setHours(0, 0, 0, 0);

        trigger.addEventListener('click', function (e) {
          e.stopPropagation();
          closeAllDropdowns(ddDate);
          ddDate.classList.toggle('fs-dd--open');
          if (ddDate.classList.contains('fs-dd--open')) renderCals();
        });

        /* Presets */
        qsa('.fs-dp-preset', app).forEach(function (btn) {
          btn.addEventListener('click', function () {
            qsa('.fs-dp-preset', app).forEach(function (b) { b.classList.remove('fs-dp-preset--active'); });
            btn.classList.add('fs-dp-preset--active');
            applyPreset(btn.dataset.preset);
            renderCals();
          });
        });

        function applyPreset(preset) {
          var today = new Date();
          today.setHours(0, 0, 0, 0);

          if (preset === 'all') {
            dp.tempStart = null;
            dp.tempEnd   = null;
          } else if (preset === 'today') {
            dp.tempStart = new Date(today);
            dp.tempEnd   = new Date(today);
          } else if (preset === 'this-week') {
            var dow = today.getDay() || 7;
            dp.tempStart = new Date(today);
            dp.tempStart.setDate(today.getDate() - dow + 1);
            dp.tempEnd = new Date(dp.tempStart);
            dp.tempEnd.setDate(dp.tempStart.getDate() + 6);
          } else if (preset === 'this-month') {
            dp.tempStart = new Date(today.getFullYear(), today.getMonth(), 1);
            dp.tempEnd   = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          } else if (preset === 'this-year') {
            dp.tempStart = new Date(today.getFullYear(), 0, 1);
            dp.tempEnd   = new Date(today.getFullYear(), 11, 31);
          } else if (preset === 'custom') {
            dp.tempStart = null;
            dp.tempEnd   = null;
            dp.selecting = 'start';
          }

          if (dp.tempStart) {
            dp.leftMonth  = new Date(dp.tempStart.getFullYear(), dp.tempStart.getMonth(), 1);
            dp.rightMonth = new Date(dp.leftMonth.getFullYear(), dp.leftMonth.getMonth() + 1, 1);
          }
        }

        /* Calendar render */
        function renderCals() {
          renderCal(calLeft,  dp.leftMonth);
          renderCal(calRight, dp.rightMonth);
        }

        function renderCal(el, monthDate) {
          var year  = monthDate.getFullYear();
          var month = monthDate.getMonth();
          var monthName = monthDate.toLocaleString('en-US', { month: 'long' });

          var firstDay = new Date(year, month, 1).getDay();
          var offset   = (firstDay + 6) % 7; /* Monday-first */
          var daysInMonth = new Date(year, month + 1, 0).getDate();
          var prevDays    = new Date(year, month, 0).getDate();

          var html = (
            '<div class="fs-dp-cal-header">' +
              '<button type="button" class="fs-dp-nav" data-dir="prev" data-cal="' + el.id + '">&lsaquo;</button>' +
              '<span>' + monthName + ' ' + year + '</span>' +
              '<button type="button" class="fs-dp-nav" data-dir="next" data-cal="' + el.id + '">&rsaquo;</button>' +
            '</div>' +
            '<div class="fs-dp-grid">' +
              '<span class="fs-dp-day-name">Mo</span><span class="fs-dp-day-name">Tu</span>' +
              '<span class="fs-dp-day-name">We</span><span class="fs-dp-day-name">Th</span>' +
              '<span class="fs-dp-day-name">Fr</span><span class="fs-dp-day-name">Sa</span>' +
              '<span class="fs-dp-day-name">Su</span>'
          );

          /* Prev month overflow */
          for (var p = offset - 1; p >= 0; p--) {
            html += '<span class="fs-dp-cell fs-dp-cell--disabled">' + (prevDays - p) + '</span>';
          }

          /* Current month days */
          for (var d = 1; d <= daysInMonth; d++) {
            var cellDate = new Date(year, month, d);
            cellDate.setHours(0, 0, 0, 0);
            var ts = cellDate.getTime();

            var cls = 'fs-dp-cell';
            if (dp.tempStart && dp.tempEnd) {
              var s = dp.tempStart.getTime();
              var e = dp.tempEnd.getTime();
              if (ts === s && ts === e) cls += ' fs-dp-cell--single';
              else if (ts === s) cls += ' fs-dp-cell--start';
              else if (ts === e) cls += ' fs-dp-cell--end';
              else if (ts > s && ts < e) cls += ' fs-dp-cell--range';
            } else if (dp.tempStart && !dp.tempEnd) {
              if (ts === dp.tempStart.getTime()) cls += ' fs-dp-cell--single';
              else if (dp.hoverDate && ts > dp.tempStart.getTime() && ts <= dp.hoverDate.getTime()) {
                cls += ' fs-dp-cell--range';
              }
            }

            html += '<span class="' + cls + '" data-ts="' + ts + '">' + d + '</span>';
          }

          /* Next month overflow to fill 6-row grid */
          var total    = offset + daysInMonth;
          var overflow = total % 7 === 0 ? 0 : 7 - (total % 7);
          for (var n = 1; n <= overflow; n++) {
            html += '<span class="fs-dp-cell fs-dp-cell--disabled">' + n + '</span>';
          }

          html += '</div>';
          el.innerHTML = html;

          /* Nav buttons */
          qsa('.fs-dp-nav', el).forEach(function (nav) {
            nav.addEventListener('click', function () {
              var isLeft = el.id === 'fs-dp-cal-left';
              if (nav.dataset.dir === 'prev') {
                if (isLeft) {
                  dp.leftMonth  = new Date(dp.leftMonth.getFullYear(), dp.leftMonth.getMonth() - 1, 1);
                  dp.rightMonth = new Date(dp.leftMonth.getFullYear(), dp.leftMonth.getMonth() + 1, 1);
                } else {
                  dp.rightMonth = new Date(dp.rightMonth.getFullYear(), dp.rightMonth.getMonth() - 1, 1);
                }
              } else {
                if (isLeft) {
                  dp.leftMonth  = new Date(dp.leftMonth.getFullYear(), dp.leftMonth.getMonth() + 1, 1);
                  dp.rightMonth = new Date(dp.leftMonth.getFullYear(), dp.leftMonth.getMonth() + 1, 1);
                } else {
                  dp.rightMonth = new Date(dp.rightMonth.getFullYear(), dp.rightMonth.getMonth() + 1, 1);
                }
              }
              renderCals();
            });
          });

          /* Day click */
          qsa('.fs-dp-cell:not(.fs-dp-cell--disabled)', el).forEach(function (cell) {
            cell.addEventListener('click', function () {
              var clicked = new Date(Number(cell.dataset.ts));
              /* Clear custom preset highlight */
              qsa('.fs-dp-preset', app).forEach(function (b) { b.classList.remove('fs-dp-preset--active'); });
              var customBtn = qs('[data-preset="custom"]', app);
              if (customBtn) customBtn.classList.add('fs-dp-preset--active');

              if (dp.selecting === 'start' || !dp.tempStart) {
                dp.tempStart = clicked;
                dp.tempEnd   = null;
                dp.selecting = 'end';
              } else {
                if (clicked < dp.tempStart) {
                  dp.tempEnd   = dp.tempStart;
                  dp.tempStart = clicked;
                } else {
                  dp.tempEnd = clicked;
                }
                dp.selecting = 'start';
              }
              dp.hoverDate = null;
              renderCals();
            });

            cell.addEventListener('mouseenter', function () {
              if (dp.selecting === 'end' && dp.tempStart) {
                dp.hoverDate = new Date(Number(cell.dataset.ts));
                renderCals();
              }
            });
          });
        }

        /* Hour selects */
        qs('#fs-hour-start', app).addEventListener('change', function () {
          state.hourStart = parseInt(this.value, 10);
        });
        qs('#fs-hour-end', app).addEventListener('change', function () {
          state.hourEnd = parseInt(this.value, 10);
        });

        /* Apply */
        qs('#fs-dp-apply', app).addEventListener('click', function () {
          state.dateStart = dp.tempStart;
          state.dateEnd   = dp.tempEnd || dp.tempStart;

          if (!state.dateStart) {
            labelEl.textContent = 'All dates';
          } else if (state.dateStart && state.dateEnd &&
                     state.dateStart.getTime() === state.dateEnd.getTime()) {
            labelEl.textContent = fmtDate(state.dateStart);
          } else {
            labelEl.textContent = fmtDate(state.dateStart) + ' – ' + fmtDate(state.dateEnd);
          }

          ddDate.classList.remove('fs-dd--open');
          renderCards();
        });

        /* Cancel */
        qs('#fs-dp-cancel', app).addEventListener('click', function () {
          ddDate.classList.remove('fs-dd--open');
        });

        /* Outside click */
        document.addEventListener('click', function (e) {
          if (!e.target.closest('#fs-dd-date')) ddDate.classList.remove('fs-dd--open');
        });
      }

      /* ══════════════════════════════════════
         RESET
      ══════════════════════════════════════ */
      function wireReset() {
        var btn = qs('#fs-reset', app);
        if (!btn) return;
        btn.addEventListener('click', function () {
          state.location  = null;
          state.category  = null;
          state.tag       = null;
          state.dateStart = null;
          state.dateEnd   = null;
          state.hourStart = 0;
          state.hourEnd   = 23;

          /* Reset dropdown labels */
          qsa('.fs-dd-label', app).forEach(function (el) {
            var dd = el.closest('.fs-dropdown');
            if (dd) {
              var defaultOpt = qs('.fs-dd-option--all', dd);
              if (defaultOpt) el.textContent = defaultOpt.textContent;
            }
          });
          qsa('.fs-dd-option', app).forEach(function (o) { o.classList.remove('fs-dd-option--active'); });
          qsa('.fs-dp-preset', app).forEach(function (b) { b.classList.remove('fs-dp-preset--active'); });
          var allPreset = qs('[data-preset="all"]', app);
          if (allPreset) allPreset.classList.add('fs-dp-preset--active');

          var hourStart = qs('#fs-hour-start', app);
          var hourEnd   = qs('#fs-hour-end', app);
          if (hourStart) hourStart.value = '0';
          if (hourEnd)   hourEnd.value   = '23';

          renderCards();
        });
      }

    }).catch(function () {
      if (nativeList) nativeList.style.removeProperty('display');
    });
  }


  /* ═══════════════════════════════════════════════════
     ESCAPE HELPERS
  ═══════════════════════════════════════════════════ */
  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
  function escAttr(str) {
    return esc(str).replace(/"/g, '&quot;');
  }

}());
