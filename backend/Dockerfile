# Use Node 20 base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json & package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend code
COPY . .

# Expose port
EXPOSE 3001

# Start server
CMD ["node", "server.js"]
