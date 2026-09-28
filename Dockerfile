# ==========================================
# Etapa 1: Compilación (Node.js)
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Argumentos de entorno para Vite/Quasar
ARG VITE_API_BASE=https://api.sispo.unitepc.pro/api
ARG VITE_SISPO_BACK_URL=https://api.sispo.unitepc.pro
ARG VITE_SSO_FRONT_URL=https://sigeth.unitepc.pro
ARG VITE_SIGVA_FRONT_URL=https://sigva.unitepc.pro
ARG VITE_SHARED_ASSET_URL=https://api.sigeth.unitepc.pro

ENV VITE_API_BASE=$VITE_API_BASE \
    VITE_SISPO_BACK_URL=$VITE_SISPO_BACK_URL \
    VITE_SSO_FRONT_URL=$VITE_SSO_FRONT_URL \
    VITE_SIGVA_FRONT_URL=$VITE_SIGVA_FRONT_URL \
    VITE_SHARED_ASSET_URL=$VITE_SHARED_ASSET_URL

# Copiar manifiesto de dependencias
COPY package*.json ./

# Instalar dependencias sin ejecutar scripts de postinstall antes de tiempo
RUN npm ci --ignore-scripts || npm install --ignore-scripts

# Copiar código fuente
COPY . .

# Sobrescribir .env.production con las variables de Docker
RUN rm -f .env.production .env.production.local && \
    printf "VITE_API_BASE=%s\nVITE_SISPO_BACK_URL=%s\nVITE_SSO_FRONT_URL=%s\nVITE_SIGVA_FRONT_URL=%s\nVITE_SHARED_ASSET_URL=%s\n" \
    "$VITE_API_BASE" "$VITE_SISPO_BACK_URL" "$VITE_SSO_FRONT_URL" "$VITE_SIGVA_FRONT_URL" "$VITE_SHARED_ASSET_URL" > .env.production

# Preparar y compilar proyecto Quasar SPA
RUN npx quasar prepare || true
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
