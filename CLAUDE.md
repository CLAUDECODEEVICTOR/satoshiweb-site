# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static single-page website for **satoshi.dev**, a web development agency based in Civitavecchia, Italy. The site is entirely in Italian.

- **Live URL:** https://satoshidev.site/
- **Vercel project:** satoshidev-site

## Deployment

No build step. The site is a single `index.html` with inline CSS and JS, deployed to Vercel.

```bash
# Deploy to production
cd "/Users/dbnmillionaire/satoshi dev agency" && vercel --prod --yes
```

## Architecture

Everything lives in `index.html`:
- **CSS** is in a `<style>` block in `<head>` (CSS custom properties in `:root` for theming)
- **JS** is in a `<script>` block before `</body>` (scroll effects, IntersectionObserver reveal animations, Formspree form handler)

Key design tokens (`:root` variables):
- `--bg: #0a0a0a`, `--card: #111111`, `--accent: #F5A623`
- Fonts: `Instrument Serif` (headings), `DM Sans` (body), `JetBrains Mono` (mono/labels)

## External Services

- **Formspree** (`https://formspree.io/f/mqedwdeo`) — contact form submissions
- **Google Fonts** — DM Sans, Instrument Serif, JetBrains Mono

## Assets

- `logo/satoshidev-removebg-preview.ico` — main logo/favicon
- `logo/satoshidev.ico` — alternate logo

## SEO

The page includes Open Graph tags, Twitter Card meta, and Schema.org JSON-LD (`LocalBusiness` type). The canonical URL is `https://satoshidev.site/`.
