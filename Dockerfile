# Stage 1: Build backend and install Docker
FROM node:14-alpine as builder
WORKDIR /ssa-backend
RUN apk add --no-cache docker
RUN apk add --no-cache docker-compose

# Install Python dependencies
RUN apk add --no-cache python3 python3-dev musl-dev gcc libffi-dev openssl-dev cargo \
    && pip install --no-cache-dir pip \
    && rm -rf /var/cache/apk/*

# Copy and install Python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Stage 2: Run backend
FROM python:3.8-slim
WORKDIR /ssa-backend
COPY --from=builder /code /ssa-backend 
EXPOSE 5000
CMD ["python", "app.py"]

# Build frontend
FROM node:14-alpine as frontend-builder
WORKDIR /ssa-frontend
COPY /ssa-frontend/package.json /ssa-frontend/package-lock.json ./
RUN npm install
COPY /ssa-frontend/public /ssa-frontend/public
COPY /ssa-frontend/src /ssa-frontend/src
COPY /ssa-frontend/webpack.config.js /ssa-frontend/webpack.config.js
COPY . .
RUN npm run build

# Run frontend
FROM node:14-alpine
COPY --from=frontend-builder /ssa-frontend/dist /ssa-frontend
EXPOSE 3000
CMD ["npm", "run", "start:prod"]