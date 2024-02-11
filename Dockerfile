FROM node:18.12-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install -qy

COPY . .

RUN npm run build

EXPOSE 3000

CMD [ "npm", "run", "preview" ]