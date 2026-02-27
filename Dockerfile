# ─── Stage 1: Build ────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies first (cache layer)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ─── Stage 2: Serve with Nginx ─────────────────────────
FROM nginx:1.27-alpine

# Remove default nginx config and welcome page
RUN rm /etc/nginx/conf.d/default.conf /usr/share/nginx/html/*

# Copy nginx template (uses $PORT for Render compatibility)
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Copy built assets from builder stage
COPY --from=builder /app/dist/ /usr/share/nginx/html/

# Default port — Render overrides this via $PORT env var
ENV PORT=80
EXPOSE 80

# Use envsubst to inject $PORT into nginx config, then start
CMD sh -c "envsubst '\$PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
