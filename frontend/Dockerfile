 # Node version-ah 20-ku mathiyachu
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Intha step ippo error illama run aagum
RUN npx expo export --platform web

FROM nginx:alpine
# Expo build aana files-ah copy panrom
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]