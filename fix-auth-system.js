#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🔧 แก้ไข Authentication System...\n');

// ติดตั้ง bcrypt ถ้ายังไม่ได้ติดตั้ง
try {
  require('bcryptjs');
} catch (error) {
  console.log('📦 กำลังติดตั้ง bcryptjs...');
  const { execSync } = require('child_process');
  execSync('npm install bcryptjs', { stdio: 'inherit' });
}

const bcrypt = require('bcryptjs');

// สร้างรหัสผ่านใหม่
function generatePassword(length = 6) {
  const digits = '0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return password;
}

const newPassword = generatePassword(6);
console.log('🔑 รหัสผ่านใหม่:', newPassword);

// Hash รหัสผ่านด้วย bcrypt (ตามที่ auth-server.ts ใช้)
bcrypt.hash(newPassword, 12).then(async (hashedPassword) => {
  console.log('🔐 Hashed password (bcrypt):', hashedPassword.substring(0, 50) + '...');
  
  // อัปเดตฐานข้อมูล Prisma
  const prismaDbPath = path.join(__dirname, 'prisma', 'db', 'custom_new.db');
  
  if (fs.existsSync(prismaDbPath)) {
    try {
      const Database = require('better-sqlite3');
      const db = new Database(prismaDbPath);
      
      // ตรวจสอบว่ามีตาราง users หรือไม่
      const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
      
      if (tableExists) {
        // ลบข้อมูลเก่า
        const deleteStmt = db.prepare('DELETE FROM users WHERE role = ? OR role = ?');
        const deleteResult = deleteStmt.run('OWNER', 'owner');
        console.log(`🗑️ ลบ Owner เก่า ${deleteResult.changes} รายการ`);
        
        // สร้าง Owner ใหม่ด้วย bcrypt hash
        const insertStmt = db.prepare(`
          INSERT INTO users (name, email, password, role, status, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        
        const newOwner = {
          name: 'System Owner',
          email: 'owner@website.com',
          password: hashedPassword,
          role: 'OWNER',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const result = insertStmt.run(
          newOwner.name,
          newOwner.email,
          newOwner.password,
          newOwner.role,
          newOwner.status,
          newOwner.created_at,
          newOwner.updated_at
        );
        
        if (result.changes > 0) {
          console.log('✅ สร้าง Owner ใหม่สำเร็จ!');
          console.log('🆔 ID:', result.lastInsertRowid);
          
          // ตรวจสอบการสร้าง
          const verifyOwner = db.prepare('SELECT * FROM users WHERE role = ?').get('OWNER');
          if (verifyOwner) {
            console.log('✅ ยืนยันการสร้าง Owner สำเร็จ');
            console.log('👤 ชื่อ:', verifyOwner.name);
            console.log('📧 Email:', verifyOwner.email);
            console.log('🔑 Role:', verifyOwner.role);
            console.log('📊 Status:', verifyOwner.status);
          }
        }
      } else {
        console.log('❌ ไม่พบตาราง users');
      }
      
      db.close();
    } catch (error) {
      console.log('❌ เกิดข้อผิดพลาด:', error.message);
    }
  }
  
  console.log('\n🎯 ข้อมูล Login ใหม่:');
  console.log('   📧 Email: owner@website.com');
  console.log('   🔑 Password: ' + newPassword);
  console.log('\n⚠️  รหัสผ่านนี้เป็น PIN 6 หลัก');
  console.log('🔗 ไปที่ http://localhost:3000/login');
  console.log('\n🔄 กรุณารีสตาร์ท server แล้วลอง login ใหม่');
  
  // ทดสอบการ verify รหัสผ่าน
  console.log('\n🧪 ทดสอบการ verify รหัสผ่าน...');
  const isValid = await bcrypt.compare(newPassword, hashedPassword);
  console.log('✅ การ verify รหัสผ่าน:', isValid ? 'ถูกต้อง' : 'ผิดพลาด');
  
}).catch(error => {
  console.log('❌ เกิดข้อผิดพลาดในการ hash รหัสผ่าน:', error.message);
});