FROM node:20-slim

WORKDIR /app

# Install dependencies first
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Build arguments for environment variables
ENV BACKEND_URL=${BACKEND_URL}

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 80

# Make sure we have access to the built files
RUN chmod -R 777 .next

# Command to run the application
CMD ["npm", "start"] 