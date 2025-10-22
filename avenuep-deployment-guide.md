# 🚀 Avenuep.org Deployment Guide

## สถานะปัจจุบัน
- ✅ DNS พร้อม: avenuep.org → 118.139.179.219
- ✅ Build สำเร็จ
- ✅ Environment variables พร้อม
- 🔄 รอการ deploy ไป server

---

## 🎯 2 ทางเลือกการ Deploy

### ทางเลือก 1: Vercel (แนะนำ - ฟรีและง่ายที่สุด)

**ข้อดี:**
- ฟรี
- SSL อัตโนมัติ
- ไม่ต้องจัดการ server
- Deploy ง่ายๆ ด้วยคำสั่งเดียว

**ขั้นตอน:**
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
npm run build
vercel --prod

# 4. Add domain ใน Vercel Dashboard
# Settings → Domains → Add avenuep.org
```

**DNS สำหรับ Vercel:**
```
Type: A     Name: @     Value: 76.76.19.19
Type: CNAME Name: www   Value: cname.vercel-dns.com
```

---

### ทางเลือก 2: Server ส่วนตัว (IP: 118.139.179.219)

**ข้อดี:**
- ควบคุมได้เต็มที่
- ไม่มีข้อจำกัด
- ปรับแต่งได้ตามต้องการ

**ขั้นตอน:**

#### 1. SSH เข้า server
```bash
ssh root@118.139.179.219
```

#### 2. Setup Server
```bash
# Update server
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Install Nginx
apt install nginx -y

# Install Certbot (สำหรับ SSL)
apt install certbot python3-certbot-nginx -y
```

#### 3. Deploy Application
```bash
# Clone หรือ upload project
cd /var/www/
git clone <your-repo> avenuep.org
cd avenuep.org

# Install dependencies
npm install

# Setup environment
cp .env.production .env.local

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Build application
npm run build

# Start with PM2
pm2 start npm --name "avenuep-app" -- start
pm2 save
pm2 startup
```

#### 4. Setup Nginx
```bash
# Copy nginx config
cp nginx-avenuep.conf /etc/nginx/sites-available/avenuep.org

# Enable site
ln -s /etc/nginx/sites-available/avenuep.org /etc/nginx/sites-enabled/

# Test and restart
nginx -t
systemctl restart nginx
```

#### 5. Install SSL
```bash
# Get SSL certificate
certbot --nginx -d avenuep.org -d www.avenuep.org

# Test auto-renewal
certbot renew --dry-run
```

---

## 🔧 การตรวจสอบหลัง Deploy

### 1. DNS Check
```bash
nslookup avenuep.org
nslookup www.avenuep.org
```

### 2. HTTP/HTTPS Test
```bash
curl -I http://avenuep.org
curl -I https://avenuep.org
```

### 3. Application Test
- เปิด http://avenuep.org
- ทดสอบปุ่มเพิ่ม/ลด จำนวนลูกค้า
- ทดสอบฟอร์มตั้งค่า
- ทดสอบบนมือถือ

### 4. SSL Check
- ตรวจสอบ icon กุญแจสีเขียว
- ไม่มี SSL warning
- ใช้ https:// ได้

---

## 📊 Monitoring และ Maintenance

### PM2 Commands
```bash
pm2 status                    # ดูสถานะ
pm2 logs avenuep-app         # ดู logs
pm2 restart avenuep-app      # restart
pm2 monit                    # monitoring
```

### Nginx Commands
```bash
systemctl status nginx       # ดูสถานะ
systemctl restart nginx      # restart
tail -f /var/log/nginx/access.log  # ดู logs
```

### Database Backup
```bash
# Backup script
cp prisma/prod.db backups/prod-$(date +%Y%m%d-%H%M%S).db

# Auto backup (crontab)
0 2 * * * cp /var/www/avenuep.org/prisma/prod.db /backups/prod-$(date +\%Y\%m\%d).db
```

---

## 🚨 Troubleshooting

### Server ไม่ตอบสนอง
```bash
# Check PM2
pm2 status

# Check Nginx
systemctl status nginx

# Check ports
netstat -tlnp | grep :3000
netstat -tlnp | grep :80
```

### SSL ไม่ทำงาน
```bash
# Check certificate
certbot certificates

# Reissue certificate
certbot --nginx -d avenuep.org -d www.avenuep.org
```

### Database Error
```bash
# Check database file
ls -la prisma/prod.db

# Regenerate client
npx prisma generate

# Run migrations
npx prisma migrate deploy
```

---

## 📞 ติดต่อ Support

หากมีปัญหา:
1. **Vercel**: https://vercel.com/support
2. **Server Provider**: ติดต่อฝ่ายสนับสนุนของคุณ
3. **Domain**: GoDaddy Support

---

## 🎉 Success Criteria

✅ **Deployment Success เมื่อ:**
- http://avenuep.org ใช้งานได้
- https://avenuep.org ใช้งานได้ (SSL)
- ฟีเจอร์ทั้งหมดทำงาน
- Mobile responsive
- Performance ดี

**Timeline:**
- Vercel: 15-30 นาที
- Server: 1-2 ชั่วโมง

**แนะนำ:** เริ่มกับ Vercel ก่อน ถ้าต้องการความสามารถพิเศษค่อยย้ายไป server ทีหลัง