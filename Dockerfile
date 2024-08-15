FROM node:22-alpine
WORKDIR /home/42c-bank
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]