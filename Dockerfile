FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the project files
COPY . .

# Expose the port
EXPOSE 5173

# Start the development server without TypeScript checking
CMD ["npm", "run", "dev:no-check", "--", "--host", "0.0.0.0", "--strictPort"]