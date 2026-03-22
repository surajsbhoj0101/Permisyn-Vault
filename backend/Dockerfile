# syntax=docker/dockerfile:1.7

FROM node:20
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund
COPY . .
EXPOSE 5000
CMD ["npm", "start"]