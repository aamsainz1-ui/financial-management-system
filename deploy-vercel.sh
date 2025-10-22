#!/bin/bash

echo "🚀 Deploying to Vercel..."

# 1. Install Vercel CLI if not installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# 2. Login to Vercel
echo "🔐 Please login to Vercel..."
vercel login

# 3. Build the application
echo "🔨 Building the application..."
npm run build

# 4. Deploy to production
echo "🌐 Deploying to production..."
vercel --prod

# 5. Setup custom domain (if needed)
echo "🌍 Setting up custom domain..."
echo "Please add your domain in Vercel dashboard:"
echo "1. Go to project settings"
echo "2. Click 'Domains'"
echo "3. Add your domain"
echo "4. Update DNS records as shown"

echo "✅ Deployment completed!"
echo "🎉 Your app is now live!"