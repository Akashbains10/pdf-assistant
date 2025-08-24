FROM node:22.18.0

# Set working dir
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install
RUN npm install -g nodemon  # install nodemon globally


# Copy source code
COPY . .

# Expose app port
EXPOSE 3000

# Run app
CMD ["nodemon", "--legacy-watch", "index.js"]
