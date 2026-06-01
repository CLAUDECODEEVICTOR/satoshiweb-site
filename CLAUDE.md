# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static single-page website for **Satoshi Web**, a web development agency based in Civitavecchia, Italy, building websites and AI tools for local businesses. The site is entirely in Italian.

- **Live URL:** https://satoshiweb.it/
- **GitHub repo:** https://github.com/CLAUDECODEEVICTOR/satoshiweb-site
- **Hosting:** Vercel

## Deployment

No build step. The site is a single `index.html` with inline CSS and JS, deployed to Vercel.

```bash
# Deploy to production (from the project root)
cd "/Users/edoardo/Desktop/PROGETTI CLAUDE/satoshiweb-site" && vercel --prod --yes
```

> Note: this machine is not yet linked to the Vercel project. The first `vercel` run will prompt to link the local folder to the existing Vercel project before deploying.

## Architecture

Everything lives in `index.html`:
- **CSS** is in a `<style>` block in `<head>` (CSS custom properties in `:root` for theming)
- **JS** is in a `<script>` block before `</body>` (scroll effects, IntersectionObserver reveal animations, Formspree form handler)

Key design tokens (`:root` variables):
- `--bg: #0a0a0a`, `--card: #111111`, `--accent: #F5A623`
- Fonts: `Clash Display` (headings/serif slot), `Satoshi` (body/sans), system monospace (`ui-monospace, 'SF Mono', 'Fira Code'`)

## External Services

- **Fontshare** (`https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&f[]=clash-display@500,600,700&display=swap`) — web fonts (Satoshi + Clash Display)
- **Formspree** (`https://formspree.io/f/mqedwdeo`) — contact form submissions

## Assets

- `logo/satoshidev-removebg-preview.ico` — favicon (used for `icon` + `shortcut icon`)
- `logo/satoshidev.ico` — alternate logo
- `logo/logo2-removebg-preview.png`, `logo/logo2.webp` — additional logo variants
- `og-image.png` — Open Graph / social share image (referenced as `https://satoshiweb.it/og-image.png`)

## Additional pages / files

- `preventivo-template.html` — quote (preventivo) template
- `preview-colori.html`, `preview-mockup.html`, `preview-pricing.html` — design preview/mockup pages
- `robots.txt`, `sitemap.xml` — SEO crawler files

## SEO

The page includes Open Graph tags, Twitter Card meta, and Schema.org JSON-LD (`ProfessionalService` type, with `Service` / `OfferCatalog` / `Offer` and `PostalAddress` blocks). The canonical URL is `https://satoshiweb.it/`.
