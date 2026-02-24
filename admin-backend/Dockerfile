FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# Create upload directories
RUN mkdir -p /app/data/uploads/hero /app/data/uploads/team /app/data/uploads/trabajos

EXPOSE 3000

CMD ["node", "server.js"]
