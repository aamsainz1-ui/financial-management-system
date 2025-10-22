#!/bin/bash

# 🧪 Domain Testing Script
echo "🔍 Testing Domain Setup"
echo "======================="

# Ask for domain
read -p "Enter your domain to test: " DOMAIN

if [ -z "$DOMAIN" ]; then
    echo "❌ Domain name is required!"
    exit 1
fi

echo ""
echo "🌐 Testing domain: $DOMAIN"
echo ""

# Test 1: DNS Resolution
echo "1. 📍 Testing DNS Resolution..."
if nslookup $DOMAIN > /dev/null 2>&1; then
    echo "✅ DNS resolution successful"
    nslookup $DOMAIN | grep "Address:" | head -2
else
    echo "❌ DNS resolution failed"
fi

echo ""

# Test 2: HTTP/HTTPS
echo "2. 🔒 Testing HTTP/HTTPS..."

# Test HTTP
if curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN | grep -q "200\|301\|302"; then
    echo "✅ HTTP is working"
else
    echo "❌ HTTP is not working"
fi

# Test HTTPS
if curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN | grep -q "200"; then
    echo "✅ HTTPS is working"
    echo "🔒 SSL Certificate is valid"
else
    echo "❌ HTTPS is not working or SSL certificate issue"
fi

echo ""

# Test 3: Website Content
echo "3. 📄 Testing Website Content..."
if curl -s https://$DOMAIN | grep -q "Customer Counter\|จำนวนลูกค้า"; then
    echo "✅ Website content is loading correctly"
else
    echo "❌ Website content not found or different"
fi

echo ""

# Test 4: Performance
echo "4. ⚡ Testing Performance..."
RESPONSE_TIME=$(curl -o /dev/null -s -w "%{time_total}" https://$DOMAIN)
if (( $(echo "$RESPONSE_TIME < 3.0" | bc -l) )); then
    echo "✅ Good performance (${RESPONSE_TIME}s)"
elif (( $(echo "$RESPONSE_TIME < 5.0" | bc -l) )); then
    echo "⚠️  Moderate performance (${RESPONSE_TIME}s)"
else
    echo "❌ Slow performance (${RESPONSE_TIME}s)"
fi

echo ""

# Test 5: Mobile Responsiveness (basic check)
echo "5. 📱 Testing Mobile Responsiveness..."
USER_AGENT="Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15"
if curl -s -H "User-Agent: $USER_AGENT" https://$DOMAIN | grep -q "viewport\|responsive"; then
    echo "✅ Mobile-friendly detected"
else
    echo "⚠️  Mobile responsiveness unclear"
fi

echo ""
echo "🎉 Domain Testing Complete!"
echo ""
echo "📋 Summary:"
echo "- Domain: $DOMAIN"
echo "- Test Date: $(date)"
echo ""
echo "🔧 If any tests failed, check:"
echo "1. DNS settings at your domain registrar"
echo "2. Deployment logs (Vercel/Docker/Server)"
echo "3. SSL certificate status"
echo "4. Firewall settings"
echo ""
echo "🌐 Test again in a few minutes if DNS was recently updated"