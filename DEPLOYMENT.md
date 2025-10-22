# 🚀 Deployment Guide

## วิธีการ Deploy แอปพลิเคชัน Customer Counter สู่ Production

### 📋 ข้อกำหนดเบื้องต้น
- Node.js 18+ 
- Docker & Docker Compose
- Domain name (ถ้าต้องการใช้โดเมนจริง)
- SSL Certificate (ถ้าต้องการ HTTPS)

---

## 🐳 วิธีที่ 1: Docker Deployment (แนะนำ)

### 1. เตรียม Environment Variables
```bash
# สร้างไฟล์ .env.production
cp .env.example .env.production
```

แก้ไข `.env.production`:
```env
NODE_ENV=production
DATABASE_URL="file:./prod.db"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secret-key-here"
```

### 2. Build และ Deploy
```bash
# Build Docker image
docker build -t customer-counter-app .

# Start ด้วย Docker Compose
docker-compose up -d

# ตรวจสอบสถานะ
docker-compose logs -f
```

### 3. Setup Domain และ SSL
1. แก้ไข `nginx.conf` ใส่โดเมนของคุณ
2. ใส่ SSL certificates ในโฟลเดอร์ `ssl/`
3. Restart nginx:
```bash
docker-compose restart nginx
```

---

## 🌐 วิธีที่ 2: Vercel Deployment (ง่ายที่สุด)

### 1. Install Vercel CLI
```bash
npm i -g vercel
```

### 2. Deploy
```bash
# Login สู่ Vercel
vercel login

# Deploy
vercel --prod
```

### 3. Setup Environment Variables ใน Vercel Dashboard
- ไปที่ Vercel Dashboard
- เลือก Project
- Settings → Environment Variables
- เพิ่มตัวแปรจาก `.env.production`

---

## 🟢 วิธีที่ 3: Traditional VPS/Server

### 1. Setup Server
```bash
# Update server
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

### 2. Deploy Application
```bash
# Clone หรือ upload code
git clone <your-repo>
cd <project-folder>

# Install dependencies
npm install

# Build application
npm run build

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Start ด้วย PM2
pm2 start npm --name "customer-counter" -- start
pm2 startup
pm2 save
```

### 3. Setup Nginx Reverse Proxy
สร้างไฟล์ `/etc/nginx/sites-available/customer-counter`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/customer-counter /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔒 SSL Certificate (Let's Encrypt)

### ติดตั้ง SSL ฟรี
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 📊 Monitoring และ Maintenance

### ตรวจสอบสถานะ
```bash
# Docker
docker-compose ps
docker-compose logs

# PM2
pm2 status
pm2 logs

# System
sudo systemctl status nginx
```

### Backup Database
```bash
# Backup Prisma database
cp prisma/prod.db backups/prod-$(date +%Y%m%d).db
```

### Update Application
```bash
# Pull latest code
git pull

# Rebuild and restart
npm run build
pm2 restart customer-counter
```

---

## 🚨 Troubleshooting

### ปัญหาที่พบบ่อย
1. **Database connection error** - ตรวจสอบ DATABASE_URL
2. **Port already in use** - ตรวจสอสอบว่า port 3000 ว่าง
3. **Permission denied** - ตรวจสอบ file permissions
4. **SSL not working** - ตรวจสอบ nginx configuration

### Log Files
- Application logs: `pm2 logs` หรือ `docker-compose logs`
- Nginx logs: `/var/log/nginx/`
- System logs: `journalctl -u nginx`

---

## 💡 แนะนำ

1. **เริ่มต้น** ใช้ Vercel สำหรับ deployment ง่ายๆ
2. **Production** ใช้ Docker สำหรับความเสถียร
3. **Domain** ซื้อโดเมนจาก Namecheap, GoDaddy หรือ Cloudflare
4. **SSL** ใช้ Let's Encrypt ฟรี
5. **Backup** ตั้งค่า backup อัตโนมัติทุกวัน

---

## 📞 ติดต่อ

หากมีปัญหาในการ deployment สามารถ:
1. ตรวจสอบ logs ด้านบน
2. ตรวจสอบ environment variables
3. ตรวจสอบ firewall settings
4. ติดต่อ support ของ hosting provider