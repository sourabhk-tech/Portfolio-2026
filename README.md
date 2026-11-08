# Sourabh Kumbhar — Portfolio 2026

**Status:** Vercel-ready — contact backend included; add email environment variables before launch.  
**Folder:** `C:\Users\Sourabh\OneDrive\Desktop\Portfolio-2026`  
**Stack:** HTML5 · CSS3 · vanilla JavaScript · one Vercel serverless function · no build step

A responsive, accessible portfolio for a data analyst and MCA student. The design is intentionally editorial and border-driven — oversized type, a gold accent, real project screenshots, and no generic template styling.

---

## Pages

| Page | File |
|---|---|
| Home | `index.html` |
| About | `about.html` |
| Projects | `projects.html` |
| Ultraceutics case study | `projects/ultraceutics.html` |
| Gym Management case study | `projects/gym-management.html` |
| Resume | `resume.html` |
| Contact | `contact.html` |
| 404 | `404.html` |

Navigation: **Home · About · Projects · Resume · Contact**

---

## Features

- Light/dark theme toggle with `localStorage` persistence
- Accessible side menu with focus trap, Escape close, and focus return
- Scroll reveals, page-entrance animations, count-up stats, hover lifts, and image zooms — all disabled for `prefers-reduced-motion`
- Transparent portrait cutout with a WebP-first image and a PNG fallback
- Images are locked against dragging
- Silent, home-only intro/preloader with a reduced-motion fallback; no autoplay audio or button sounds
- Contact form posts to `/api/contact` with validation, loading/success/error states, a honeypot, and a direct-email fallback
- Vercel serverless function delivers via Resend and/or an optional storage webhook
- Self-hosted Outfit and Anton WOFF2 fonts
- Unique titles, descriptions, Open Graph/Twitter metadata, and Person JSON-LD
- Print-friendly resume layout
- Security headers and a one-week asset cache via `vercel.json`

---

## Local preview

```bash
cd "C:\Users\Sourabh\OneDrive\Desktop\Portfolio-2026"
python -m http.server 8123
```

Open <http://127.0.0.1:8123/>. Use the local server for the intended self-hosted fonts; some browsers block local font files when a page is opened directly with `file://`.

The static preview does not run `api/contact.js`. To test the form locally, use `vercel dev` with the variables from `.env.example` in `.env.local`.

---

## Project structure

```text
Portfolio-2026/
├── index.html
├── about.html
├── projects.html
├── resume.html
├── contact.html
├── 404.html
├── robots.txt
├── vercel.json
├── .env.example
├── .gitignore
├── DEPLOY.md
├── README.md
├── api/
│   └── contact.js
├── projects/
│   ├── ultraceutics.html
│   └── gym-management.html
└── assets/
    ├── css/
    │   ├── tokens.css
    │   ├── base.css
    │   ├── layout.css
    │   ├── components.css
    │   ├── pages.css
    │   └── inner.css
    ├── js/
    │   ├── theme-init.js
    │   ├── theme.js
    │   ├── menu.js
    │   ├── reveal.js
    │   ├── parallax.js
    │   ├── main.js
    │   └── contact.js
    ├── img/
    │   ├── sourabh-kumbhar.jpg
    │   ├── sourabh-kumbhar-cutout.webp
    │   ├── sourabh-kumbhar-cutout.png
    │   ├── ultraceutics-cover.jpg
    │   ├── ultraceutics-cover-640.jpg
    │   ├── ultraceutics-mobile.jpg
    │   ├── gym-management-cover.svg
    │   ├── og-cover.jpg
    │   └── favicon.svg
    ├── docs/
    │   ├── Sourabh-Kumbhar-Resume.pdf
    │   └── Deloitte-Data-Analytics-Certificate.pdf
    └── fonts/
        ├── outfit-latin.woff2
        └── anton-latin.woff2
```

---

## Verified

- Axe accessibility scan: **0 violations** across all pages, light/dark, desktop/mobile
- No horizontal overflow at 1440 / 1024 / 390
- No failed images after scrolling
- Menu open/close, focus trap, Escape, and focus return work
- Theme persists across visits
- Contact form rejects invalid email, accepts valid values, and shows loading/success/error states
- Contact endpoint validates input, blocks the honeypot, rate-limits repeats, and returns a direct-email fallback when unconfigured
- Hero portrait cutout loads as WebP with a PNG fallback; all images report `draggable="false"`
- Page-entrance animations, count-up stats, hover lifts, and image zooms respect `prefers-reduced-motion`
- Silent, home-only intro/preloader with a reduced-motion fallback; no `<audio>`/`<video>` elements or Web Audio code
- All local links and assets resolve

---

## Launch checklist

- [ ] Choose the production domain and host — see `DEPLOY.md`
- [ ] Add `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, and `CONTACT_FROM_EMAIL` in Vercel (and optionally `CONTACT_WEBHOOK_URL`)
- [ ] Send a real test message from the deployed site and confirm it arrives
- [ ] Replace the relative canonical and OG image paths with absolute URLs
- [ ] Add `og:url` and generate `sitemap.xml` with the final domain
- [ ] Add work experience/internships, two more projects, and preferred title when available
- [ ] Re-run the audit after content additions

Relative canonical and OG image paths are already in place and resolve correctly on any host. Absolute URLs are preferred for social crawlers after the domain is confirmed.

---

## Content notes

- Confirmed details: Sourabh Kumbhar · Data Analyst / MCA Student · “Turning raw data into clear decisions”
- Email: `sourabhkumbhar7047@gmail.com`
- LinkedIn: `https://www.linkedin.com/in/sourabh-kumbhar-3b2104368`
- GitHub: `https://github.com/sourabhk-tech`
- Education: MCA — D Y Patil University, Ambi, Pune; BCA — Vivekanand College, Kolhapur
- Ultraceutics India: `https://ultraceutics-mvp.vercel.app/`
- Gym Management System: `https://github.com/sourabhk-tech/GymManagementSystem`
- Certification: Deloitte Data Analytics Job Simulation — Forage, October 2025

The gym dashboard cover is explicitly labelled as a concept, not a screenshot of the live app.

---

## Design tokens

| Token | Light | Dark |
|---|---|---|
| Background | `#FFFFFF` | `#000000` |
| Ink | `#000000` | `#FFFFFF` |
| Muted | `#515151` | `#C4C4C4` |
| Border | `#E5E5E5` | `#303030` |
| Surface | `#F3F3F3` | `#242424` |
| Accent | `#FBBA42` | `#FBBA42` |

Display: **Anton** · Body: **Outfit** · Flat, border-driven visual language · Gold used sparingly.
