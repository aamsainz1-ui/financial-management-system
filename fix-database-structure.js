#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 แก้ไข Database Structure...\n');

const prismaDbPath = path.join(__dirname, 'prisma', 'db', 'custom_new.db');

if (fs.existsSync(prismaDbPath)) {
  try {
    const Database = require('better-sqlite3');
    const db = new Database(prismaDbPath);
    
    // ตรวจสอบโครงสร้างตาราง users
    const tableInfo = db.prepare("PRAGMA table_info(users)").all();
    
    console.log('📊 โครงสร้างตาราง users ปัจจุบัน:');
    tableInfo.forEach(column => {
      console.log(`  - ${column.name} (${column.type}) ${column.notnull ? 'NOT NULL' : ''} ${column.pk ? 'PRIMARY KEY' : ''}`);
    });
    
    // ตรวจสอบว่ามี username column หรือไม่
    const hasUsername = tableInfo.some(col => col.name === 'username');
    
    if (!hasUsername) {
      console.log('\n🔧 เพิ่ม username column...');
      
      // เพิ่ม username column
      const addColumn = db.prepare('ALTER TABLE users ADD COLUMN username TEXT');
      addColumn.run();
      
      console.log('✅ เพิ่ม username column สำเร็จ');
    } else {
      console.log('\n✅ มี username column อยู่แล้ว');
    }
    
    // ตรวจสอบว่ามี isActive column หรือไม่
    const hasIsActive = tableInfo.some(col => col.name === 'isActive');
    
    if (!hasIsActive) {
      console.log('🔧 เพิ่ม isActive column...');
      
      // เพิ่ม isActive column
      const addColumn = db.prepare('ALTER TABLE users ADD COLUMN isActive INTEGER DEFAULT 1');
      addColumn.run();
      
      console.log('✅ เพิ่ม isActive column สำเร็จ');
    } else {
      console.log('✅ มี isActive column อยู่แล้ว');
    }
    
    // แสดงโครงสร้างใหม่
    console.log('\n📊 โครงสร้างตาราง users หลังแก้ไข:');
    const newTableInfo = db.prepare("PRAGMA table_info(users)").all();
    newTableInfo.forEach(column => {
      console.log(`  - ${column.name} (${column.type}) ${column.notnull ? 'NOT NULL' : ''} ${column.pk ? 'PRIMARY KEY' : ''}`);
    });
    
    db.close();
    
    console.log('\n✅ แก้ไข Database Structure เสร็จสิ้น!');
    
  } catch (error) {
    console.log('❌ เกิดข้อผิดพลาด:', error.message);
  }
} else {
  console.log('❌ ไม่พบฐานข้อมูล');
}