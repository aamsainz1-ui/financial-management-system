#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// ตรวจสอบว่ามีฐานข้อมูลหรือไม่
const dbPath = path.join(__dirname, 'db', 'custom.db');
const prismaDbPath = path.join(__dirname, 'prisma', 'db', 'custom_new.db');

console.log('🔍 ตรวจสอบข้อมูล Owner ในระบบ...\n');

// ตรวจสอบฐานข้อมูลเก่า
if (fs.existsSync(dbPath)) {
  console.log('📁 พบฐานข้อมูลเก่า:', dbPath);
  try {
    const Database = require('better-sqlite3');
    const db = new Database(dbPath);
    
    // ตรวจสอบตาราง users
    const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
    
    if (tableExists) {
      const users = db.prepare('SELECT id, name, email, role, password FROM users WHERE role = ? OR role = ?').all('OWNER', 'owner');
      
      if (users.length > 0) {
        console.log('=== OWNER USERS ===');
        users.forEach(user => {
          console.log('ID:', user.id);
          console.log('Name:', user.name);
          console.log('Email:', user.email);
          console.log('Role:', user.role);
          console.log('Password:', user.password ? 'มีการตั้งค่า' : 'ยังไม่ได้ตั้งค่า');
          console.log('---');
        });
      } else {
        console.log('❌ ไม่พบผู้ใช้ระดับ Owner');
      }
    } else {
      console.log('❌ ไม่พบตาราง users');
    }
    
    db.close();
  } catch (error) {
    console.log('❌ ไม่สามารถอ่านฐานข้อมูลเก่า:', error.message);
  }
} else {
  console.log('❌ ไม่พบฐานข้อมูลเก่า');
}

console.log('');

// ตรวจสอบฐานข้อมูลใหม่ (Prisma)
if (fs.existsSync(prismaDbPath)) {
  console.log('📁 พบฐานข้อมูลใหม่ (Prisma):', prismaDbPath);
  try {
    const Database = require('better-sqlite3');
    const db = new Database(prismaDbPath);
    
    // ตรวจสอบตาราง users
    const tableExists = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
    
    if (tableExists) {
      const users = db.prepare('SELECT id, name, email, role, password FROM users WHERE role = ? OR role = ?').all('OWNER', 'owner');
      
      if (users.length > 0) {
        console.log('=== OWNER USERS (PRISMA) ===');
        users.forEach(user => {
          console.log('ID:', user.id);
          console.log('Name:', user.name);
          console.log('Email:', user.email);
          console.log('Role:', user.role);
          console.log('Password:', user.password ? 'มีการตั้งค่า' : 'ยังไม่ได้ตั้งค่า');
          console.log('---');
        });
      } else {
        console.log('❌ ไม่พบผู้ใช้ระดับ Owner ในฐานข้อมูล Prisma');
      }
    } else {
      console.log('❌ ไม่พบตาราง users ในฐานข้อมูล Prisma');
    }
    
    db.close();
  } catch (error) {
    console.log('❌ ไม่สามารถอ่านฐานข้อมูล Prisma:', error.message);
  }
} else {
  console.log('❌ ไม่พบฐานข้อมูล Prisma');
}

console.log('\n🔧 สร้าง Owner ใหม่...');

// สร้าง Owner ใหม่
try {
  const { createOwner } = require('./create-owner');
  createOwner().then(result => {
    console.log('✅ สร้าง Owner สำเร็จ!');
    console.log('📧 Email:', result.email);
    console.log('🔑 Password:', result.password);
    console.log('\n🎯 ใช้ข้อมูลนี้ในการ login:');
    console.log('   Email:', result.email);
    console.log('   Password:', result.password);
  }).catch(error => {
    console.log('❌ ไม่สามารถสร้าง Owner:', error.message);
  });
} catch (error) {
  console.log('❌ ไม่สามารถเรียกฟังก์ชันสร้าง Owner:', error.message);
}