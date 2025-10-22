#!/bin/bash

# 🚀 Avenuep.org Deployment Script
echo "🌐 Deploying Customer Counter to avenuep.org"
echo "=============================================="

DOMAIN="avenuep.org"
IP="118.139.179.219"

echo "📋 Deployment Info:"
echo "Domain: $DOMAIN"
echo "IP: $IP"
echo ""

# Check if we're on the right server
CURRENT_IP=$(curl -s ifconfig.me)
echo "Current IP: $CURRENT_IP"

if [ "$CURRENT_IP" != "$IP" ]; then
    echo "⚠️  Warning: Current IP doesn't match target IP"
    echo "This script should be run on server: $IP"
    echo ""
    read -p "Continue anyway? (y/n): " CONTINUE
    if [ "$CONTINUE" != "y" ]; then
        exit 1
    fi
fi

echo ""
echo "🚀 Choose deployment method:"
echo "1) Vercel (Recommended - Free & Easy)"
echo "2) Docker/VPS (Professional)"
echo "3) Traditional Server Setup"
read -p "Enter choice (1-3): " CHOICE

case $CHOICE in
    1)
        echo ""
        echo "🚀 Deploying to Vercel..."
        
        # Install Vercel CLI
        if ! command -v vercel &> /dev/null; then
            echo "📦 Installing Vercel CLI..."
            npm install -g vercel
        fi
        
        # Login to Vercel
        echo "🔐 Please login to Vercel..."
        vercel login
        
        # Build application
        echo "🔨 Building application..."
        npm run build
        
        # Deploy to production
        echo "🌐 Deploying to production..."
        vercel --prod
        
        echo ""
        echo "✅ Vercel deployment complete!"
        echo ""
        echo "🌍 Next Steps for avenuep.org:"
        echo "1. Go to Vercel Dashboard: https://vercel.com/dashboard"
        echo "2. Add domain: avenuep.org"
        echo "3. Update DNS records at your domain registrar:"
        echo "   Type: A, Name: @, Value: 76.76.19.19"
        echo "   Type: CNAME, Name: www, Value: cname.vercel-dns.com"
        echo "4. Wait for SSL certificate (5-10 minutes)"
        echo "5. Test: https://avenuep.org"
        ;;
        
    2)
        echo ""
        echo "🐳 Docker Deployment for avenuep.org..."
        
        # Build Docker image
        echo "🔨 Building Docker image..."
        docker build -t avenuep-customer-counter .
        
        # Stop existing containers
        echo "🛑 Stopping existing containers..."
        docker-compose down
        
        # Start new containers
        echo "▶️ Starting containers..."
        docker-compose up -d
        
        # Wait for startup
        echo "⏳ Waiting for application to start..."
        sleep 10
        
        # Check status
        if curl -f http://localhost:3000 > /dev/null 2>&1; then
            echo "✅ Docker deployment successful!"
        else
            echo "❌ Docker deployment failed. Check logs:"
            docker-compose logs
        fi
        
        echo ""
        echo "🔒 SSL Setup for avenuep.org:"
        echo "1. Install Certbot: sudo apt install certbot python3-certbot-nginx"
        echo "2. Get SSL: sudo certbot --nginx -d avenuep.org -d www.avenuep.org"
        echo "3. Test: https://avenuep.org"
        ;;
        
    3)
        echo ""
        echo "🖥️ Traditional Server Setup for avenuep.org..."
        
        # Install dependencies
        echo "📦 Installing dependencies..."
        sudo apt update
        sudo apt install -y nodejs npm nginx
        
        # Install PM2
        echo "🔧 Installing PM2..."
        sudo npm install -g pm2
        
        # Build application
        echo "🔨 Building application..."
        npm run build
        
        # Start with PM2
        echo "▶️ Starting application with PM2..."
        pm2 stop customer-counter 2>/dev/null || true
        pm2 start npm --name "customer-counter" -- start
        pm2 save
        pm2 startup
        
        # Setup Nginx
        echo "🌐 Setting up Nginx..."
        sudo tee /etc/nginx/sites-available/avenuep.org > /dev/null <<EOF
server {
    listen 80;
    server_name avenuep.org www.avenuep.org;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
        
        # Enable site
        sudo ln -sf /etc/nginx/sites-available/avenuep.org /etc/nginx/sites-enabled/
        sudo nginx -t
        sudo systemctl restart nginx
        
        echo ""
        echo "✅ Traditional setup complete!"
        echo "🔒 SSL Setup:"
        echo "1. sudo certbot --nginx -d avenuep.org -d www.avenuep.org"
        echo "2. Test: https://avenuep.org"
        ;;
        
    *)
        echo "❌ Invalid choice!"
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment process completed!"
echo ""
echo "📋 Important Information:"
echo "Domain: avenuep.org"
echo "IP: 118.139.179.219"
echo "Deployment Date: $(date)"
echo ""
echo "🌍 Your app will be available at:"
echo "- http://avenuep.org"
echo "- https://avenuep.org (after SSL setup)"
echo ""
echo "📧 Save this information for future reference!"