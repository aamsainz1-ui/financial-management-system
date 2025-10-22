#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

console.log('🔍 ตรวจสอบปัญหา Login...\n');

// ติดตั้ง better-sqlite3 ถ้ายังไม่ได้ติดตั้ง
try {
  require('better-sqlite3');
} catch (error) {
  console.log('📦 กำลังติดตั้ง better-sqlite3...');
  const { execSync } = require('child_process');
  execSync('npm install better-sqlite3', { stdio: 'inherit' });
}

const Database = require('better-sqlite3');

// ฟังก์ชัน hash รหัสผ่าน
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// ตรวจสอบฐานข้อมูล
const dbPaths = [
  path.join(__dirname, 'prisma', 'db', 'custom_new.db'),
  path.join(__dirname, 'db', 'custom.db'),
  path.join(__dirname, 'avenuep-deploy', 'prisma', 'db', 'custom_new.db')
];

let foundDb = false;
let foundUsers = [];

for (const dbPath of dbPaths) {
  if (fs.existsSync(dbPath)) {
    console.log(`📁 ตรวจสอบฐานข้อมูล: ${dbPath}`);
    
    try {
      const db = new Database(dbPath);
      
      // ตรวจสอบว่ามีตาราง users หรือไม่
      const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
      
      if (tableExists) {
        console.log('✅ พบตาราง users');
        
        // ดึงข้อมูลผู้ใช้ทั้งหมด
        const users = db.prepare('SELECT * FROM users').all();
        
        if (users.length > 0) {
          console.log(`📊 พบผู้ใช้ ${users.length} รายการ:\n`);
          
          users.forEach((user, index) => {
            console.log(`${index + 1}. ID: ${user.id}`);
            console.log(`   ชื่อ: ${user.name}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Status: ${user.status}`);
            console.log(`   Password: ${user.password ? 'มีการตั้งค่า (' + user.password.substring(0, 20) + '...)' : 'ไม่มี'}`);
            console.log(`   Created: ${user.created_at}`);
            console.log('');
            
            foundUsers.push(user);
          });
        } else {
          console.log('❌ ไม่พบผู้ใช้ในฐานข้อมูล');
        }
      } else {
        console.log('❌ ไม่พบตาราง users');
      }
      
      db.close();
      foundDb = true;
    } catch (error) {
      console.log('❌ เกิดข้อผิดพลาด:', error.message);
    }
  }
}

if (!foundDb) {
  console.log('❌ ไม่พบฐานข้อมูลใดๆ');
}

// ทดสอบการ login
if (foundUsers.length > 0) {
  console.log('🧪 ทดสอบการ login...\n');
  
  foundUsers.forEach(user => {
    console.log(`ทดสอบสำหรับ: ${user.email} (${user.role})`);
    
    // ทดสอบรหัสผ่านที่เป็นไปได้
    const testPasswords = [
      '433035',  // รหัสที่สร้างไว้
      'owner@website.com',  // อาจจะใช้ email เป็นรหัส
      'password',  // รหัสผ่านทั่วไป
      '123456',  // PIN ทั่วไป
      'owner',  // ชื่อผู้ใช้
    ];
    
    testPasswords.forEach(testPass => {
      const hashedTest = hashPassword(testPass);
      const isMatch = hashedTest === user.password;
      
      if (isMatch) {
        console.log(`✅ รหัสผ่านถูกต้อง: "${testPass}"`);
        console.log(`🎯 ใช้ข้อมูลนี้ login:`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Password: ${testPass}`);
        console.log('');
      }
    });
    
    if (!testPasswords.some(pass => hashPassword(pass) === user.password)) {
      console.log(`❌ ไม่พบรหัสผ่านที่ตรงกัน`);
      console.log(`🔧 ต้องการรีเซ็ตรหัสผ่านหรือไม่?`);
      console.log('');
    }
  });
}

// ถ้าไม่พบผู้ใช้ ให้สร้างใหม่
if (foundUsers.length === 0) {
  console.log('🔧 ไม่พบผู้ใช้ กำลังสร้าง Owner ใหม่...\n');
  
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
  const hashedPassword = hashPassword(newPassword);
  
  console.log(`🔑 รหัสผ่านใหม่: ${newPassword}`);
  console.log(`🔐 Hashed: ${hashedPassword}`);
  
  // สร้างในฐานข้อมูลแรกที่พบ
  for (const dbPath of dbPaths) {
    if (fs.existsSync(dbPath)) {
      try {
        const db = new Database(dbPath);
        
        // สร้างตารางถ้ายังไม่มี
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
        
        // สร้าง Owner
        const insertStmt = db.prepare(`
          INSERT OR REPLACE INTO users (name, email, password, role, status, created_at, updated_at) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        
        const result = insertStmt.run(
          'System Owner',
          'owner@website.com',
          hashedPassword,
          'OWNER',
          'active',
          new Date().toISOString(),
          new Date().toISOString()
        );
        
        if (result.changes > 0) {
          console.log('✅ สร้าง Owner สำเร็จ!');
          console.log('🎯 ใช้ข้อมูลนี้ login:');
          console.log(`   Email: owner@website.com`);
          console.log(`   Password: ${newPassword}`);
        }
        
        db.close();
        break;
      } catch (error) {
        console.log('❌ เกิดข้อผิดพลาด:', error.message);
      }
    }
  }
}

console.log('\n🔄 กรุณารีสตาร์ท server แล้วลอง login ใหม่');