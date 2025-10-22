#!/usr/bin/env node

const http = require('http');
const crypto = require('crypto');

console.log('🔧 สร้าง Owner ผ่าน API...\n');

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

const ownerData = {
  name: 'System Owner',
  email: 'owner@website.com',
  password: newPassword,
  role: 'OWNER'
};

console.log('📊 ข้อมูล Owner ที่จะสร้าง:');
console.log('  ชื่อ:', ownerData.name);
console.log('  Email:', ownerData.email);
console.log('  รหัสผ่าน:', newPassword);
console.log('  Role:', ownerData.role);

// ส่ง request ไปยัง API
const postData = JSON.stringify(ownerData);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/set-owner',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  let body = '';
  
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(body);
      
      if (res.statusCode === 200 || res.statusCode === 201) {
        console.log('\n✅ สร้าง Owner สำเร็จ!');
        console.log('📊 Response:', response);
        console.log('\n🎯 ใช้ข้อมูลนี้ในการ login:');
        console.log('   Email:', ownerData.email);
        console.log('   Password:', newPassword);
        console.log('\n⚠️  รหัสผ่านนี้เป็น PIN 6 หลัก');
        console.log('🔗 ไปที่ http://localhost:3000/login');
      } else {
        console.log('\n❌ ไม่สามารถสร้าง Owner ได้');
        console.log('Status:', res.statusCode);
        console.log('Response:', response);
        
        // ถ้ามี error เกี่ยวกับการมี owner อยู่แล้ว ให้ลอง reset
        if (response.error && response.error.includes('already exists')) {
          console.log('\n🔄 กำลังลองวิธีอื่น...');
          resetExistingOwner();
        }
      }
    } catch (error) {
      console.log('\n❌ ไม่สามารถอ่าน response:', error.message);
      console.log('Raw response:', body);
    }
  });
});

req.on('error', (error) => {
  console.log('\n❌ เกิดข้อผิดพลาดในการเชื่อมต่อ:', error.message);
  console.log('กรุณาตรวจสอบว่า server กำลังทำงานที่ port 3000');
});

req.write(postData);
req.end();

function resetExistingOwner() {
  console.log('\n🔄 ลองสร้าง Owner ผ่าน init-owner API...');
  
  const resetData = {
    email: 'owner@website.com',
    password: newPassword
  };
  
  const resetPostData = JSON.stringify(resetData);
  
  const resetOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/init-owner',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(resetPostData)
    }
  };
  
  const resetReq = http.request(resetOptions, (res) => {
    let body = '';
    
    res.on('data', (chunk) => {
      body += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(body);
        
        if (res.statusCode === 200 || res.statusCode === 201) {
          console.log('\n✅ สร้าง/รีเซ็ต Owner สำเร็จ!');
          console.log('📊 Response:', response);
          console.log('\n🎯 ใช้ข้อมูลนี้ในการ login:');
          console.log('   Email:', resetData.email);
          console.log('   Password:', newPassword);
          console.log('\n⚠️  รหัสผ่านนี้เป็น PIN 6 หลัก');
          console.log('🔗 ไปที่ http://localhost:3000/login');
        } else {
          console.log('\n❌ ไม่สามารถสร้าง/รีเซ็ต Owner ได้');
          console.log('Status:', res.statusCode);
          console.log('Response:', response);
        }
      } catch (error) {
        console.log('\n❌ ไม่สามารถอ่าน response:', error.message);
        console.log('Raw response:', body);
      }
    });
  });
  
  resetReq.on('error', (error) => {
    console.log('\n❌ เกิดข้อผิดพลาดในการเชื่อมต่อ:', error.message);
  });
  
  resetReq.write(resetPostData);
  resetReq.end();
}