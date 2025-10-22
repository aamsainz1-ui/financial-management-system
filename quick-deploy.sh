#!/bin/bash

# 🚀 Quick Domain Setup Script
echo "🌐 Customer Counter - Domain Setup Script"
echo "=========================================="

# Ask for domain name
echo "Please enter your domain name:"
read -p "Domain (e.g., yourdomain.com): " DOMAIN

if [ -z "$DOMAIN" ]; then
    echo "❌ Domain name is required!"
    exit 1
fi

echo ""
echo "📋 Domain Setup Summary:"
echo "Domain: $DOMAIN"
echo ""

# Ask for deployment method
echo "Choose deployment method:"
echo "1) Vercel (Recommended - Free & Easy)"
echo "2) Docker/VPS (Advanced)"
echo "3) Traditional VPS (Manual)"
read -p "Enter choice (1-3): " CHOICE

case $CHOICE in
    1)
        echo ""
        echo "🚀 Deploying to Vercel..."
        echo "Steps:"
        echo "1. Installing Vercel CLI..."
        npm install -g vercel
        
        echo "2. Please login to Vercel..."
        vercel login
        
        echo "3. Building application..."
        npm run build
        
        echo "4. Deploying to production..."
        vercel --prod
        
        echo ""
        echo "✅ Vercel Deployment Complete!"
        echo ""
        echo "🌍 Next Steps for Custom Domain:"
        echo "1. Go to Vercel Dashboard"
        echo "2. Add domain: $DOMAIN"
        echo "3. Update DNS records:"
        echo "   Type: A, Name: @, Value: 76.76.19.19"
        echo "   Type: CNAME, Name: www, Value: cname.vercel-dns.com"
        echo "4. Wait for SSL certificate (5-10 minutes)"
        ;;
        
    2)
        echo ""
        echo "🐳 Docker Deployment..."
        echo "Steps:"
        echo "1. Update nginx.conf with your domain..."
        sed -i "s/YOUR_DOMAIN_HERE/$DOMAIN/g" nginx.conf
        
        echo "2. Build Docker image..."
        docker build -t customer-counter-app .
        
        echo "3. Start containers..."
        docker-compose up -d
        
        echo "4. Install SSL certificate..."
        echo "   Run: sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
        
        echo ""
        echo "✅ Docker Deployment Complete!"
        echo "🌍 Your app should be available at: https://$DOMAIN"
        ;;
        
    3)
        echo ""
        echo "🖥️ Traditional VPS Deployment..."
        echo "Steps:"
        echo "1. Install dependencies:"
        echo "   sudo apt update && sudo apt install nodejs nginx -y"
        echo "   sudo npm install -g pm2"
        
        echo "2. Build application:"
        echo "   npm run build"
        
        echo "3. Start with PM2:"
        echo "   pm2 start npm --name 'customer-counter' -- start"
        
        echo "4. Setup Nginx reverse proxy"
        echo "5. Install SSL with Let's Encrypt"
        
        echo ""
        echo "✅ Manual setup instructions provided!"
        ;;
        
    *)
        echo "❌ Invalid choice!"
        exit 1
        ;;
esac

echo ""
echo "🎉 Setup completed!"
echo "📧 Save this information:"
echo "Domain: $DOMAIN"
echo "Deployment Date: $(date)"
echo ""
echo "🔗 Useful Links:"
echo "- Your app: https://$DOMAIN"
echo "- Vercel Dashboard: https://vercel.com/dashboard"
echo "- DNS Checker: https://www.whatsmydns.net/"
echo ""
echo "📚 Documentation: DEPLOYMENT.md"