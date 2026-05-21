/*!
 * filter-sort.js  v2.0
 * Unified blog filter + events filter for Squarespace 7.1 (Fluid Engine)
 * https://github.com/ashlyleh/squarespace-code
 *
 * ─── CONFIG (place BEFORE the script tag) ───────────────────────────────────
 *
 * <script>
 * window.filterSortConfig = {
 *
 *   // ── BLOG ──────────────────────────────────────────────────────────────
 *   blogUrl:          '/blog',             // path to your blog page (auto-detected if omitted)
 *
 *   // Layout: 'basic-grid' | 'masonry' | 'single-column' | 'side-by-side' | 'alternating'
 *   blogLayout:       'basic-grid',
 *   // Set true to use the editorial newsroom style (large hero first card)
 *   blogNewsroom:     false,
 *   // Width: 'inset' matches Squarespace site max-width, 'full' is edge to edge
 *   blogWidth:        'inset',
 *
 *   blogBatchSize:    30,
 *
 *   // Toggle which filters appear in the bar
 *   blogShowSearch:   true,
 *   blogShowCategory: true,
 *   blogShowTag:      true,
 *   blogShowAuthor:   true,
 *   blogShowYear:     true,
 *   blogShowSort:     true,
 *
 *   // Labels
 *   blogLabelCategory: 'Categories',
 *   blogLabelTag:      'Tags',
 *   blogLabelAuthor:   'Authors',
 *   blogLabelYear:     'Date',
 *   blogResetLabel:    'Reset',
 *   blogNoResults:     'No posts match your filters.',
 *   blogReadMore:      'Read more',
 *   blogLoadMore:      'Load more',
 *
 *   // ── ARCHIVE ────────────────────────────────────────────────────────────
 *   archiveAllLabel:  '‹ See All',
 *   archivePosition:  'bottom',            // 'top' or 'bottom'
 *
 *   // ── EVENTS ─────────────────────────────────────────────────────────────
 *   eventsContainerId: 'evt-filter-app',
 *   upcomingLabel:     'Upcoming',
 *   pastLabel:         'Past',
 *   eventCountLabel:   'events',
 *   resetLabel:        'Reset',
 *   noResultsTitle:    'No events match these filters.',
 *   noResultsSub:      'Try adjusting your filters.',
 *   viewEventLabel:    'View Event',
 *
 *   showLocation:      true,
 *   showDate:          true,
 *   showCategory:      true,
 *   showTag:           true,
 *   showEventCount:    true,
 *   showReset:         true,
 *   eventsShowSearch:  true,
 *
 *   use24Hour:         false,
 * };
 * </script>
 */

(function () {
  'use strict';

  /* ─────────────────────────────────────────────────────────────────────────
     CONFIG MERGE
  ───────────────────────────────────────────────────────────────────────── */
  var cfg = Object.assign({
    /* Blog */
    blogMountId:       'blog-filter-app',
    blogUrl:           null,
    blogLayout:        'basic-grid',
    blogNewsroom:      false,
    blogBatchSize:     30,
    blogWidth:         'inset',            /* 'inset' | 'full' */
    blogShowSearch:    true,
    blogShowCategory:  true,
    blogShowTag:       true,
    blogShowAuthor:    true,
    blogShowYear:      true,
    blogShowSort:      true,
    blogLabelCategory: 'Categories',
    blogLabelTag:      'Tags',
    blogLabelAuthor:   'Authors',
    blogLabelYear:     'Date',
    blogResetLabel:    'Reset',
    blogNoResults:     'No posts match your filters.',
    blogReadMore:      'Read more',
    blogLoadMore:      'Load more',
    /* Archive */
    archiveAllLabel:   '‹ See All',
    archivePosition:   'bottom',
    /* Events */
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
    eventsShowSearch:  true,
    use24Hour:         false,
  }, window.filterSortConfig || {});


  /* ─────────────────────────────────────────────────────────────────────────
     UTILITIES
  ───────────────────────────────────────────────────────────────────────── */
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }
  function qs(sel, ctx)  { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  function fetchJSON(url) {
    return fetch(url, { headers: { Accept: 'application/json' } })
      .then(function (r) { return r.ok ? r.json() : {}; })
      .catch(function () { return {}; });
  }

  function fmtDate(d) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  function fmtHour(h, use24) {
    if (use24) return h + ':00';
    if (h === 0)  return '12 AM';
    if (h === 12) return '12 PM';
    return h < 12 ? h + ' AM' : (h - 12) + ' PM';
  }

  /** Strip HTML tags and decode entities from a string */
  function stripHtml(str) {
    if (!str) return '';
    var d = document.createElement('div');
    d.innerHTML = str;
    return (d.textContent || d.innerText || '').trim();
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
  function escAttr(str) {
    return esc(str).replace(/"/g, '&quot;');
  }

  var CHEVRON = '<svg class="fs-chevron" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 4.5L7 9.5L12 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';


  /* ─────────────────────────────────────────────────────────────────────────
     CONTEXT DETECTION
  ───────────────────────────────────────────────────────────────────────── */

  /* Native blog grid selectors Squarespace uses across all layout types */
  var BLOG_GRID_SEL = [
    '.blog-basic-grid',
    '.blog-masonry-wrapper',
    '.blog-masonry',
    '.blog-side-by-side',
    '.blog-alternating-side-by-side',
    '.collection-content-wrapper',
  ].join(',');

  ready(function () {
    if (qs('#' + cfg.blogMountId) || cfg.blogUrl || qs(BLOG_GRID_SEL)) initBlog();
    if (qs('.archive-group-list'))                 initArchive();
    if (qs('#' + cfg.eventsContainerId) || qs('.eventlist')) initEvents();
  });


  /* ═════════════════════════════════════════════════════════════════════════
     1 — BLOG FILTER
  ═════════════════════════════════════════════════════════════════════════ */
  function initBlog() {
    /* ── Find or create mount point ── */
    var mount      = qs('#' + cfg.blogMountId);
    var nativeGrid = qs(BLOG_GRID_SEL);

    if (!mount && !nativeGrid && !cfg.blogUrl) return;

    /* If no explicit mount div, create one and insert before the native grid */
    if (!mount) {
      mount = document.createElement('div');
      mount.id = cfg.blogMountId;
      if (nativeGrid) {
        nativeGrid.parentNode.insertBefore(mount, nativeGrid);
      } else {
        document.body.appendChild(mount);
      }
    }

    /* Hide the native Squarespace blog grid */
    if (nativeGrid) {
      nativeGrid.style.setProperty('display', 'none', 'important');
    }

    /* Apply width mode */
    mount.classList.add('fs-blog-app');
    mount.classList.add(cfg.blogWidth === 'full' ? 'fs-blog-app--full' : 'fs-blog-app--inset');

    /* Derive blog URL from current path if not set */
    var blogUrl = cfg.blogUrl || window.location.pathname.split('?')[0];

    /* State */
    var posts      = [];
    var filtered   = [];
    var rendered   = 0;
    var state = {
      search:     '',
      categories: new Set(),
      tags:       new Set(),
      authors:    new Set(),
      years:      new Set(),
      sort:       'newest',
    };

    /* Build shell */
    mount.innerHTML = buildBlogShell();
    var app        = mount;
    var barEl      = qs('.fs-blog-bar', app);
    var gridEl     = qs('.fs-blog-grid', app);
    var noResEl    = qs('.fs-blog-no-results', app);
    var loadMoreEl = qs('.fs-blog-load-more', app);

    /* Fetch all posts (paginated) */
    fetchAllPosts(blogUrl, [], 0).then(function (rawPosts) {
      posts = rawPosts.map(normalisePost);

      /* Collect filter options */
      var meta = collectMeta(posts);
      buildBlogBar(barEl, meta);
      wireBar(barEl);
      applyFilters();
    });

    /* ── Fetch all pages ── */
    function fetchAllPosts(url, acc, offset) {
      var fetchUrl = url + '?format=json' + (offset ? '&offset=' + offset : '');
      return fetchJSON(fetchUrl).then(function (data) {
        var items      = data.items || [];
        var pagination = data.pagination || {};
        acc = acc.concat(items);
        if (items.length > 0 && pagination.nextPageOffset && pagination.nextPageOffset !== offset) {
          return fetchAllPosts(url, acc, pagination.nextPageOffset);
        }
        return acc;
      });
    }

    /* ── Normalise a raw post object ── */
    function normalisePost(p) {
      var excerpt = stripHtml(p.excerpt || '');
      var year    = p.publishOn ? String(new Date(p.publishOn).getFullYear()) : '';
      var thumb   = p.assetUrl || p.thumbnailUrl || '';
      return {
        id:         p.id || p.urlId || '',
        title:      stripHtml(p.title || ''),
        excerpt:    excerpt,
        categories: (p.categories || []).map(function (c) { return String(c).trim(); }),
        tags:       (p.tags || []).map(function (t) { return String(t).trim(); }),
        author:     p.author && p.author.displayName ? String(p.author.displayName).trim() : '',
        publishOn:  p.publishOn || 0,
        fullUrl:    p.fullUrl || '#',
        thumbnail:  thumb,
        year:       year,
        focal:      p.mediaFocalPoint
          ? (p.mediaFocalPoint.x * 100) + '% ' + (p.mediaFocalPoint.y * 100) + '%'
          : 'center',
      };
    }

    /* ── Collect unique meta values ── */
    function collectMeta(list) {
      var cats  = {}, tags = {}, authors = {}, years = {};
      list.forEach(function (p) {
        p.categories.forEach(function (c) { cats[c]    = (cats[c]    || 0) + 1; });
        p.tags.forEach(function (t)       { tags[t]    = (tags[t]    || 0) + 1; });
        if (p.author) authors[p.author]   = (authors[p.author] || 0) + 1;
        if (p.year)   years[p.year]       = (years[p.year]     || 0) + 1;
      });
      function sorted(obj) {
        return Object.keys(obj).sort().map(function (k) { return { value: k, count: obj[k] }; });
      }
      return {
        categories: sorted(cats),
        tags:       sorted(tags),
        authors:    sorted(authors),
        years:      Object.keys(years).sort().reverse().map(function (k) { return { value: k, count: years[k] }; }),
      };
    }

    /* ── Build bar HTML shell ── */
    function buildBlogShell() {
      return (
        '<div class="fs-blog-bar"></div>' +
        '<div class="fs-blog-grid" data-layout="' + esc(cfg.blogLayout) + '" data-newsroom="' + (cfg.blogNewsroom ? '1' : '0') + '"></div>' +
        '<div class="fs-blog-no-results" style="display:none;">' + esc(cfg.blogNoResults) + '</div>' +
        '<button type="button" class="fs-blog-load-more" style="display:none;">' + esc(cfg.blogLoadMore) + '</button>'
      );
    }

    /* ── Build bar contents after data loaded ── */
    function buildBlogBar(bar, meta) {
      var html = '<div class="fs-bar-inner">';

      /* Search */
      if (cfg.blogShowSearch) {
        html += '<div class="fs-bar-search-wrap">' +
          '<input type="text" class="fs-bar-search" placeholder="Search posts\u2026" aria-label="Search posts">' +
          '</div>';
      }

      /* Filter dropdowns */
      var filters = [
        { key: 'categories', label: cfg.blogLabelCategory, show: cfg.blogShowCategory, items: meta.categories },
        { key: 'tags',       label: cfg.blogLabelTag,      show: cfg.blogShowTag,      items: meta.tags       },
        { key: 'authors',    label: cfg.blogLabelAuthor,   show: cfg.blogShowAuthor,   items: meta.authors    },
        { key: 'years',      label: cfg.blogLabelYear,     show: cfg.blogShowYear,     items: meta.years      },
      ];

      filters.forEach(function (f) {
        if (!f.show || !f.items.length) return;
        html += buildMultiDropdown(f.key, f.label, f.items);
      });

      /* Sort */
      if (cfg.blogShowSort) {
        html += '<select class="fs-bar-sort" aria-label="Sort posts">' +
          '<option value="newest">Newest first</option>' +
          '<option value="oldest">Oldest first</option>' +
          '<option value="az">A \u2013 Z</option>' +
          '<option value="za">Z \u2013 A</option>' +
          '</select>';
      }

      /* Reset */
      html += '<button type="button" class="fs-bar-reset fs-bar-reset--disabled">' + esc(cfg.blogResetLabel) + '</button>';

      html += '</div>'; /* .fs-bar-inner */
      bar.innerHTML = html;
    }

    /* ── Multiselect dropdown (no checkboxes) ── */
    function buildMultiDropdown(key, label, items) {
      var opts = items.map(function (item) {
        return '<li class="fs-dd-opt" data-value="' + escAttr(item.value) + '">' + esc(item.value) + '</li>';
      }).join('');
      return (
        '<div class="fs-dropdown fs-blog-dd" data-key="' + key + '">' +
          '<button type="button" class="fs-dd-trigger">' +
            '<span class="fs-dd-label">' + esc(label) + '</span>' +
            CHEVRON +
          '</button>' +
          '<ul class="fs-dd-panel">' + opts + '</ul>' +
        '</div>'
      );
    }

    /* ── Wire all bar interactions ── */
    function wireBar(bar) {
      /* Search */
      var searchEl = qs('.fs-bar-search', bar);
      if (searchEl) {
        var searchTimer;
        searchEl.addEventListener('input', function () {
          clearTimeout(searchTimer);
          searchTimer = setTimeout(function () {
            state.search = searchEl.value.toLowerCase().trim();
            applyFilters();
          }, 250);
        });
      }

      /* Dropdowns */
      qsa('.fs-blog-dd', bar).forEach(function (dd) {
        var key      = dd.dataset.key;
        var trigger  = qs('.fs-dd-trigger', dd);
        var labelEl  = qs('.fs-dd-label', dd);
        var panel    = qs('.fs-dd-panel', dd);
        var origLabel = labelEl.textContent;

        trigger.addEventListener('click', function (e) {
          e.stopPropagation();
          closeAllBlogDd(dd);
          dd.classList.toggle('fs-dd--open');
        });

        qsa('.fs-dd-opt', panel).forEach(function (opt) {
          opt.addEventListener('click', function (e) {
            e.stopPropagation();
            var val = opt.dataset.value;
            var set = state[key];
            if (set.has(val)) {
              set.delete(val);
              opt.classList.remove('fs-dd-opt--active');
            } else {
              set.add(val);
              opt.classList.add('fs-dd-opt--active');
            }
            /* Update label */
            var count = set.size;
            labelEl.textContent = count > 0 ? origLabel + ' \xb7 ' + count : origLabel;
            updateResetState(bar);
            applyFilters();
          });
        });
      });

      /* Sort */
      var sortEl = qs('.fs-bar-sort', bar);
      if (sortEl) {
        sortEl.addEventListener('change', function () {
          state.sort = sortEl.value;
          applyFilters();
        });
      }

      /* Reset */
      var resetEl = qs('.fs-bar-reset', bar);
      if (resetEl) {
        resetEl.addEventListener('click', function () {
          state.search     = '';
          state.categories = new Set();
          state.tags       = new Set();
          state.authors    = new Set();
          state.years      = new Set();
          if (searchEl) searchEl.value = '';
          if (sortEl)   sortEl.value   = 'newest';
          state.sort = 'newest';
          qsa('.fs-dd-opt--active', bar).forEach(function (o) { o.classList.remove('fs-dd-opt--active'); });
          qsa('.fs-dd-label', bar).forEach(function (l) {
            var dd = l.closest('.fs-blog-dd');
            if (dd) {
              var key = dd.dataset.key;
              var labels = {
                categories: cfg.blogLabelCategory,
                tags:       cfg.blogLabelTag,
                authors:    cfg.blogLabelAuthor,
                years:      cfg.blogLabelYear,
              };
              l.textContent = labels[key] || l.textContent;
            }
          });
          updateResetState(bar);
          applyFilters();
        });
      }

      /* Close dropdowns on outside click */
      document.addEventListener('click', function () { closeAllBlogDd(); });
    }

    function closeAllBlogDd(except) {
      qsa('.fs-blog-dd', app).forEach(function (dd) {
        if (dd !== except) dd.classList.remove('fs-dd--open');
      });
    }

    function updateResetState(bar) {
      var active = state.search ||
        state.categories.size || state.tags.size ||
        state.authors.size    || state.years.size;
      var btn = qs('.fs-bar-reset', bar);
      if (btn) {
        btn.classList.toggle('fs-bar-reset--disabled', !active);
      }
    }

    /* ── Filter + sort posts ── */
    function applyFilters() {
      filtered = posts.filter(function (p) {
        if (state.search && p.title.toLowerCase().indexOf(state.search) === -1) return false;

        var hasActive = state.categories.size || state.tags.size || state.authors.size || state.years.size;
        if (!hasActive) return true;

        /* OR logic across all active filters */
        if (state.categories.size && p.categories.some(function (c) { return state.categories.has(c); })) return true;
        if (state.tags.size       && p.tags.some(function (t)       { return state.tags.has(t); }))       return true;
        if (state.authors.size    && state.authors.has(p.author))                                          return true;
        if (state.years.size      && state.years.has(p.year))                                              return true;
        return false;
      });

      filtered.sort(function (a, b) {
        if (state.sort === 'oldest') return a.publishOn - b.publishOn;
        if (state.sort === 'az')     return a.title.localeCompare(b.title);
        if (state.sort === 'za')     return b.title.localeCompare(a.title);
        return b.publishOn - a.publishOn; /* newest */
      });

      rendered = 0;
      gridEl.innerHTML = '';
      noResEl.style.display  = filtered.length === 0 ? 'block' : 'none';
      loadMoreEl.style.display = 'none';
      renderBatch();
    }

    /* ── Render one batch of cards ── */
    function renderBatch() {
      var batch = filtered.slice(rendered, rendered + cfg.blogBatchSize);
      batch.forEach(function (p) {
        gridEl.appendChild(buildBlogCard(p));
      });
      rendered += batch.length;
      loadMoreEl.style.display = rendered < filtered.length ? 'block' : 'none';
    }

    if (loadMoreEl) {
      loadMoreEl.addEventListener('click', function () { renderBatch(); });
    }

    /* ── Build a blog card ── */
    function buildBlogCard(p) {
      var layout   = cfg.blogLayout;
      var newsroom = cfg.blogNewsroom;
      var isFirst  = rendered === 0; /* hero slot */

      var card = document.createElement('article');
      card.className = 'fs-blog-card fs-blog-card--' + layout + (newsroom && isFirst ? ' fs-blog-card--hero' : '');

      var imgStyle = p.thumbnail
        ? 'background-image:url(' + escAttr(p.thumbnail) + '?format=1500w);background-position:' + escAttr(p.focal) + ';'
        : '';

      var dateStr = p.publishOn
        ? new Date(p.publishOn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : '';

      var catBadges = p.categories.slice(0, 2).map(function (c) {
        return '<span class="fs-blog-badge">' + esc(c) + '</span>';
      }).join('');

      card.innerHTML = (
        '<a href="' + escAttr(p.fullUrl) + '" class="fs-blog-card__link" aria-label="' + escAttr(p.title) + '">' +
          '<div class="fs-blog-card__img"' + (imgStyle ? ' style="' + imgStyle + '"' : '') + '>' +
            (catBadges ? '<div class="fs-blog-card__badges">' + catBadges + '</div>' : '') +
          '</div>' +
          '<div class="fs-blog-card__body">' +
            '<div class="fs-blog-card__meta">' +
              (dateStr ? '<span class="fs-blog-card__date">' + esc(dateStr) + '</span>' : '') +
              (p.author ? '<span class="fs-blog-card__author">' + esc(p.author) + '</span>' : '') +
            '</div>' +
            '<h3 class="fs-blog-card__title">' + esc(p.title) + '</h3>' +
            (p.excerpt ? '<p class="fs-blog-card__excerpt">' + esc(p.excerpt) + '</p>' : '') +
            '<span class="fs-blog-card__cta">' + esc(cfg.blogReadMore) + '</span>' +
          '</div>' +
        '</a>'
      );

      return card;
    }
  }


  /* ═════════════════════════════════════════════════════════════════════════
     2 — ARCHIVE BLOCK
  ═════════════════════════════════════════════════════════════════════════ */
  function initArchive() {
    var archiveList = qs('.archive-group-list');
    if (!archiveList) return;

    var firstLink = qs('a.archive-group-name-link', archiveList);
    var blogRoot  = '/';
    if (firstLink) {
      var parts = firstLink.pathname.replace(/\/$/, '').split('/');
      parts.pop();
      blogRoot = parts.join('/') || '/';
    }

    var currentPath = window.location.pathname.replace(/\/$/, '');
    var li = document.createElement('li');
    li.className = 'archive-group';
    var a = document.createElement('a');
    a.href        = blogRoot;
    a.className   = 'archive-group-name-link archive-all-link';
    a.textContent = cfg.archiveAllLabel;
    if (currentPath === blogRoot || currentPath === blogRoot + '/') {
      a.classList.add('is-active');
    }
    li.appendChild(a);
    if (cfg.archivePosition === 'top') {
      archiveList.insertBefore(li, archiveList.firstChild);
    } else {
      archiveList.appendChild(li);
    }
  }


  /* ═════════════════════════════════════════════════════════════════════════
     3 — EVENTS FILTER
  ═════════════════════════════════════════════════════════════════════════ */
  function initEvents() {
    var mountEl    = qs('#' + cfg.eventsContainerId) || qs('.eventlist');
    if (!mountEl) return;

    var nativeList = qs('.eventlist');
    if (nativeList) nativeList.style.setProperty('display', 'none', 'important');

    var pagePath = window.location.pathname.split('?')[0];

    Promise.all([
      fetchJSON(pagePath + '?format=json-pretty'),
      fetchJSON(pagePath + '?view=past&format=json-pretty'),
    ]).then(function (results) {
      var upcomingRaw = results[0];
      var pastRaw     = results[1];

      var seen = new Set();
      function dedup(arr) {
        return arr.filter(function (e) {
          if (!e.id || seen.has(e.id)) return false;
          seen.add(e.id);
          return true;
        });
      }

      var upcomingItems = dedup(upcomingRaw.items || upcomingRaw.upcoming || []);
      var pastItems     = dedup(pastRaw.past || pastRaw.items || []);

      if (!upcomingItems.length && !pastItems.length) {
        if (nativeList) nativeList.style.removeProperty('display');
        return;
      }

      /* Collect meta */
      var allLocations  = new Set();
      var allCategories = new Set();
      var allTags       = new Set();
      function collectEvtMeta(items) {
        items.forEach(function (e) {
          if (e.location && e.location.addressTitle) allLocations.add(e.location.addressTitle);
          (e.categories || []).forEach(function (c) { allCategories.add(c); });
          (e.tags       || []).forEach(function (t) { allTags.add(t); });
        });
      }
      collectEvtMeta(upcomingItems);
      collectEvtMeta(pastItems);

      /* State */
      var state = {
        view:      'upcoming',
        search:    '',
        location:  null,
        category:  null,
        tag:       null,
        dateStart: null,
        dateEnd:   null,
        hourStart: 0,
        hourEnd:   23,
      };

      /* Build app */
      var app = document.createElement('div');
      app.id  = 'fs-evt-app';
      app.innerHTML = buildEvtAppHTML(allLocations, allCategories, allTags);

      if (nativeList) nativeList.insertAdjacentElement('beforebegin', app);
      else mountEl.appendChild(app);

      renderEvtCards();
      wireEvtToggle();
      wireEvtSearch();
      wireEvtDropdowns();
      if (cfg.showDate) wireEvtDatePicker();
      wireEvtReset();

      /* ── Build app HTML ── */
      function buildEvtAppHTML(locs, cats, tags) {
        var filterRight = '';

        if (cfg.eventsShowSearch) {
          filterRight += '<div class="fs-bar-search-wrap fs-bar-search-wrap--evt">' +
            '<input type="text" class="fs-bar-search fs-evt-search" placeholder="Search events\u2026" aria-label="Search events">' +
            '</div>';
        }
        if (cfg.showLocation && locs.size > 1) filterRight += buildEvtDropdown('location', 'All locations', Array.from(locs));
        if (cfg.showDate)                       filterRight += buildEvtDateDropdown();
        if (cfg.showCategory && cats.size > 0)  filterRight += buildEvtDropdown('category', 'All categories', Array.from(cats));
        if (cfg.showTag      && tags.size > 0)  filterRight += buildEvtDropdown('tag', 'All tags', Array.from(tags));
        if (cfg.showReset) {
          filterRight += '<button type="button" class="fs-reset-btn" id="fs-reset">' + esc(cfg.resetLabel) + '</button>';
        }

        return (
          '<div class="fs-filter-bar">' +
            '<div class="fs-filter-left">' +
              '<div class="fs-toggle">' +
                '<button type="button" class="fs-toggle-btn fs-toggle-btn--active" data-view="upcoming">' + esc(cfg.upcomingLabel) + '</button>' +
                '<button type="button" class="fs-toggle-btn" data-view="past">' + esc(cfg.pastLabel) + '</button>' +
              '</div>' +
              (cfg.showEventCount ? '<span class="fs-count" id="fs-count">0 ' + esc(cfg.eventCountLabel) + '</span>' : '') +
            '</div>' +
            '<div class="fs-filter-right">' + filterRight + '</div>' +
          '</div>' +
          '<div class="fs-evt-list" id="fs-evt-list"></div>' +
          '<div class="fs-no-results" id="fs-no-results" style="display:none;">' +
            '<p class="fs-no-results__title">' + esc(cfg.noResultsTitle) + '</p>' +
            '<p class="fs-no-results__sub">' + esc(cfg.noResultsSub) + '</p>' +
          '</div>'
        );
      }

      function buildEvtDropdown(id, defaultLabel, options) {
        var opts = options.map(function (o) {
          return '<li class="fs-dd-option" data-value="' + escAttr(o) + '">' + esc(o) + '</li>';
        }).join('');
        return (
          '<div class="fs-dropdown" id="fs-dd-' + id + '" data-filter="' + id + '">' +
            '<button type="button" class="fs-dd-trigger">' +
              '<span class="fs-dd-label">' + esc(defaultLabel) + '</span>' +
              CHEVRON +
            '</button>' +
            '<ul class="fs-dd-panel">' +
              '<li class="fs-dd-option fs-dd-option--all" data-value="">' + esc(defaultLabel) + '</li>' +
              opts +
            '</ul>' +
          '</div>'
        );
      }

      function buildEvtDateDropdown() {
        var hourOpts    = '';
        var endHourOpts = '';
        for (var h = 0; h <= 23; h++) {
          var label   = fmtHour(h, cfg.use24Hour);
          var sel     = h === 23 ? ' selected' : '';
          hourOpts    += '<option value="' + h + '">' + label + '</option>';
          endHourOpts += '<option value="' + h + '"' + sel + '>' + label + '</option>';
        }
        return (
          '<div class="fs-dropdown fs-dropdown--date" id="fs-dd-date">' +
            '<button type="button" class="fs-dd-trigger">' +
              '<span class="fs-dd-label">All dates</span>' + CHEVRON +
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
              '<div class="fs-dp-calendars">' +
                '<div class="fs-dp-cal" id="fs-dp-cal-left"></div>' +
                '<div class="fs-dp-cal" id="fs-dp-cal-right"></div>' +
              '</div>' +
              '<div class="fs-dp-hours">' +
                '<div class="fs-dp-hour-group"><label class="fs-dp-hour-label">From</label><select class="fs-dp-hour-sel" id="fs-hour-start">' + hourOpts + '</select></div>' +
                '<div class="fs-dp-hour-group"><label class="fs-dp-hour-label">To</label><select class="fs-dp-hour-sel" id="fs-hour-end">' + endHourOpts + '</select></div>' +
              '</div>' +
              '<div class="fs-dp-footer">' +
                '<button type="button" class="fs-dp-cancel" id="fs-dp-cancel">Cancel</button>' +
                '<button type="button" class="fs-dp-apply" id="fs-dp-apply">Apply</button>' +
              '</div>' +
            '</div>' +
          '</div>'
        );
      }

      /* ── Render event cards ── */
      function renderEvtCards() {
        var list  = qs('#fs-evt-list', app);
        var items = state.view === 'upcoming' ? upcomingItems : pastItems;
        var count = 0;
        list.innerHTML = '';

        items.forEach(function (evt) {
          if (!matchesEvt(evt)) return;
          count++;
          list.appendChild(buildEvtCard(evt));
        });

        var countEl = qs('#fs-count', app);
        if (countEl) countEl.textContent = count + ' ' + cfg.eventCountLabel;
        var noRes = qs('#fs-no-results', app);
        if (noRes) noRes.style.display = count === 0 ? 'block' : 'none';
      }

      function matchesEvt(evt) {
        /* Search: title, location, category */
        if (state.search) {
          var q         = state.search;
          var locTitle  = evt.location && evt.location.addressTitle ? evt.location.addressTitle.toLowerCase() : '';
          var titleLow  = (evt.title || '').toLowerCase();
          var catMatch  = (evt.categories || []).some(function (c) { return c.toLowerCase().indexOf(q) !== -1; });
          if (titleLow.indexOf(q) === -1 && locTitle.indexOf(q) === -1 && !catMatch) return false;
        }

        if (state.location) {
          var loc = evt.location && evt.location.addressTitle || '';
          if (loc !== state.location) return false;
        }
        if (state.category && !(evt.categories || []).includes(state.category)) return false;
        if (state.tag      && !(evt.tags       || []).includes(state.tag))      return false;

        if (state.dateStart || state.dateEnd) {
          var evtStart = new Date(evt.startDate);
          var evtEnd   = evt.endDate ? new Date(evt.endDate) : new Date(evt.startDate);
          if (state.dateStart) {
            var rs = new Date(state.dateStart);
            rs.setHours(state.hourStart, 0, 0, 0);
            if (evtEnd < rs) return false;
          }
          if (state.dateEnd) {
            var re = new Date(state.dateEnd);
            re.setHours(state.hourEnd, 59, 59, 999);
            if (evtStart > re) return false;
          }
        }

        return true;
      }

      function buildEvtCard(evt) {
        var card     = document.createElement('article');
        card.className = 'fs-evt-card';

        var title    = esc(evt.title || 'Event');
        var url      = evt.fullUrl || '#';
        var locTitle = evt.location && evt.location.addressTitle ? esc(evt.location.addressTitle) : '';
        var excerpt  = stripHtml(evt.excerpt || '');
        var cats     = (evt.categories || []).map(function (c) {
          return '<span class="fs-evt-badge">' + esc(c) + '</span>';
        }).join('');
        var tags     = (evt.tags || []).map(function (t) {
          return '<span class="fs-evt-badge fs-evt-badge--tag">' + esc(t) + '</span>';
        }).join('');

        var start   = new Date(evt.startDate);
        var end     = evt.endDate ? new Date(evt.endDate) : null;
        var dateStr = fmtDate(start);
        var timeStr = start.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: !cfg.use24Hour });
        var endStr  = end ? ' \u2013 ' + fmtDate(end) : '';

        var imgStyle = '';
        if (evt.assetUrl) {
          var focal = evt.mediaFocalPoint
            ? (evt.mediaFocalPoint.x * 100) + '% ' + (evt.mediaFocalPoint.y * 100) + '%'
            : 'center';
          imgStyle = 'background-image:url(' + escAttr(evt.assetUrl) + '?format=1500w);background-position:' + focal + ';';
        }

        card.innerHTML = (
          '<a href="' + escAttr(url) + '" class="fs-evt-card__inner">' +
            '<div class="fs-evt-card__img"' + (imgStyle ? ' style="' + imgStyle + '"' : '') + '>' +
              (cats ? '<div class="fs-evt-card__badges">' + cats + '</div>' : '') +
            '</div>' +
            '<div class="fs-evt-card__body">' +
              '<div class="fs-evt-card__meta">' +
                '<span class="fs-evt-card__date">' + esc(dateStr) + esc(endStr) + '</span>' +
                '<span class="fs-evt-card__time">' + esc(timeStr) + '</span>' +
                (locTitle ? '<span class="fs-evt-card__loc">' + locTitle + '</span>' : '') +
              '</div>' +
              '<h3 class="fs-evt-card__title">' + title + '</h3>' +
              (excerpt ? '<p class="fs-evt-card__excerpt">' + esc(excerpt) + '</p>' : '') +
              (tags ? '<div class="fs-evt-card__tags">' + tags + '</div>' : '') +
              '<span class="fs-evt-card__cta">' + esc(cfg.viewEventLabel) + '</span>' +
            '</div>' +
          '</a>'
        );
        return card;
      }

      /* ── Wire toggle ── */
      function wireEvtToggle() {
        qsa('.fs-toggle-btn', app).forEach(function (btn) {
          btn.addEventListener('click', function () {
            qsa('.fs-toggle-btn', app).forEach(function (b) { b.classList.remove('fs-toggle-btn--active'); });
            btn.classList.add('fs-toggle-btn--active');
            state.view = btn.dataset.view;
            renderEvtCards();
          });
        });
      }

      /* ── Wire search ── */
      function wireEvtSearch() {
        var searchEl = qs('.fs-evt-search', app);
        if (!searchEl) return;
        var t;
        searchEl.addEventListener('input', function () {
          clearTimeout(t);
          t = setTimeout(function () {
            state.search = searchEl.value.toLowerCase().trim();
            renderEvtCards();
          }, 250);
        });
      }

      /* ── Wire single-select dropdowns ── */
      function wireEvtDropdowns() {
        qsa('.fs-dropdown:not(.fs-dropdown--date)', app).forEach(function (dd) {
          var trigger  = qs('.fs-dd-trigger', dd);
          var labelEl  = qs('.fs-dd-label', dd);
          var filterId = dd.dataset.filter;
          var defLabel = labelEl.textContent;

          trigger.addEventListener('click', function (e) {
            e.stopPropagation();
            closeAllEvtDd(dd);
            dd.classList.toggle('fs-dd--open');
          });

          qsa('.fs-dd-option', dd).forEach(function (opt) {
            opt.addEventListener('click', function () {
              var val = opt.dataset.value;
              state[filterId] = val || null;
              labelEl.textContent = val ? opt.textContent : defLabel;
              qsa('.fs-dd-option', dd).forEach(function (o) { o.classList.remove('fs-dd-option--active'); });
              opt.classList.add('fs-dd-option--active');
              dd.classList.remove('fs-dd--open');
              renderEvtCards();
            });
          });
        });

        document.addEventListener('click', function (e) {
          if (!e.target.closest('.fs-dropdown')) closeAllEvtDd();
        });
      }

      function closeAllEvtDd(except) {
        qsa('.fs-dropdown', app).forEach(function (dd) {
          if (dd !== except) dd.classList.remove('fs-dd--open');
        });
      }

      /* ── Wire date picker ── */
      function wireEvtDatePicker() {
        var ddDate  = qs('#fs-dd-date', app);
        if (!ddDate) return;
        var trigger = qs('.fs-dd-trigger', ddDate);
        var labelEl = qs('.fs-dd-label', ddDate);
        var calLeft = qs('#fs-dp-cal-left', app);
        var calRight= qs('#fs-dp-cal-right', app);

        var dp = {
          leftMonth:  new Date(),
          rightMonth: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
          selecting:  'start',
          hoverDate:  null,
          tempStart:  null,
          tempEnd:    null,
        };
        dp.leftMonth.setDate(1);
        dp.leftMonth.setHours(0, 0, 0, 0);

        trigger.addEventListener('click', function (e) {
          e.stopPropagation();
          closeAllEvtDd(ddDate);
          ddDate.classList.toggle('fs-dd--open');
          if (ddDate.classList.contains('fs-dd--open')) renderCals();
        });

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
          if (preset === 'all')        { dp.tempStart = null; dp.tempEnd = null; }
          else if (preset === 'today') { dp.tempStart = new Date(today); dp.tempEnd = new Date(today); }
          else if (preset === 'this-week') {
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
            dp.tempStart = null; dp.tempEnd = null; dp.selecting = 'start';
          }
          if (dp.tempStart) {
            dp.leftMonth  = new Date(dp.tempStart.getFullYear(), dp.tempStart.getMonth(), 1);
            dp.rightMonth = new Date(dp.leftMonth.getFullYear(), dp.leftMonth.getMonth() + 1, 1);
          }
        }

        function renderCals() {
          renderCal(calLeft,  dp.leftMonth);
          renderCal(calRight, dp.rightMonth);
        }

        function renderCal(el, monthDate) {
          var year      = monthDate.getFullYear();
          var month     = monthDate.getMonth();
          var monthName = monthDate.toLocaleString('en-US', { month: 'long' });
          var firstDay  = new Date(year, month, 1).getDay();
          var offset    = (firstDay + 6) % 7;
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

          for (var p2 = offset - 1; p2 >= 0; p2--) {
            html += '<span class="fs-dp-cell fs-dp-cell--disabled">' + (prevDays - p2) + '</span>';
          }
          for (var d2 = 1; d2 <= daysInMonth; d2++) {
            var cellDate = new Date(year, month, d2);
            cellDate.setHours(0, 0, 0, 0);
            var ts  = cellDate.getTime();
            var cls = 'fs-dp-cell';
            if (dp.tempStart && dp.tempEnd) {
              var s2 = dp.tempStart.getTime(), e2 = dp.tempEnd.getTime();
              if (ts === s2 && ts === e2) cls += ' fs-dp-cell--single';
              else if (ts === s2)         cls += ' fs-dp-cell--start';
              else if (ts === e2)         cls += ' fs-dp-cell--end';
              else if (ts > s2 && ts < e2) cls += ' fs-dp-cell--range';
            } else if (dp.tempStart && !dp.tempEnd) {
              if (ts === dp.tempStart.getTime()) cls += ' fs-dp-cell--single';
              else if (dp.hoverDate && ts > dp.tempStart.getTime() && ts <= dp.hoverDate.getTime()) cls += ' fs-dp-cell--range';
            }
            html += '<span class="' + cls + '" data-ts="' + ts + '">' + d2 + '</span>';
          }

          var total    = offset + daysInMonth;
          var overflow = total % 7 === 0 ? 0 : 7 - (total % 7);
          for (var n2 = 1; n2 <= overflow; n2++) {
            html += '<span class="fs-dp-cell fs-dp-cell--disabled">' + n2 + '</span>';
          }
          html += '</div>';
          el.innerHTML = html;

          qsa('.fs-dp-nav', el).forEach(function (nav) {
            nav.addEventListener('click', function () {
              var isLeft = el.id === 'fs-dp-cal-left';
              if (nav.dataset.dir === 'prev') {
                if (isLeft) { dp.leftMonth = new Date(dp.leftMonth.getFullYear(), dp.leftMonth.getMonth() - 1, 1); dp.rightMonth = new Date(dp.leftMonth.getFullYear(), dp.leftMonth.getMonth() + 1, 1); }
                else        { dp.rightMonth = new Date(dp.rightMonth.getFullYear(), dp.rightMonth.getMonth() - 1, 1); }
              } else {
                if (isLeft) { dp.leftMonth = new Date(dp.leftMonth.getFullYear(), dp.leftMonth.getMonth() + 1, 1); dp.rightMonth = new Date(dp.leftMonth.getFullYear(), dp.leftMonth.getMonth() + 1, 1); }
                else        { dp.rightMonth = new Date(dp.rightMonth.getFullYear(), dp.rightMonth.getMonth() + 1, 1); }
              }
              renderCals();
            });
          });

          qsa('.fs-dp-cell:not(.fs-dp-cell--disabled)', el).forEach(function (cell) {
            cell.addEventListener('click', function () {
              var clicked = new Date(Number(cell.dataset.ts));
              qsa('.fs-dp-preset', app).forEach(function (b) { b.classList.remove('fs-dp-preset--active'); });
              var customBtn = qs('[data-preset="custom"]', app);
              if (customBtn) customBtn.classList.add('fs-dp-preset--active');
              if (dp.selecting === 'start' || !dp.tempStart) {
                dp.tempStart = clicked; dp.tempEnd = null; dp.selecting = 'end';
              } else {
                if (clicked < dp.tempStart) { dp.tempEnd = dp.tempStart; dp.tempStart = clicked; }
                else                        { dp.tempEnd = clicked; }
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

        var hourStartEl = qs('#fs-hour-start', app);
        var hourEndEl   = qs('#fs-hour-end', app);
        if (hourStartEl) hourStartEl.addEventListener('change', function () { state.hourStart = parseInt(this.value, 10); });
        if (hourEndEl)   hourEndEl.addEventListener('change',   function () { state.hourEnd   = parseInt(this.value, 10); });

        var applyBtn  = qs('#fs-dp-apply', app);
        var cancelBtn = qs('#fs-dp-cancel', app);
        if (applyBtn) {
          applyBtn.addEventListener('click', function () {
            state.dateStart = dp.tempStart;
            state.dateEnd   = dp.tempEnd || dp.tempStart;
            if (!state.dateStart) {
              labelEl.textContent = 'All dates';
            } else if (state.dateStart && state.dateEnd && state.dateStart.getTime() === state.dateEnd.getTime()) {
              labelEl.textContent = fmtDate(state.dateStart);
            } else {
              labelEl.textContent = fmtDate(state.dateStart) + ' \u2013 ' + fmtDate(state.dateEnd);
            }
            ddDate.classList.remove('fs-dd--open');
            renderEvtCards();
          });
        }
        if (cancelBtn) {
          cancelBtn.addEventListener('click', function () { ddDate.classList.remove('fs-dd--open'); });
        }
        document.addEventListener('click', function (e) {
          if (!e.target.closest('#fs-dd-date')) ddDate.classList.remove('fs-dd--open');
        });
      }

      /* ── Wire reset ── */
      function wireEvtReset() {
        var btn = qs('#fs-reset', app);
        if (!btn) return;
        btn.addEventListener('click', function () {
          state.search    = '';
          state.location  = null;
          state.category  = null;
          state.tag       = null;
          state.dateStart = null;
          state.dateEnd   = null;
          state.hourStart = 0;
          state.hourEnd   = 23;

          var searchEl = qs('.fs-evt-search', app);
          if (searchEl) searchEl.value = '';

          qsa('.fs-dd-label', app).forEach(function (el) {
            var dd = el.closest('.fs-dropdown');
            if (dd) {
              var defOpt = qs('.fs-dd-option--all', dd);
              if (defOpt) el.textContent = defOpt.textContent;
            }
          });
          qsa('.fs-dd-option', app).forEach(function (o) { o.classList.remove('fs-dd-option--active'); });
          qsa('.fs-dp-preset', app).forEach(function (b) { b.classList.remove('fs-dp-preset--active'); });
          var allPreset = qs('[data-preset="all"]', app);
          if (allPreset) allPreset.classList.add('fs-dp-preset--active');
          var hs = qs('#fs-hour-start', app);
          var he = qs('#fs-hour-end', app);
          if (hs) hs.value = '0';
          if (he) he.value = '23';
          renderEvtCards();
        });
      }
    }).catch(function () {
      if (nativeList) nativeList.style.removeProperty('display');
    });
  }

}());
