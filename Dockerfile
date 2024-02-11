FROM node:18.12-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install -qy

COPY . .

RUN npm run build

EXPOSE 3000
EXPOSE 443

CMD [ "npm", "run", "preview" , "--", "--host"]