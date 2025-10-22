# 🌐 DNS Configuration for avenuep.org

## DNS Records ที่ต้องตั้งค่า

### สำหรับ Vercel Deployment (แนะนำ)
```
Type: A
Name: @
Value: 76.76.19.19
TTL: 300 (หรือ default)

Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 300 (หรือ default)
```

### สำหรับ VPS/Dedicated Server (IP: 118.139.179.219)
```
Type: A
Name: @
Value: 118.139.179.219
TTL: 300 (หรือ default)

Type: A
Name: www
Value: 118.139.179.219
TTL: 300 (หรือ default)
```

## วิธีตั้งค่า DNS ที่ Registrar ยอดนิยม

### Namecheap
1. Login ที่ Namecheap
2. Domain List → avenuep.org → Manage
3. Advanced DNS
4. Add Records ตามข้างบน
5. Remove default records ที่ไม่จำเป็น
6. Save Changes

### GoDaddy
1. Login ที่ GoDaddy
2. DNS Management → avenuep.org
3. Add Record
4. กรอกข้อมูลตามข้างบน
5. Save Changes

### Cloudflare
1. Login ที่ Cloudflare
2. Select avenuep.org
3. DNS → Add Record
4. กรอกข้อมูลตามข้างบน
5. Save Changes

## ตรวจสอบ DNS Propagation

### Online Tools
- https://www.whatsmydns.net/
- https://dnschecker.org/
- https://www.nslookup.io/

### Command Line
```bash
# ตรวจสอบ DNS
nslookup avenuep.org
dig avenuep.org

# ตรวจสอบจากหลายที่
for server in 8.8.8.8 1.1.1.1 208.67.222.222; do
    echo "Testing from $server:"
    nslookup avenuep.org $server
    echo ""
done
```

## เวลา DNS Propagation

- **โดยเฉลี่ย**: 5-30 นาที
- **สูงสุด**: 48 ชั่วโมง
- **ปัจจัยที่影响**: TTL, ISP cache, geographic location

## ตรวจสอบสถานะหลังตั้งค่า

### 1. DNS Resolution
```bash
nslookup avenuep.org
# ต้องได้ IP ที่ถูกต้อง (76.76.19.19 สำหรับ Vercel)
```

### 2. HTTP Access
```bash
curl -I http://avenuep.org
# ต้องได้ response 200, 301 หรือ 302
```

### 3. HTTPS Access
```bash
curl -I https://avenuep.org
# ต้องได้ response 200 หลังติดตั้ง SSL
```

## ปัญหาที่พบบ่อยและวิธีแก้ไข

### DNS ไม่อัปเดต
- **รอ**: DNS propagation ใช้เวลา
- **Clear cache**: `ipconfig /flushdns` (Windows) หรือ `sudo dscacheutil -flushcache` (Mac)
- **Check TTL**: ตรวจสอบค่า TTL ที่ตั้งไว้

### SSL Certificate ไม่ทำงาน
- **ตรวจสอบ**: DNS ต้องชี้มาถูกที่ก่อน
- **รอ**: SSL จะติดตั้งหลัง DNS พร้อม (5-10 นาที)
- **Manual**: ติดตั้ง SSL เองด้วย Let's Encrypt

### Website ไม่โหลด
- **Check**: Deployment logs
- **Verify**: Build process สำเร็จหรือไม่
- **Test**: Local deployment ก่อน

## Next Steps หลัง DNS พร้อม

1. **ติดตั้ง SSL Certificate**
2. **ทดสอบ functionality ทั้งหมด**
3. **Setup monitoring**
4. **Configure backup**
5. **Setup analytics**

## ติดต่อ Support

หากมีปัญหา:
- **Domain Registrar**: ติดต่อฝ่ายสนับสนุนของผู้ให้บริการโดเมน
- **Vercel**: https://vercel.com/support
- **Server Provider**: ติดต่อฝ่ายสนับสนุน server

---

**📋 บันทึก:**
- Domain: avenuep.org
- IP: 118.139.179.219
- Deployment: เลือกวิธีที่เหมาะสม
- DNS Records: ตั้งค่าตามที่ระบุข้างบน