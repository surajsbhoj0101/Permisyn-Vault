FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npx prisma generate
EXPOSE 5000
CMD ["sh", "-c", "attempt=1; max=20; until npx prisma migrate deploy; do if [ \"$attempt\" -ge \"$max\" ]; then echo 'Database did not become ready for migrations in time.'; exit 1; fi; echo \"Waiting for database... ($attempt/$max)\"; attempt=$((attempt+1)); sleep 3; done; npm run dev"]