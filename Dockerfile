FROM node:21-alpine
WORKDIR /home/42c-bank
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]