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
| `filter-sort.js` | The script — served via jsDelivr CDN from this repo |
| `filter-sort.css` | All styles — paste into the Squarespace CSS editor |

---

## Before you start — what is code injection?

Squarespace has a feature called **Code Injection** that lets you add custom code to your site without editing template files. Think of it as a special text box where you paste snippets that Squarespace runs on top of your normal site.

There are two levels:

**Site-wide injection** — code that runs on every page of the site.
Go to: `Settings → Advanced → Code Injection`

You'll see two boxes:
- **Header** — code that loads before the page content
- **Footer** — code that loads after the page content

**Page-level injection** — code that runs only on one specific page.
Go to: `Pages → [click the page] → the gear icon ⚙️ → Advanced`

You'll see the same Header and Footer boxes, but scoped to just that page.

> **Which one should I use?**
> The CSS goes site-wide. The script config goes on the individual page it's used on — this keeps things from conflicting if you use different settings per site section.

---

## Installation

### Step 1 — Verify the CDN link works

Before touching Squarespace, open this URL in your browser and confirm you see JavaScript code (not a 404 error):

```
https://cdn.jsdelivr.net/gh/ashlyleh/squarespace-code@main/filter-and-sort/filter-sort.js
```

If it loads, you're good. If not, check that the file path in your GitHub repo matches exactly.

> **Cache busting:** jsDelivr caches files aggressively. If you push an update to GitHub and the site isn't picking it up, add a version number to the URL — e.g. `@main` → `@v1.1` — or use the full commit hash from GitHub.

---

### Step 2 — Add the CSS (site-wide, one time per site)

1. In Squarespace, go to **Design → Custom CSS**
2. Paste the entire contents of `filter-sort.css` at the bottom of whatever CSS is already there
3. Hit **Save**

The CSS file opens with a block of custom properties (CSS variables). These are the values you'll adjust per site — things like accent colour, border radius, and font. By default they inherit from your Squarespace site palette, so on a well-configured site you may not need to change anything.

If you do want to override values for a specific site, copy just the `:root { }` block into that site's CSS editor and change the values there:

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

---

### Step 3 — Blog page setup

#### 3a. Add the layout elements

Your blog page needs two **Code Blocks** placed directly on the page — these are the containers the script will fill in. Add them in the Squarespace editor wherever you want the controls to appear (typically above the blog grid).

**Code Block 1 — Filter buttons:**

In the Squarespace editor, add a Code Block and paste:
```html
<div id="filter-buttons-1"></div>
```

**Code Block 2 — Sort dropdown:**

Add a second Code Block and paste:
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

Remove any sort options you don't want by deleting their `<div class="dropdown-option">` lines.

#### 3b. Add the page-level code injection

1. In Squarespace, go to **Pages**
2. Hover over your blog page and click the **gear icon ⚙️**
3. Click **Advanced**
4. In the **Page Header Code Injection** box, paste the following:

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

<script src="https://cdn.jsdelivr.net/gh/ashlyleh/squarespace-code@main/filter-and-sort/filter-sort.js"></script>
```

5. Click **Save**

> The first `<script>` block is your config — it tells the script how this particular page is set up. The second `<script>` loads the actual script from GitHub via CDN. The config must always come first.

---

### Step 4 — Events page setup

#### 4a. Add the placeholder element

The events filter replaces Squarespace's native event list with a custom layout. You need to give it a container to mount into.

In the Squarespace editor on your events page, add a **Code Block above the events block** and paste:

```html
<div id="evt-filter-app"></div>
```

That's it for the page layout — the script builds everything else automatically from your event data.

#### 4b. Add the page-level code injection

1. Go to **Pages**
2. Hover over your events page and click the **gear icon ⚙️**
3. Click **Advanced**
4. In the **Page Header Code Injection** box, paste:

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

  /* Set any of these to false to hide that filter on this page */
  showLocation:      true,
  showDate:          true,
  showCategory:      true,
  showTag:           true,
  showEventCount:    true,
  showReset:         true,

  use24Hour:         false,   /* true for 24-hour clock in the date picker */
};
</script>

<script src="https://cdn.jsdelivr.net/gh/ashlyleh/squarespace-code@main/filter-and-sort/filter-sort.js"></script>
```

5. Click **Save**

---

## Quick reference — where does each piece go?

| What | Where in Squarespace |
|------|----------------------|
| `filter-sort.css` | Design → Custom CSS |
| Filter buttons Code Block | Directly on the blog page, in the editor |
| Sort dropdown Code Block | Directly on the blog page, in the editor |
| Events placeholder Code Block | Directly on the events page, in the editor |
| Blog script + config | Pages → Blog page ⚙️ → Advanced → Page Header Code Injection |
| Events script + config | Pages → Events page ⚙️ → Advanced → Page Header Code Injection |

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
| `archivePosition` | `'bottom'` | `'top'` or `'bottom'` — where the link appears in the archive list |

### Events options

| Key | Default | Description |
|-----|---------|-------------|
| `eventsContainerId` | `'evt-filter-app'` | ID of the placeholder Code Block |
| `upcomingLabel` | `'Upcoming'` | Toggle button label |
| `pastLabel` | `'Past'` | Toggle button label |
| `eventCountLabel` | `'events'` | Suffix after the event count (e.g. "6 events") |
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

## Notes

- The archive "See All" link auto-detects the blog root URL from existing archive links on the page. If the archive block is empty, the link defaults to `/`.
- The location filter dropdown is hidden automatically if only one location exists across all events.
- On mobile, the date picker renders as a bottom sheet with a single calendar. The right-hand calendar is hidden.
- The script guards against double-initialization with a `data-initialized` flag on the filter container, so it is safe to load site-wide.
