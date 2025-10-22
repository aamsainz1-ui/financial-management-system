#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🔧 รีเซ็ตรหัสผ่าน Owner...\n');

// ฟังก์ชันสร้างรหัสผ่านใหม่
function generatePassword(length = 6) {
  const digits = '0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return password;
}

// ฟังก์ชัน hash รหัสผ่าน
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// สร้างรหัสผ่านใหม่
const newPassword = generatePassword(6);
const hashedPassword = hashPassword(newPassword);

console.log('🔑 รหัสผ่านใหม่:', newPassword);
console.log('🔐 Hashed password:', hashedPassword);

// อัปเดตฐานข้อมูล Prisma
const prismaDbPath = path.join(__dirname, 'prisma', 'db', 'custom_new.db');

if (fs.existsSync(prismaDbPath)) {
  try {
    // ติดตั้ง better-sqlite3 ชั่วคราว
    const { execSync } = require('child_process');
    
    try {
      execSync('npm list better-sqlite3', { stdio: 'ignore' });
    } catch (error) {
      console.log('📦 กำลังติดตั้ง better-sqlite3...');
      execSync('npm install better-sqlite3', { stdio: 'inherit' });
    }
    
    const Database = require('better-sqlite3');
    const db = new Database(prismaDbPath);
    
    // ตรวจสอบว่ามีตาราง users หรือไม่
    const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
    
    if (tableExists) {
      // หาผู้ใช้ระดับ Owner
      const owner = db.prepare('SELECT id, name, email FROM users WHERE role = ? OR role = ?').get('OWNER', 'owner');
      
      if (owner) {
        // อัปเดตรหัสผ่าน
        const updateStmt = db.prepare('UPDATE users SET password = ? WHERE id = ?');
        const result = updateStmt.run(hashedPassword, owner.id);
        
        if (result.changes > 0) {
          console.log('\n✅ อัปเดตรหัสผ่านสำเร็จ!');
          console.log('👤 ชื่อ:', owner.name);
          console.log('📧 Email:', owner.email);
          console.log('🔑 รหัสผ่านใหม่:', newPassword);
          console.log('\n🎯 ใช้ข้อมูลนี้ในการ login:');
          console.log('   Email:', owner.email);
          console.log('   Password:', newPassword);
          console.log('\n⚠️  รหัสผ่านนี้เป็น PIN 6 หลัก');
        } else {
          console.log('❌ ไม่สามารถอัปเดตรหัสผ่าน');
        }
      } else {
        console.log('❌ ไม่พบผู้ใช้ระดับ Owner');
        
        // สร้าง Owner ใหม่
        console.log('\n🔧 กำลังสร้าง Owner ใหม่...');
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
          console.log('✅ สร้าง Owner สำเร็จ!');
          console.log('👤 ชื่อ:', newOwner.name);
          console.log('📧 Email:', newOwner.email);
          console.log('🔑 รหัสผ่าน:', newPassword);
          console.log('\n🎯 ใช้ข้อมูลนี้ในการ login:');
          console.log('   Email:', newOwner.email);
          console.log('   Password:', newPassword);
        }
      }
    } else {
      console.log('❌ ไม่พบตาราง users');
    }
    
    db.close();
  } catch (error) {
    console.log('❌ เกิดข้อผิดพลาด:', error.message);
  }
} else {
  console.log('❌ ไม่พบฐานข้อมูล');
}

console.log('\n🔄 กรุณารีสตาร์ท server เพื่อให้การเปลี่ยนแปลงมีผล');
console.log('📱 จากนั้น login ด้วยข้อมูลข้างต้น');