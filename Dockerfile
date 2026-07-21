FROM node:18-alpine

WORKDIR /app

# Copy backend files
COPY backend/package*.json ./
RUN npm install

COPY backend/prisma ./prisma/
RUN npx prisma generate

COPY backend/src ./src/
COPY backend/railway.toml ./

EXPOSE 3001

CMD ["npm", "start"]
