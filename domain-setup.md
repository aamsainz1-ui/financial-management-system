# 🌐 Domain Setup Checklist

## กรุณากรอกข้อมูลโดเมนของคุณ:

- **โดเมนหลัก**: ___________________________ (เช่น yourdomain.com)
- **Server IP**: ___________________________ (IP ของ server ที่จะ deploy)
- **Hosting Provider**: ___________________________ (Vercel, AWS, DigitalOcean, etc.)

## ขั้นตอนที่ต้องทำ:

### ✅ DNS Configuration
1. Login ที่ registrar ของโดเมน
2. แก้ไข DNS Records:
   - A Record: @ → [Server IP]
   - A Record: www → [Server IP]
   - CNAME (ถ้าต้องการ): api → [Server IP]

### ✅ SSL Certificate
1. ใช้ Let's Encrypt (ฟรี)
2. หรือ SSL จาก hosting provider

### ✅ Application Deployment
1. เลือกวิธี deployment (Vercel แนะนำ)
2. Update environment variables
3. Test production URL

### ✅ Final Testing
1. Test https://yourdomain.com
2. Test https://www.yourdomain.com
3. Test all features
4. Check mobile responsiveness