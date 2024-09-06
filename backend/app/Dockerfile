FROM node:22-alpine
WORKDIR /home/42c-bank/backend/app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]