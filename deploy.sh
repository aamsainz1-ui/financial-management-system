#!/bin/bash

# Deployment Script for Production

echo "🚀 Starting deployment process..."

# 1. Build the application
echo "📦 Building the application..."
npm run build

# 2. Generate Prisma client
echo "🗄️ Generating Prisma client..."
npx prisma generate

# 3. Run database migrations
echo "🔄 Running database migrations..."
npx prisma migrate deploy

# 4. Build Docker image
echo "🐳 Building Docker image..."
docker build -t customer-counter-app .

# 5. Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# 6. Start new containers
echo "▶️ Starting new containers..."
docker-compose up -d

# 7. Wait for application to start
echo "⏳ Waiting for application to start..."
sleep 10

# 8. Check if application is running
echo "🔍 Checking application status..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Application is running successfully!"
    echo "🌐 Your app is available at: http://localhost:3000"
else
    echo "❌ Application failed to start. Check logs with: docker-compose logs"
fi

echo "🎉 Deployment completed!"