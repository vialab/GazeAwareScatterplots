# Serves the static project website (website/) with nginx.
# The unprivileged image runs as UID 101 and listens on 8080.
FROM nginxinc/nginx-unprivileged:1.27-alpine

COPY --chown=101:101 website/ /usr/share/nginx/html/

EXPOSE 8080
