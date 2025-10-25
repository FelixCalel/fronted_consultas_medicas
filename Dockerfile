# Dockerfile para frontend Vite/React
FROM node:20-bullseye-slim AS build
WORKDIR /app
COPY package*.json ./
# Asegúrate de NO tener NODE_ENV=production aquí para instalar devDependencies
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine AS production
# Si quieres definir NODE_ENV=production, hazlo aquí, después del build
# ENV NODE_ENV=production
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
