# Dockerfile

# Use Node.js image for building
FROM node:18-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build


# Serve the static files with a lightweight web server
FROM nginx:stable-alpine AS production

COPY --from=builder /app/build /usr/share/nginx/html

# Optional: overwrite default nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
