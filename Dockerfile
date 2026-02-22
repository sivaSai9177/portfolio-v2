FROM nginx:1.27-alpine

# Remove default nginx config and welcome page
RUN rm /etc/nginx/conf.d/default.conf /usr/share/nginx/html/*

# Copy nginx template (uses $PORT for Render compatibility)
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Copy site files
COPY index.html showcase.html /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/
COPY assets/ /usr/share/nginx/html/assets/

# Default port — Render overrides this via $PORT env var
ENV PORT=80
EXPOSE 80

# Use envsubst to inject $PORT into nginx config, then start
CMD sh -c "envsubst '\$PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"
