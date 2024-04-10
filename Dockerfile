FROM node:21-alpine
WORKDIR /api
COPY . .
RUN npm install
CMD ["npm", "start"]
EXPOSE 3000