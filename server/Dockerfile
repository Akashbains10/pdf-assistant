FROM node:22.18.0

# Set working dir
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps
RUN npm install -g nodemon  # install nodemon globally


# Copy source code
COPY . .

# Expose app port
EXPOSE 8000

# Run app
CMD ["nodemon", "--legacy-watch", "index.js"]
