# Back to Top Button

A scroll-triggered back-to-top button for Squarespace 7.1 (Fluid Engine). Configured entirely via CSS custom properties — no JS edits needed per site.

---

## Files

| File | Purpose |
|---|---|
| `back-to-top.js` | Injects the button, handles scroll visibility, loads the correct Material Symbols font |
| `aos-init.js` | Loads and initializes AOS (Animate On Scroll) — optional, separate from the button |
| `back-to-top.css` | Base styles. Goes in the Squarespace CSS editor |

---

## How It Works

`back-to-top.js` injects two things into the DOM: a `#top` anchor at the top of `<body>`, and a `#back-to-top` button at the bottom. Once injected, it reads configuration from CSS custom properties set on `#back-to-top`, so Squarespace's cascade applies before the JS reads anything.

The button starts hidden (`opacity: 0`, `pointer-events: none`) and gains a `.show` class once the page scrolls past 300px. It detects the actual scrolling container rather than assuming `window` — necessary because Squarespace sometimes uses a wrapper element as the scroll root.

---

## Installation

### 1. Squarespace CSS Editor

Paste `back-to-top.css` into **Design → Custom CSS**.

### 2. Footer Code Injection

Go to **Settings → Advanced → Code Injection → Footer** and add:

```html
<!------------ 🔼 Return to Top Button ------------>
<script src="https://cdn.jsdelivr.net/gh/ashlyleh/squarespace-code@main/back-to-top.js"></script>
```

If the site uses AOS animations, add this too:

```html
<!------------ 🎞 AOS Animations ------------>
<script src="https://cdn.jsdelivr.net/gh/ashlyleh/squarespace-code@main/aos-init.js"></script>
```

### 3. Header Code Injection (not required)

The script loads the Material Symbols font dynamically based on `--btt-icon-variant`. You do not need to load it manually in the header. If you already have a Material Symbols `<link>` in the header for other components, that's fine — the script checks before loading a duplicate.

---

## Default Config

These live in `:root` in the CSS file and apply to every site unless overridden.

```css
:root {
  --btt-aria-label: "Back to top";
  --btt-icon: "arrow_upward";
  --btt-icon-variant: "outlined";  /* outlined | rounded | sharp */
  --btt-label: "Back to top";
  --btt-position: right;           /* left | center | right */
  --btt-show-label: 0;             /* 0 = icon only, 1 = icon + label */
}
```

Override any of these per site by targeting `#back-to-top` in the site's CSS.

---

## Per-Site Override Examples

### Icon Only (default)

No overrides needed. The button renders as a circle with `arrow_upward` at the bottom-right.

---

### Icon + Text Label

```css
#back-to-top {
  --btt-show-label: 1;
  --btt-label: "Back to top";
  --btt-aria-label: "Back to top";
}
```

The button reshapes from a circle to a pill automatically via `:has(.btt-label)` — no extra class needed. Adjust `--btt-label` to change the visible text, and `--btt-aria-label` to match.

---

### Left Aligned

```css
#back-to-top {
  --btt-position: left;
}
```

---

### Center Aligned

```css
#back-to-top {
  --btt-position: center;
}
```

---

### Right Aligned (default)

```css
#back-to-top {
  --btt-position: right;
}
```

---

### Swap Icon

Any Material Symbol name works. Find names at [fonts.google.com/icons](https://fonts.google.com/icons).

```css
#back-to-top {
  --btt-icon: "keyboard_arrow_up";
}
```

---

### Swap Icon Variant

```css
#back-to-top {
  --btt-icon-variant: "rounded"; /* outlined | rounded | sharp */
}
```

The script loads the correct Google Fonts stylesheet for whichever variant you set. Only one font file loads per page.

---

### Combined Example

Icon + text, left-aligned, rounded variant, custom label:

```css
#back-to-top {
  --btt-aria-label: "Return to top";
  --btt-icon: "arrow_upward";
  --btt-icon-variant: "rounded";
  --btt-label: "Return to top";
  --btt-position: left;
  --btt-show-label: 1;
}
```

---

## AOS Configuration

By default, `aos-init.js` initializes AOS with:

```js
{ duration: 800, once: true }
```

To override per site, set `window.AOSConfig` in **Code Injection → Header** before the script loads:

```html
<script>
  window.AOSConfig = {
    duration: 600,
    once: false
  };
</script>
```

Any valid [AOS option](https://github.com/michalsnik/aos#options) works here.

---

## CDN & Cache Notes

Scripts are served via jsDelivr from the `main` branch:

```
https://cdn.jsdelivr.net/gh/ashlyleh/squarespace-code@main/back-to-top.js
https://cdn.jsdelivr.net/gh/ashlyleh/squarespace-code@main/aos-init.js
```

jsDelivr caches aggressively. After pushing changes to GitHub, force a cache bust by appending a commit hash to the URL during testing:

```
https://cdn.jsdelivr.net/gh/ashlyleh/squarespace-code@{commit-hash}/back-to-top.js
```

Switch back to `@main` once confirmed working.

---

## Scroll Container Detection

The script walks a priority list of known Squarespace scroll containers before falling back to `window`:

1. `#canvas`
2. `.Site`
3. `[data-controller="HashManager"]`
4. `document.documentElement`
5. `document.body`
6. `window` (fallback — logs a console warning)

If the button isn't appearing on scroll on a specific site, open the console and check for the warning. If it fires, the scroll root on that site is something outside this list — inspect the DOM and note it here for a future update.
