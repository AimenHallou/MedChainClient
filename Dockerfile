FROM node:18.12-alpine as build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Build the app
RUN npm run build

# Expose the port Vite preview will run on
EXPOSE 5000

# Command to run Vite preview
CMD ["npm", "run", "preview", "--", "--host", "--port", "5000"]