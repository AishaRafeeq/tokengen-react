FROM node:20-alpine AS build


RUN mkdir -p /opt/render/project/src/media
WORKDIR /opt/render/project/src/media


COPY package*.json ./


RUN npm install


COPY . .

RUN npm run build

FROM nginx:alpine


COPY --from=build /app/dist /usr/share/nginx/html


RUN rm /etc/nginx/conf.d/default.conf




EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
