FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npx prisma generate
EXPOSE 5000
CMD ["sh", "-c", "npx prisma migrate deploy && npm run dev"]