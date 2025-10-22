# 🌐 Custom Domain Setup Guide

## ขั้นตอนการตั้งค่าโดเมนสำหรับ Customer Counter App

---

## 🚀 วิธีที่ 1: Vercel (แนะนำ - ฟรีและง่ายที่สุด)

### Step 1: Deploy ไป Vercel
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod
```

### Step 2: เพิ่ม Custom Domain
1. ไปที่ [Vercel Dashboard](https://vercel.com/dashboard)
2. เลือก project ของคุณ
3. ไปที่ **Settings** → **Domains**
4. คลิก **Add Domain**
5. ใส่โดเมนของคุณ (เช่น `yourdomain.com`)

### Step 3: ตั้งค่า DNS
Vercel จะแสดง DNS records ที่ต้องตั้งค่า:
```
Type: A
Name: @
Value: 76.76.19.19

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Step 4: ตั้งค่าที่ Registrar โดเมน
- **Namecheap**: Domain → Advanced DNS → Add Record
- **GoDaddy**: DNS Management → Add Record
- **Cloudflare**: DNS → Add Record

### Step 5: รอ SSL Certificate
Vercel จะติดตั้ง SSL ให้อัตโนมัติ (ประมาณ 5-10 นาที)

---

## 🐳 วิธีที่ 2: Docker + VPS

### Step 1: แก้ไข Configuration
แก้ไขไฟล์ `nginx.conf`:
```nginx
server_name YOUR_DOMAIN_HERE www.YOUR_DOMAIN_HERE;
```

### Step 2: Build และ Deploy
```bash
# 1. แก้ไข .env.production
cp .env.example .env.production

# 2. Build Docker image
docker build -t customer-counter-app .

# 3. Start containers
docker-compose up -d
```

### Step 3: ติดตั้ง SSL ด้วย Let's Encrypt
```bash
# 1. Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# 2. Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 3. Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🖥️ วิธีที่ 3: Traditional VPS

### Step 1: Setup Server
```bash
# Update server
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

### Step 2: Deploy Application
```bash
# Clone or upload your code
git clone <your-repo>
cd <project-folder>

# Install dependencies
npm install

# Build application
npm run build

# Start with PM2
pm2 start npm --name "customer-counter" -- start
pm2 startup
pm2 save
```

### Step 3: Setup Nginx
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

### Step 4: Add SSL
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 📋 DNS Records ที่ต้องตั้งค่า

### สำหรับ Vercel:
```
Type: A
Name: @
Value: 76.76.19.19

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
```

### สำหรับ VPS/Dedicated Server:
```
Type: A
Name: @
Value: [YOUR_SERVER_IP]

Type: A
Name: www  
Value: [YOUR_SERVER_IP]
```

---

## 🔧 Environment Variables สำหรับ Production

สร้างไฟล์ `.env.production`:
```env
NODE_ENV=production
DATABASE_URL="file:./prod.db"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secret-key-here"
```

---

## ✅ Testing Checklist

หลังจากตั้งค่าโดเมนแล้ว ให้ทดสอบ:

1. **HTTP/HTTPS**: 
   - http://yourdomain.com → ต้อง redirect ไป https
   - https://yourdomain.com → ต้องแสดงเว็บ

2. **WWW vs Non-WWW**:
   - https://yourdomain.com
   - https://www.yourdomain.com

3. **SSL Certificate**:
   - ตรวจสอบว่ามี icon กุญแจสีเขียว
   - ไม่มี SSL warning

4. **Functionality**:
   - ทดสอบปุ่มเพิ่ม/ลด จำนวนลูกค้า
   - ทดสอบฟอร์มตั้งค่า
   - ทดสอบบนมือถือ

5. **Performance**:
   - โหลดเร็วหรือไม่
   - ทำงานบน mobile ได้ไหม

---

## 🚨 Common Issues & Solutions

### Issue: DNS Propagation
- **Solution**: รอ 24-48 ชั่วโมง สำหรับ DNS update
- **Check**: `nslookup yourdomain.com`

### Issue: SSL Certificate
- **Solution**: ตรวจสอบว่า DNS ชี้มาถูกที่แล้ว
- **Check**: SSL จะติดตั้งอัตโนมัติหลัง DNS พร้อม

### Issue: 404 Error
- **Solution**: ตรวจสอบ nginx configuration หรือ Vercel settings
- **Check**: Build logs และ deployment logs

### Issue: Database Connection
- **Solution**: ตรวจสอบ environment variables
- **Check**: DATABASE_URL ใน production

---

## 🎉 Next Steps

หลังจากโดเมนทำงานแล้ว:

1. **Setup Analytics** - Google Analytics, Plausible
2. **Backup Strategy** - Auto backup database
3. **Monitoring** - Uptime monitoring
4. **SEO Optimization** - Meta tags, sitemap
5. **Performance** - CDN, image optimization

---

## 📞 ต้องการความช่วยเหลือ?

หากมีปัญหาในการตั้งค่าโดเมน:
1. ตรวจสอบ DNS settings ที่ registrar
2. ตรวจสอบ deployment logs
3. ติดต่อฝ่ายสนับสนุนของ hosting provider
4. ตรวจสอบว่า build สำเร็จหรือไม่