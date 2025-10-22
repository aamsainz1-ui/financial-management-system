#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🔧 สร้าง Owner ผ่าน Database โดยตรง...\n');

// ฟังก์ชันสร้างรหัสผ่านใหม่
function generatePassword(length = 6) {
  const digits = '0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return password;
}

// สร้างรหัสผ่านใหม่
const newPassword = generatePassword(6);
const hashedPassword = crypto.createHash('sha256').update(newPassword).digest('hex');

console.log('🔑 รหัสผ่านใหม่ (PIN 6 หลัก):', newPassword);
console.log('🔐 Hashed password:', hashedPassword);

// ติดตั้ง better-sqlite3 ถ้ายังไม่ได้ติดตั้ง
try {
  require('better-sqlite3');
} catch (error) {
  console.log('📦 กำลังติดตั้ง better-sqlite3...');
  const { execSync } = require('child_process');
  execSync('npm install better-sqlite3', { stdio: 'inherit' });
}

const Database = require('better-sqlite3');

// ลองกับฐานข้อมูลต่างๆ
const dbPaths = [
  path.join(__dirname, 'prisma', 'db', 'custom_new.db'),
  path.join(__dirname, 'db', 'custom.db'),
  path.join(__dirname, 'avenuep-deploy', 'prisma', 'db', 'custom_new.db')
];

let ownerCreated = false;

for (const dbPath of dbPaths) {
  if (fs.existsSync(dbPath)) {
    console.log(`\n📁 ลองกับฐานข้อมูล: ${dbPath}`);
    
    try {
      const db = new Database(dbPath);
      
      // ตรวจสอบว่ามีตาราง users หรือไม่
      const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
      
      if (tableExists) {
        console.log('✅ พบตาราง users');
        
        // ลบ Owner เก่าถ้ามี
        const deleteStmt = db.prepare('DELETE FROM users WHERE role = ? OR role = ?');
        const deleteResult = deleteStmt.run('OWNER', 'owner');
        console.log(`🗑️ ลบ Owner เก่า ${deleteResult.changes} รายการ`);
        
        // สร้าง Owner ใหม่
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
          console.log('🆔 ID:', result.lastInsertRowid);
          ownerCreated = true;
          
          // ตรวจสอบว่าสร้างจริง
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
        
        // สร้างตาราง users
        console.log('🔧 กำลังสร้างตาราง users...');
        const createTableStmt = db.prepare(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'USER',
            status TEXT NOT NULL DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        createTableStmt.run();
        console.log('✅ สร้างตาราง users สำเร็จ');
        
        // สร้าง Owner
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
          console.log('🆔 ID:', result.lastInsertRowid);
          ownerCreated = true;
        }
      }
      
      db.close();
    } catch (error) {
      console.log('❌ เกิดข้อผิดพลาด:', error.message);
    }
    
    if (ownerCreated) {
      break;
    }
  }
}

if (ownerCreated) {
  console.log('\n🎉 สร้าง Owner สำเร็จแล้ว!');
  console.log('🎯 ใช้ข้อมูลนี้ในการ login:');
  console.log('   📧 Email: owner@website.com');
  console.log('   🔑 Password: ' + newPassword);
  console.log('\n⚠️  รหัสผ่านนี้เป็น PIN 6 หลัก');
  console.log('🔗 ไปที่ http://localhost:3000/login');
  console.log('\n📁 หลัง login แล้ว คุณสามารถเข้าถึง File Manager ได้ที่:');
  console.log('   👆 คลิก "จัดการไฟล์" ในเมนูด้านซ้าย');
} else {
  console.log('\n❌ ไม่สามารถสร้าง Owner ได้ในฐานข้อมูลใดๆ');
  console.log('กรุณาตรวจสอบว่ามีฐานข้อมูลอยู่จริง');
}