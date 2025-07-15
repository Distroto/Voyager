FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy only the files needed for production
COPY package*.json ./

# Install only necessary dependencies
RUN npm ci --omit=dev

# Copy the rest of the app (includes worker + src)
COPY . .

# Set environment variables (optional, or override via docker-compose)
ENV NODE_ENV=production

# Run the BullMQ ML job processor
CMD ["node", "src/jobs/mlWorker.js"]
