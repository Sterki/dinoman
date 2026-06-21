# ── Stage: base ──────────────────────────────────────────────────────────────
FROM node:22-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

# ── Stage: dev ───────────────────────────────────────────────────────────────
# El código fuente se monta como volumen por docker-compose.yml.
# npm install corre al inicio para asegurarse de que node_modules exista
# incluso cuando el volumen del host oculta los de la imagen.
FROM base AS dev
EXPOSE 5173
CMD ["sh", "-c", "npm install && npm run dev"]

# ── Stage: build ─────────────────────────────────────────────────────────────
FROM base AS build
COPY . .
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

# ── Stage: prod ──────────────────────────────────────────────────────────────
# Solo contiene el bundle compilado — imagen ligera sin Node
FROM nginx:1.27-alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
