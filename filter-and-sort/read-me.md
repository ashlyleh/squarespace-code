# filter-sort.js

Unified blog filter, sort, archive enhancement, and events filter for Squarespace 7.1 (Fluid Engine).

One script handles both blog and events pages. It auto-detects which context it's on and runs the right logic. Each behavior is controlled by a config object you drop on the page — no touching the source file per site.

---

## What it does

**Blog pages**
- Fetches all posts from Squarespace's JSON API and builds the entire filter bar dynamically — one empty Code Block is all you add to the page
- Filter by category, tag, author, and year via multiselect dropdowns (click to highlight, click again to deselect, no checkboxes)
- Search by post title
- Sort by newest, oldest, A–Z, Z–A
- Five layout renderers matching Squarespace's native blog layouts: basic grid, masonry, single column, side-by-side, and alternating side-by-side
- Optional editorial newsroom style: large hero first card with image overlay
- Infinite scroll with a "Load more" button trigger
- Adds a "See All" link to the archive block, with the blog root URL auto-detected from existing archive links

**Events pages**
- Fetches upcoming and past events from the JSON API
- Upcoming / Past toggle
- Search by event title, location, or category
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

## What is a Code Block?

A Code Block is an element you add directly to a Squarespace page in the editor, the same way you'd add an image or a text section. It lets you paste raw HTML into the page layout itself — separate from the code injection boxes above.

To add one: open the page editor → click the **+** button to add a new block → search for **Code** → paste your HTML inside it.

---

## Installation

### Step 1 — Verify the CDN link works

Before touching Squarespace, open this URL in your browser and confirm you see JavaScript code (not a 404 error):

```
https://cdn.jsdelivr.net/gh/ashlyleh/squarespace-code@main/filter-and-sort/filter-sort.js
```

If it loads, you're good. If not, check that the file path in your GitHub repo matches exactly — casing matters.

> **Cache busting:** jsDelivr caches files aggressively. If you push an update to GitHub and the site isn't picking it up, change `@main` to the full commit hash from GitHub, e.g. `@ab57fe3`. This forces the CDN to fetch the latest version.

---

### Step 2 — Add the CSS (site-wide, one time per site)

1. In Squarespace, go to **Design → Custom CSS**
2. Paste the entire contents of `filter-sort.css` at the bottom of whatever CSS is already there
3. Hit **Save**

The CSS file opens with a block of custom properties (CSS variables). These are the values you'll adjust per site — things like accent colour, border radius, and font. By default they inherit from your Squarespace site palette, so on a well-configured site you may not need to change anything.

If you do want to override values for a specific site, copy just the `:root { }` block into that site's CSS editor and change the values there:

```css
:root {
  --fs-accent:        #your-color;
  --fs-accent-text:   #ffffff;
  --fs-border:        #e5e5e5;
  --fs-radius:        4px;
  --fs-radius-pill:   999px;
  --fs-text:          #111111;
  --fs-text-muted:    #111111;
  --fs-bg:            #ffffff;
  --fs-shadow:        0 8px 24px rgba(0, 0, 0, 0.08);
  --fs-font:          var(--paragraph);
  --fs-font-size:     var(--paragraph-2);
  --fs-card-img-h:    260px;   /* image height for grid/column layouts */
  --fs-card-side-w:   320px;   /* image width for side-by-side layouts */
}
```

By default these inherit from your Squarespace site styles (`--primary-accent`, `--paragraph`, etc.), so on a well-configured site you may not need to override anything.

---

### Step 3 — Blog page setup

#### 3a. Add the placeholder Code Block

The blog filter builds everything dynamically — you only need to give it one empty container on the page.

In the Squarespace page editor, add a **Code Block** wherever you want the filter bar and posts to appear, and paste:

```html
<div id="blog-filter-app"></div>
```

The script will insert the filter bar and the post grid into this div automatically. You don't need any other Code Blocks for the blog.

> If your blog page already has a native Squarespace blog block on it, the script does **not** hide it automatically. Move or remove the native blog block so it doesn't appear alongside the custom layout.

#### 3b. Choose your layout

Set `blogLayout` in the config to one of these values:

| Value | Layout description |
|-------|--------------------|
| `'basic-grid'` | Uniform grid — fixed image height, equal columns |
| `'masonry'` | Variable image heights — images display at their natural aspect ratio |
| `'single-column'` | Stacked, centered, single-column list |
| `'side-by-side'` | Image on the left, text on the right, all cards the same |
| `'alternating'` | Image alternates left/right on every other card |

You can also set `blogNewsroom: true` to make the first card a large full-bleed hero with an overlay title — works with any layout.

#### 3c. Add the page-level code injection

1. In Squarespace, go to **Pages**
2. Hover over your blog page and click the **gear icon ⚙️**
3. Click **Advanced**
4. In the **Page Header Code Injection** box, paste the following — editing the values to match your site:

```html
<script>
window.filterSortConfig = {
  /* ── Required ───────────────────────────────────── */
  blogMountId:  'blog-filter-app',   /* must match your Code Block ID  */
  blogUrl:      '/blog',             /* your blog page URL             */

  /* ── Layout ─────────────────────────────────────── */
  /* Options: 'basic-grid' | 'masonry' | 'single-column' | 'side-by-side' | 'alternating' */
  blogLayout:   'basic-grid',
  blogNewsroom: false,               /* true = large hero first card   */

  /* ── Filters (set false to hide any of these) ───── */
  blogShowSearch:   true,
  blogShowCategory: true,
  blogShowTag:      true,
  blogShowAuthor:   true,
  blogShowYear:     true,
  blogShowSort:     true,

  /* ── Labels ──────────────────────────────────────── */
  blogLabelCategory: 'Categories',
  blogLabelTag:      'Tags',
  blogLabelAuthor:   'Authors',
  blogLabelYear:     'Date',
  blogResetLabel:    'Reset',
  blogReadMore:      'Read more',
  blogLoadMore:      'Load more',
  blogNoResults:     'No posts match your filters.',

  /* ── Archive "See All" link ──────────────────────── */
  archiveAllLabel:  '‹ See All',
  archivePosition:  'bottom',        /* 'top' or 'bottom'              */
};
</script>

<script src="https://cdn.jsdelivr.net/gh/ashlyleh/squarespace-code@main/filter-and-sort/filter-sort.js"></script>
```

5. Click **Save**

> The first `<script>` block is your config — it tells the script how this particular page is set up. The second `<script>` loads the actual script from GitHub via CDN. The config must always come first.

---

### Step 4 — Events page setup

#### 4a. Add the placeholder Code Block

The events filter replaces Squarespace's native event list with a custom layout. You need to give it a container to mount into.

In the Squarespace editor on your events page, add a **Code Block above the native events block** and paste:

```html
<div id="evt-filter-app"></div>
```

That's it for the page layout — the script builds everything else automatically from your event data, and hides the native events list.

#### 4b. Add the page-level code injection

1. Go to **Pages**
2. Hover over your events page and click the **gear icon ⚙️**
3. Click **Advanced**
4. In the **Page Header Code Injection** box, paste:

```html
<script>
window.filterSortConfig = {
  /* ── Required ───────────────────────────────────── */
  eventsContainerId: 'evt-filter-app',

  /* ── Filters (set false to hide any of these) ───── */
  eventsShowSearch: true,    /* searches title, location, and category */
  showLocation:     true,
  showDate:         true,
  showCategory:     true,
  showTag:          true,
  showEventCount:   true,
  showReset:        true,

  /* ── Labels ──────────────────────────────────────── */
  upcomingLabel:   'Upcoming',
  pastLabel:       'Past',
  eventCountLabel: 'events',
  resetLabel:      'Reset',
  noResultsTitle:  'No events match these filters.',
  noResultsSub:    'Try adjusting your filters.',
  viewEventLabel:  'View Event',

  /* ── Date/time format ───────────────────────────── */
  use24Hour: false,          /* true for 24-hour clock in date picker  */
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
| Blog placeholder Code Block (`<div id="blog-filter-app">`) | On the blog page in the editor, where you want the filter and posts to appear |
| Events placeholder Code Block (`<div id="evt-filter-app">`) | On the events page in the editor, above the native events block |
| Blog script + config | Pages → Blog page ⚙️ → Advanced → Page Header Code Injection |
| Events script + config | Pages → Events page ⚙️ → Advanced → Page Header Code Injection |

---

## Config reference

All options are optional unless marked required. The script uses the defaults listed if you omit any key.

### Blog options

| Key | Default | Description |
|-----|---------|-------------|
| `blogMountId` ⚠️ | `'blog-filter-app'` | ID of your placeholder Code Block — must match exactly |
| `blogUrl` ⚠️ | current page path | Path to your blog page, e.g. `'/articles'` |
| `blogLayout` | `'basic-grid'` | Layout style — see options above |
| `blogNewsroom` | `false` | `true` to make the first card a large hero with overlay |
| `blogBatchSize` | `30` | Posts to show per "Load more" click |
| `blogShowSearch` | `true` | Show/hide the search input |
| `blogShowCategory` | `true` | Show/hide the categories dropdown |
| `blogShowTag` | `true` | Show/hide the tags dropdown |
| `blogShowAuthor` | `true` | Show/hide the authors dropdown |
| `blogShowYear` | `true` | Show/hide the date/year dropdown |
| `blogShowSort` | `true` | Show/hide the sort selector |
| `blogLabelCategory` | `'Categories'` | Dropdown label |
| `blogLabelTag` | `'Tags'` | Dropdown label |
| `blogLabelAuthor` | `'Authors'` | Dropdown label |
| `blogLabelYear` | `'Date'` | Dropdown label |
| `blogResetLabel` | `'Reset'` | Reset button label |
| `blogReadMore` | `'Read more'` | Card CTA text |
| `blogLoadMore` | `'Load more'` | Load more button text |
| `blogNoResults` | `'No posts match your filters.'` | Empty state message |

### Archive options

| Key | Default | Description |
|-----|---------|-------------|
| `archiveAllLabel` | `'‹ See All'` | Link text for the "all posts" archive item |
| `archivePosition` | `'bottom'` | `'top'` or `'bottom'` — where the link appears in the archive list |

### Events options

| Key | Default | Description |
|-----|---------|-------------|
| `eventsContainerId` ⚠️ | `'evt-filter-app'` | ID of your placeholder Code Block — must match exactly |
| `eventsShowSearch` | `true` | Show/hide the search input (searches title, location, category) |
| `showLocation` | `true` | Show/hide location filter dropdown |
| `showDate` | `true` | Show/hide date range picker |
| `showCategory` | `true` | Show/hide category filter dropdown |
| `showTag` | `true` | Show/hide tag filter dropdown |
| `showEventCount` | `true` | Show/hide event count |
| `showReset` | `true` | Show/hide reset button |
| `upcomingLabel` | `'Upcoming'` | Toggle button label |
| `pastLabel` | `'Past'` | Toggle button label |
| `eventCountLabel` | `'events'` | Suffix after the event count, e.g. "6 events" |
| `resetLabel` | `'Reset'` | Reset button label |
| `noResultsTitle` | `'No events match these filters.'` | Empty state heading |
| `noResultsSub` | `'Try adjusting your filters.'` | Empty state subtext |
| `viewEventLabel` | `'View Event'` | Card CTA link text |
| `use24Hour` | `false` | Use 24-hour format in the hour selectors |

⚠️ = These values must match the `id` you put on your Code Block exactly. If they don't match, the script won't find the container and nothing will render.

---

## How filtering works

**Blog filters use OR logic across all active selections.** If you select "Leadership" and "Mindset" from categories, posts matching either will show. If you also select a tag, posts matching that tag will also show — even if they don't match any selected category. Selecting more filters gives you more results, not fewer.

**Reset** clears all active selections and disables itself until a filter is applied again.

**Events filters** are single-select per dropdown — picking a location, for example, shows only events at that location. The date range filter works independently and stacks with the other dropdowns.

---

## Notes

- The archive "See All" link auto-detects the blog root URL from existing archive links on the page. If the archive block is empty (no months or categories listed yet), the link defaults to `/`.
- The location filter dropdown is hidden automatically if only one location exists across all events.
- On mobile, the date picker renders as a bottom sheet with a single calendar. The right-hand calendar is hidden, and preset buttons scroll horizontally.
- Blog cards strip HTML from excerpts before rendering, so Squarespace's rich text editor markup won't appear as raw tags.
- The masonry layout uses CSS `column-count` — images display at their natural aspect ratio, which may cause posts to appear slightly out of chronological order visually.
