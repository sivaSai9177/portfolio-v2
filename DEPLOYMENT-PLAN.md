# Portfolio Deployment Plan

**Author:** Sirigiri Siva Sai
**Date:** February 22, 2026
**Goal:** Dockerize the portfolio and deploy to Render (free tier) with a production-grade Nginx setup

---

## What You Have

A static portfolio built with raw HTML, CSS, and JavaScript — two pages (`index.html` and `showcase.html`), custom stylesheets, JS with Three.js and GSAP animations, and project screenshots. Total size is roughly 35MB, mostly from image assets.

---

## Architecture Overview

```
┌─────────────────────────────────────────┐
│              Render (Free Tier)          │
│  ┌───────────────────────────────────┐  │
│  │         Docker Container          │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │    Nginx (Alpine Linux)     │  │  │
│  │  │                             │  │  │
│  │  │  • Gzip compression         │  │  │
│  │  │  • Browser caching headers  │  │  │
│  │  │  • Security headers         │  │  │
│  │  │  • SPA-friendly fallbacks   │  │  │
│  │  └─────────────────────────────┘  │  │
│  │              ↓ serves             │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │   /usr/share/nginx/html     │  │  │
│  │  │                             │  │  │
│  │  │  index.html, showcase.html  │  │  │
│  │  │  css/, js/, assets/         │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
│                                         │
│  URL: https://sivasai.onrender.com      │
│  HTTPS: ✅ Auto-provisioned by Render   │
└─────────────────────────────────────────┘
```

---

## Files to Create

### 1. `Dockerfile`
Uses a lightweight Nginx Alpine image (~25MB). Copies your site files and applies a custom Nginx config with gzip, caching, and security headers.

### 2. `nginx.conf`
Production-grade Nginx configuration:
- **Gzip** on all text assets (HTML, CSS, JS, SVG, JSON) — reduces transfer size by ~70%
- **Cache headers** — images/fonts cached 30 days, CSS/JS cached 7 days, HTML never cached
- **Security headers** — X-Content-Type-Options, X-Frame-Options, Referrer-Policy, CSP
- **Clean URLs** — proper fallback for direct page access

### 3. `docker-compose.yml`
For local development and testing before pushing to Render.

### 4. `.dockerignore`
Excludes `.DS_Store`, `.git`, and unnecessary files from the Docker build.

### 5. `render.yaml` (optional)
Infrastructure-as-code file so Render auto-configures your service on connect.

---

## Deployment Steps

### Step 1: Push to GitHub
Create a GitHub repository and push your portfolio code (with the new Docker files).

```
git init
git add .
git commit -m "Initial portfolio with Docker setup"
git remote add origin https://github.com/sivaSai9177/portfolio-v2.git
git push -u origin main
```

### Step 2: Connect to Render
1. Go to [render.com](https://render.com) and sign in with GitHub
2. Click **New → Web Service**
3. Select your portfolio repository
4. Render auto-detects the Dockerfile — no extra config needed
5. Choose **Free** tier
6. Click **Deploy**

### Step 3: Share Your Site
Your portfolio will be live at something like `https://portfolio-v2-xxxx.onrender.com`. You can customize this subdomain in Render's dashboard settings.

---

## What You Get

| Feature | Status |
|---|---|
| Docker containerized | ✅ |
| Nginx with gzip compression | ✅ |
| Browser caching (images 30d, assets 7d) | ✅ |
| Security headers (XSS, clickjacking, MIME) | ✅ |
| Free HTTPS (auto SSL by Render) | ✅ |
| Auto-deploy on git push | ✅ |
| Free subdomain | ✅ |
| Shareable URL for friends & resume | ✅ |
| Custom domain support (when ready) | ✅ (just add DNS) |

---

## Sharing on Resume

Add to your resume contact section:
```
Portfolio: https://sivasai.onrender.com
```

Or in your LinkedIn profile under "Website" — recruiters will see a professional, fast-loading portfolio with HTTPS.

---

## Cost

**$0/month** on Render's free tier. The only trade-off is a ~30-second cold start if nobody visits for 15 minutes — barely noticeable for a static Nginx site.
