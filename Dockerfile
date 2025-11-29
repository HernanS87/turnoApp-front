# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Build producción
RUN npm run build

# Stage 2: Runtime con Nginx
FROM nginx:1.25-alpine
WORKDIR /usr/share/nginx/html

# Remover archivos default de nginx
RUN rm -rf ./*

# Copiar build desde stage anterior
COPY --from=builder /app/dist .

# Copiar configuración nginx personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 80
EXPOSE 80

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"]
