# WealthLens PWA — Setup & Deploy

Turns your existing Streamlit app into an installable "app icon" on Android
and iOS home screens, without rewriting WealthLens itself.

## How it works

Streamlit apps can't become a proper PWA directly — Streamlit renders your
app inside its own internal iframe, so a service worker injected into the
page can't register at the right scope (this is a known, documented
Streamlit limitation, not something specific to WealthLens).

The working pattern: a tiny **separate** static site (these 5 files) that:
1. Has the real install manifest + service worker (so browsers offer "Add to
   Home Screen" / "Install app")
2. Displays a branded splash screen, then embeds your live Streamlit app
   (`wealthlensos.streamlit.app`) fullscreen in an iframe

The user installs *this* wrapper. Once installed, tapping the icon opens a
standalone, browser-chrome-free window showing your actual WealthLens app,
live, same data, same login — nothing about the Streamlit app itself changes.

## Files

| File | Purpose |
|---|---|
| `index.html` | The shell page — splash screen + iframe embed |
| `manifest.json` | App name, icon, colors — what Android/Chrome use to install |
| `service-worker.js` | Minimal worker, required for install eligibility |
| `icons/icon-192.png`, `icons/icon-512.png` | **Placeholder icons — replace these** |

## Before you deploy: swap the icons

I generated placeholder icons (purple→teal gradient with a bar-chart glyph)
since I don't have your actual `WLens_Logo.png` file. For a polished result:

1. Export your real WealthLens logo as two square PNGs: `192x192` and
   `512x512` pixels
2. Replace `icons/icon-192.png` and `icons/icon-512.png` with them (same
   filenames)
3. Keep some padding around the logo — Android's "maskable icon" spec crops
   into a circle/rounded-square, so anything near the edges can get clipped

## Deploy to GitHub Pages (free, ~5 minutes)

1. In your `web-whelthlens` GitHub repo (or a new small repo — either
   works, it doesn't need to live with the Streamlit code), create a folder
   called `pwa/` and put these 5 files in it (keep the `icons/` subfolder)
2. Repo → **Settings → Pages**
3. **Source**: Deploy from a branch → Branch: `main` → Folder: `/pwa` (or
   `/root` if you made a dedicated repo and put the files at the top level)
4. Save. GitHub gives you a URL like:
   `https://ankitnimbhorkar5.github.io/web-whelthlens/`
   (or `.../pwa/` if deployed from a subfolder)
5. Wait ~1 minute for it to go live, then open that URL on your phone

## Installing it

**Android (Chrome):** Open the GitHub Pages URL → Chrome shows an "Install
app" banner automatically, or tap ⋮ menu → **Add to Home screen** /
**Install app**.

**iPhone (Safari — must be Safari, not Chrome, for this step):** Open the
URL → tap the **Share** icon → **Add to Home Screen**.

Either way, you get a real WealthLens icon on the home screen. Tapping it
opens fullscreen, no address bar, no browser tabs — feels like a native app.

## Sharing it with your group

Once deployed, send the GitHub Pages link to Ashwin, Gaurav, Sumit, and
Narendra with the install steps above. Each person installs it once; after
that they just tap the icon like any other app. Login/plan/data are exactly
as they are today — this wrapper doesn't touch WealthLens's auth or data at
all, it's purely a launcher.

## Known limitations of this approach

- **Still needs internet** — it's your live Streamlit app in an iframe, not
  offline data. No connection means the iframe won't load (the wrapper will
  show a "open in browser instead" link after 6 seconds if that happens).
- **Not on the Play Store / App Store** — this is a home-screen shortcut,
  not a store listing. If you want App Store presence specifically, that's
  a much bigger project (see below).
- **iOS is a little rougher than Android** — Apple's install/offline support
  for PWAs is thinner than Chrome's, though the "Add to Home Screen" +
  standalone launch itself works fine on iOS 16.4+.
- **Streamlit Cloud free tier still sleeps** — your existing `keep_alive.py`
  already addresses this; unrelated to the PWA wrapper.

## If you outgrow this later

Your own audit doc already flagged this exact tradeoff: a true native app
(React Native, on the Play Store / App Store) is a multi-week rebuild —
it needs a real backend API extracted from your Streamlit business logic
(database.py/analytics.py), a separate mobile UI, and app store review.
This PWA wrapper is the fast, low-risk version of "installable app" that
uses everything you've already built. Worth doing the native rewrite only
once WealthLens has enough active users that Play Store discoverability
and offline support actually matter.
