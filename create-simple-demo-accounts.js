#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 สร้าง Demo Accounts แบบง่าย...\n');

// ติดตั้ง bcryptjs ถ้ายังไม่ได้ติดตั้ง
try {
  require('bcryptjs');
} catch (error) {
  console.log('📦 กำลังติดตั้ง bcryptjs...');
  const { execSync } = require('child_process');
  execSync('npm install bcryptjs', { stdio: 'inherit' });
}

const bcrypt = require('bcryptjs');

// Demo accounts ตาม login page
const demoAccounts = [
  { username: 'owner', name: 'System Owner', role: 'OWNER', password: '123456' },
  { username: 'admin', name: 'System Admin', role: 'ADMIN', password: '123456' },
  { username: 'editor', name: 'Content Editor', role: 'EDITOR', password: '123456' },
  { username: 'viewer', name: 'Content Viewer', role: 'VIEWER', password: '123456' }
];

async function createDemoAccounts() {
  const prismaDbPath = path.join(__dirname, 'prisma', 'db', 'custom_new.db');
  
  if (fs.existsSync(prismaDbPath)) {
    try {
      const Database = require('better-sqlite3');
      const db = new Database(prismaDbPath);
      
      // ตรวจสอบว่ามีตาราง users หรือไม่
      const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
      
      if (tableExists) {
        console.log('📊 กำลังสร้าง Demo Accounts...\n');
        
        for (const account of demoAccounts) {
          // Hash รหัสผ่าน
          const hashedPassword = await bcrypt.hash(account.password, 12);
          
          // ลบข้อมูลเก่าถ้ามี
          const deleteStmt = db.prepare('DELETE FROM users WHERE username = ?');
          deleteStmt.run(account.username);
          
          // สร้างผู้ใช้ใหม่ - ใช้ชื่อ column ที่มีอยู่จริง
          const insertStmt = db.prepare(`
            INSERT INTO users (name, email, username, password, role, status, created_at, updated_at, isActive) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);
          
          const result = insertStmt.run(
            account.name,
            `${account.username}@local.user`,
            account.username,
            hashedPassword,
            account.role,
            'active',
            new Date().toISOString(),
            new Date().toISOString(),
            1 // isActive = true
          );
          
          if (result.changes > 0) {
            console.log(`✅ สร้าง ${account.username} (${account.role}) สำเร็จ`);
          }
        }
        
        // แสดงข้อมูลทั้งหมด
        console.log('\n🎯 ข้อมูล Login ทั้งหมด:');
        console.log('================================');
        
        for (const account of demoAccounts) {
          console.log(`👤 ${account.name} (${account.role})`);
          console.log(`   Username: ${account.username}`);
          console.log(`   Password: ${account.password}`);
          console.log('');
        }
        
        console.log('🔗 ไปที่ http://localhost:3000/login');
        console.log('📁 หลัง login แล้วสามารถเข้าถึง File Manager ได้ที่เมนู "จัดการไฟล์"');
        
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
}

createDemoAccounts().then(() => {
  console.log('\n🎉 สร้าง Demo Accounts เสร็จสิ้น!');
  console.log('🔄 กรุณารีสตาร์ท server แล้วลอง login ใหม่');
}).catch(error => {
  console.log('❌ เกิดข้อผิดพลาด:', error.message);
});