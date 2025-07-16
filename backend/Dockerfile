# Use Node 18 base image with full OS packages (not Alpine)
FROM node:18

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Expose API port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
