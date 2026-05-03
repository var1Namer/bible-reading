# Bible Reading App

A PWA (Progressive Web App) for your Bible reading sessions.
Works on Android and desktop. Fully offline after first load.

## Setup (5 minutes)

### 1. Put the files on GitHub Pages

1. Go to github.com → New repository → name it `bible-reading` → Public → Create
2. Upload all files in this folder to the repo
3. Go to Settings → Pages → Source: `main` branch, `/ (root)` → Save
4. Your app URL will be: `https://YOUR_USERNAME.github.io/bible-reading/`

### 2. Install on Android

1. Open the URL in Chrome
2. Tap the three-dot menu → "Add to Home Screen"
3. Done — it opens like a normal app, works offline

### 3. Install on laptop (Chrome)

1. Open the URL in Chrome
2. Click the install icon in the address bar (looks like a screen with a down arrow)
3. Done — it gets its own window

---

## File structure

```
index.html    — app shell (just loads everything)
style.css     — all styles
db.js         — storage layer (IndexedDB)
app.js        — all logic (Utils, Template, Router, HomeView, SessionView)
sw.js         — service worker (caches files for offline)
manifest.json — makes it installable as a PWA
icon-192.png  — app icon
icon-512.png  — app icon (large)
```

## Updating the app

After editing any file:
1. Commit and push to GitHub
2. Bump `CACHE_NAME` in `sw.js` (e.g., `brw-v1` → `brw-v2`) so users get the update

## Adding features

- New views → add to `Router.go()` and create a new `XxxView` object in `app.js`
- New data → add fields to the session object in `Template.sections()` and `db.js` schema
- New storage needs → only touch `db.js`
- Style changes → only touch `style.css`
