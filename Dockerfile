# ==========================================
# Etapa 1: Compilación (Node.js)
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Argumentos de entorno para Vite/Quasar
ARG VITE_SISPO_BACK_URL
ARG VITE_SSO_FRONT_URL
ARG VITE_SIGVA_FRONT_URL
ARG VITE_SHARED_ASSET_URL

ENV VITE_SISPO_BACK_URL=$VITE_SISPO_BACK_URL \
    VITE_SSO_FRONT_URL=$VITE_SSO_FRONT_URL \
    VITE_SIGVA_FRONT_URL=$VITE_SIGVA_FRONT_URL \
    VITE_SHARED_ASSET_URL=$VITE_SHARED_ASSET_URL

# Copiar manifiesto de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci || npm install

# Copiar código fuente
COPY . .

# Compilar proyecto Quasar SPA
RUN npm run build

# ==========================================
# Etapa 2: Servidor Web de Producción (Nginx)
# ==========================================
FROM nginx:alpine

# Copiar configuración Nginx
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copiar build generado en la etapa anterior (Quasar genera dist/spa)
COPY --from=builder /app/dist/spa /usr/share/nginx/html

EXPOSE 9001

CMD ["nginx", "-g", "daemon off;"]
