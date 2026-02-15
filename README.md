# Brainitor — Stealth Homepage

Static single-page landing site for [brainitor.com](https://brainitor.com). Plain HTML, CSS, and vanilla JS — no frameworks, no build tools.

## Quick Start

1. Push this repo to GitHub
2. Go to **Settings > Pages**
3. Select **Source: Deploy from a branch**, branch: `main`, folder: `/ (root)`
4. Your site will be live at `https://<username>.github.io/<repo-name>/`

## Custom Domain Setup

1. Purchase your domain (brainitor.com or brainitor.ai)
2. Add **A records** pointing to GitHub's IPs:
   ```
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```
3. Add a **CNAME record**: `www` → `<username>.github.io`
4. In the repo, edit the `CNAME` file and add your domain (e.g. `brainitor.com`)
5. Go to **Settings > Pages > Custom domain**, enter your domain
6. Check **Enforce HTTPS**

## Formspree Setup (Waitlist Form)

1. Create a free account at [formspree.io](https://formspree.io)
2. Create a new form
3. Copy your form ID
4. In `index.html`, replace `YOUR_FORM_ID` with your actual form ID (appears in two places — hero and CTA sections)

## Analytics

Add your Google Analytics or Plausible snippet in the `<head>` of `index.html` where the placeholder comment is.

## Favicons

Replace the placeholder files in `assets/`:
- `favicon.ico` — 16x16 and 32x32 ICO
- `favicon-32x32.png` — 32x32 PNG
- `apple-touch-icon.png` — 180x180 PNG
- `og-image.png` — 1200x630 PNG for social sharing

## Structure

```
├── index.html          # Single page, all HTML
├── css/
│   └── styles.css      # All styles
├── js/
│   └── main.js         # Animations, form handling
├── assets/             # Favicons and OG image
├── CNAME               # Custom domain (fill in your domain)
├── robots.txt
├── sitemap.xml
└── README.md
```
