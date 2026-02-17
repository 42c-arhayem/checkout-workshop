FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Expose GraphQL ports
EXPOSE 4000 4443

# Start the server
CMD ["npm", "start"]
