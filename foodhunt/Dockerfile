FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm install
RUN cd backend && npm install

# Copy source code
COPY . .

# Build backend
RUN cd backend && npm run build

# Build frontend
RUN npm run build

# Expose port
EXPOSE 3000
EXPOSE 5002

# Start command
CMD ["npm", "run", "start:production"]
