#!/bin/bash

# 🚀 Deploy to avenuep.org Server
echo "🌐 Deploying Customer Counter to avenuep.org (118.139.179.219)"
echo "=================================================================="

DOMAIN="avenuep.org"
IP="118.139.179.219"

echo "📋 Deployment Configuration:"
echo "Domain: $DOMAIN"
echo "IP: $IP"
echo ""

# Check if we're on the production server
CURRENT_IP=$(curl -s ifconfig.me 2>/dev/null || echo "unknown")
echo "Current IP: $CURRENT_IP"

if [ "$CURRENT_IP" = "$IP" ]; then
    echo "✅ Running on production server!"
    echo ""
    
    # Stop existing processes
    echo "🛑 Stopping existing processes..."
    pkill -f "next" 2>/dev/null || true
    pkill -f "node" 2>/dev/null || true
    
    # Copy production environment
    echo "📝 Setting up production environment..."
    cp .env.production .env.local
    
    # Generate Prisma client
    echo "🗄️ Generating Prisma client..."
    npx prisma generate
    
    # Run database migrations
    echo "🔄 Running database migrations..."
    npx prisma migrate deploy
    
    # Start production server
    echo "🚀 Starting production server..."
    NODE_ENV=production npm run start:prod > server.log 2>&1 &
    
    # Wait for startup
    echo "⏳ Waiting for server to start..."
    sleep 10
    
    # Check if server is running
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        echo "✅ Server started successfully!"
        echo "🌐 Local URL: http://localhost:3000"
        echo "🌐 Public URL: http://$DOMAIN"
    else
        echo "❌ Server failed to start. Check server.log"
        tail -20 server.log
    fi
    
else
    echo "⚠️  Not on production server (IP: $IP)"
    echo ""
    echo "📋 To deploy to production server:"
    echo ""
    echo "1️⃣  SSH into your server:"
    echo "   ssh root@$IP"
    echo ""
    echo "2️⃣  Clone or upload the project:"
    echo "   git clone <your-repo> /var/www/avenuep.org"
    echo "   cd /var/www/avenuep.org"
    echo ""
    echo "3️⃣  Run this script:"
    echo "   chmod +x deploy-to-server.sh"
    echo "   ./deploy-to-server.sh"
    echo ""
    echo "4️⃣  Setup Nginx reverse proxy:"
    echo "   sudo cp nginx-avenuep.conf /etc/nginx/sites-available/avenuep.org"
    echo "   sudo ln -s /etc/nginx/sites-available/avenuep.org /etc/nginx/sites-enabled/"
    echo "   sudo nginx -t && sudo systemctl restart nginx"
    echo ""
    echo "5️⃣  Install SSL certificate:"
    echo "   sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
    echo ""
    echo "📧 Alternative: Use Vercel for easier deployment"
    echo "   vercel --prod"
fi

echo ""
echo "🎉 Deployment process completed!"
echo ""
echo "📋 Next Steps:"
echo "1. Test: http://$DOMAIN"
echo "2. Test: https://$DOMAIN (after SSL)"
echo "3. Check all functionality"
echo "4. Setup monitoring and backups"