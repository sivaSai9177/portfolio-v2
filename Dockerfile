# ─── Stage 1: Build + Prerender ────────────────────────
FROM node:20-slim AS builder
WORKDIR /app

# Install Chromium dependencies for Puppeteer prerendering
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    fonts-liberation \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdrm2 \
    libgbm1 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    && rm -rf /var/lib/apt/lists/*

# Tell Puppeteer to use the system Chromium instead of downloading its own
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Install dependencies first (cache layer)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source and build (includes prerendering step)
COPY . .
RUN npm run build

# ─── Stage 2: Serve with Nginx ─────────────────────────
FROM nginx:1.27-alpine

# Remove default nginx config and welcome page
RUN rm /etc/nginx/conf.d/default.conf /usr/share/nginx/html/*

# Copy nginx template (uses $PORT for Render compatibility)
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Copy built + prerendered assets from builder stage
COPY --from=builder /app/dist/ /usr/share/nginx/html/

# Default port — Render overrides this via $PORT env var
ENV PORT=80
EXPOSE 80

# Use envsubst to inject $PORT into nginx config, then start
CMD sh -c "envsubst '\$PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
