FROM node:18-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package.json ./
RUN npm install --only=production

COPY src ./src

EXPOSE 3000

CMD ["node", "src/index.js"]


