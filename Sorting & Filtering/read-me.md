# filter-sort.js

Unified blog filter, sort, archive enhancement, and events filter for Squarespace 7.1 (Fluid Engine).

One script handles both blog and events pages. It auto-detects which context it's on and runs the right logic. Each behavior is controlled by a config object you drop on the page — no touching the source file per site.

---

## What it does

**Blog pages**
- Fetches post categories from Squarespace's JSON API and builds filter buttons dynamically
- Supports sort by newest, oldest, A–Z, Z–A
- Auto-selects a filter from the URL (`?filter=category-name`)
- Adds a "See All" link to the archive block, with the blog root URL auto-detected from existing archive links

**Events pages**
- Fetches upcoming and past events from the JSON API
- Upcoming / Past toggle
- Filter dropdowns for location, date range, category, and tag
- Date range picker with two calendars, preset shortcuts, and hour-of-day selectors
- Event count display
- Custom card layout replacing the native Squarespace event list
- Each filter is independently toggleable per page via config

---

## Files

| File | Purpose |
|------|---------|
| `filter-sort.js` | The script — push this to GitHub, serve via jsDelivr |
| `filter-sort.css` | All styles — paste into the Squarespace CSS editor |
| `filter-sort-embed.html` | Per-page embed snippets with config |

---

## Installation

### 1. Push the script to GitHub

Add `filter-sort.js` to your repository root (or a subfolder). The jsDelivr URL follows this pattern:

```
https://cdn.jsdelivr.net/gh/YOUR-USERNAME/YOUR-REPO@main/filter-sort.js
```

> **Cache busting:** jsDelivr caches aggressively. After each push, either append a version tag (`@v1.1`) or use a full commit hash to force an update.

---

### 2. Add the CSS

Paste the contents of `filter-sort.css` into **Design → Custom CSS** in Squarespace.

The file opens with a per-site override block:

```css
:root {
  --fs-accent:       var(--primary-accent);
  --fs-radius:       4px;
  --fs-font:         var(--paragraph);
  /* etc. */
}
```

Copy just this block into each site's CSS editor and adjust the values. Do not edit the defaults in the source file — override them here so the base stays portable.

---

### 3. Blog page setup

#### Required layout elements

Your blog page needs two Code Blocks placed where you want the controls to appear.

**Filter buttons Code Block:**
```html
<div id="filter-buttons-1"></div>
```

**Sort dropdown Code Block:**
```html
<div id="sort-dropdown-1" class="custom-dropdown">
  <div class="dropdown-trigger">
    <span class="dropdown-label">Sort by</span>
    <span class="dropdown-icon material-symbols-outlined">keyboard_arrow_down</span>
  </div>
  <div class="dropdown-options">
    <div class="dropdown-option" data-sort="newest">Newest first</div>
    <div class="dropdown-option" data-sort="oldest">Oldest first</div>
    <div class="dropdown-option" data-sort="az">A – Z</div>
    <div class="dropdown-option" data-sort="za">Z – A</div>
  </div>
</div>
```

Remove any sort options you do not want by deleting their `<div class="dropdown-option">` lines.

#### Page config + script embed

Paste this into **Pages → [Blog Page] → Advanced → Page Header Code Injection:**

```html
<script>
window.filterSortConfig = {
  blogGridSelector:  '.blog-basic-grid',   /* or '.blog-alternating-side-by-side' */
  blogItemSelector:  '.blog-item',
  filterContainerId: 'filter-buttons-1',
  sortDropdownId:    'sort-dropdown-1',
  allPostsLabel:     'All Posts',

  archiveAllLabel:   '‹ See All',
  archivePosition:   'bottom',             /* 'top' or 'bottom' */
};
</script>

<script src="https://cdn.jsdelivr.net/gh/ashlyleh/squarespace-code@main/filter-sort.js"></script>
```

---

### 4. Events page setup

#### Required layout element

Add a Code Block **above** your Squarespace events block on the events page:

```html
<div id="evt-filter-app"></div>
```

The script inserts the filter bar and card list into this div and hides the native `.eventlist`.

#### Page config + script embed

Paste this into the events page header code injection:

```html
<script>
window.filterSortConfig = {
  eventsContainerId: 'evt-filter-app',
  upcomingLabel:     'Upcoming',
  pastLabel:         'Past',
  eventCountLabel:   'events',
  resetLabel:        'Reset',
  noResultsTitle:    'No events match these filters.',
  noResultsSub:      'Try adjusting your filters.',
  viewEventLabel:    'View Event',

  /* Set any of these to false to hide that filter */
  showLocation:      true,
  showDate:          true,
  showCategory:      true,
  showTag:           true,
  showEventCount:    true,
  showReset:         true,

  use24Hour:         false,   /* true for 24-hour clock in date picker */
};
</script>

<script src="https://cdn.jsdelivr.net/gh/ashlyleh/squarespace-code@main/filter-sort.js"></script>
```

---

## Config reference

All options are optional. The script uses sensible defaults if you omit any.

### Blog options

| Key | Default | Description |
|-----|---------|-------------|
| `blogGridSelector` | `'.blog-basic-grid, .blog-alternating-side-by-side'` | CSS selector for the blog grid container |
| `blogItemSelector` | `'.blog-item'` | CSS selector for individual post items |
| `filterContainerId` | `'filter-buttons-1'` | ID of the filter buttons Code Block |
| `sortDropdownId` | `'sort-dropdown-1'` | ID of the sort dropdown Code Block |
| `allPostsLabel` | `'All Posts'` | Label for the reset filter button |

### Archive options

| Key | Default | Description |
|-----|---------|-------------|
| `archiveAllLabel` | `'‹ See All'` | Link text for the "all posts" archive item |
| `archivePosition` | `'bottom'` | `'top'` or `'bottom'` — where the link is inserted in the archive list |

### Events options

| Key | Default | Description |
|-----|---------|-------------|
| `eventsContainerId` | `'evt-filter-app'` | ID of the placeholder Code Block |
| `upcomingLabel` | `'Upcoming'` | Toggle button label |
| `pastLabel` | `'Past'` | Toggle button label |
| `eventCountLabel` | `'events'` | Suffix on the event count (e.g. "6 events") |
| `resetLabel` | `'Reset'` | Reset button label |
| `noResultsTitle` | `'No events match these filters.'` | Empty state heading |
| `noResultsSub` | `'Try adjusting your filters.'` | Empty state subtext |
| `viewEventLabel` | `'View Event'` | Card CTA link text |
| `showLocation` | `true` | Show/hide location filter dropdown |
| `showDate` | `true` | Show/hide date range picker |
| `showCategory` | `true` | Show/hide category filter dropdown |
| `showTag` | `true` | Show/hide tag filter dropdown |
| `showEventCount` | `true` | Show/hide event count |
| `showReset` | `true` | Show/hide reset button |
| `use24Hour` | `false` | Use 24-hour format in the hour selectors |

---

## Per-site CSS overrides

The CSS uses custom properties scoped under a clearly marked override block. On each site, copy only these properties into the CSS editor and change their values:

```css
:root {
  --fs-accent:       #your-color;
  --fs-accent-text:  #ffffff;
  --fs-border:       #e5e5e5;
  --fs-radius:       4px;
  --fs-radius-pill:  999px;
  --fs-text:         #111111;
  --fs-text-muted:   #111111;
  --fs-bg:           #ffffff;
  --fs-shadow:       0 8px 24px rgba(0, 0, 0, 0.08);
  --fs-font:         var(--paragraph);
  --fs-font-size:    var(--paragraph-2);
}
```

By default these inherit from your Squarespace site styles (`--primary-accent`, `--paragraph`, etc.), so on a well-configured site you may not need to override anything.

---

## Notes

- The archive "See All" link auto-detects the blog root URL from existing archive links on the page. If the archive block is empty (no months or categories listed yet), the link will default to `/`.
- The location filter dropdown is hidden automatically if only one location exists across all events.
- On mobile, the date picker renders as a bottom sheet with a single calendar. The right-hand calendar is hidden.
- The script guards against double-initialization with a `data-initialized` flag on the filter container, so it is safe to load site-wide.
