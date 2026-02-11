# Use Node.js 20 on Alpine Linux
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install dependencies (only production if possible, but we need devDependencies for build)
RUN npm install

# Bundle app source
COPY . .

# Build TypeScript
RUN npm run build

# Expose the API port
EXPOSE 3001

# Start the server
CMD [ "npm", "start" ]
