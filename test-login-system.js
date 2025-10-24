// Test login system with all user roles

const BASE_URL = 'http://localhost:3000';

async function testLogin(username, password) {
  try {
    console.log(`\n🔐 ทดสอบการ Login: ${username}`);

    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    console.log(`📊 Status: ${response.status} ${response.statusText}`);

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Login สำเร็จ!');
      console.log(`   👤 ชื่อผู้ใช้: ${result.user.username}`);
      console.log(`   📧 Email: ${result.user.email}`);
      console.log(`   👨‍💼 ชื่อ: ${result.user.name}`);
      console.log(`   🎭 บทบาท: ${result.user.role}`);
      console.log(`   ✅ สถานะ: ${result.user.isActive ? 'Active' : 'Inactive'}`);
      console.log(`   🔑 Token: ${result.token.substring(0, 50)}...`);
      return { success: true, user: result.user, token: result.token };
    } else {
      const error = await response.json();
      console.log('❌ Login ล้มเหลว!');
      console.log(`   เหตุผล: ${error.error}`);
      return { success: false, error: error.error };
    }
  } catch (error) {
    console.log('❌ เกิดข้อผิดพลาด:', error.message);
    return { success: false, error: error.message };
  }
}

async function runLoginTests() {
  console.log('🧪 เริ่มการทดสอบระบบ Login...\n');
  console.log('=' .repeat(60));

  const testUsers = [
    { username: 'owner', password: '123456', shouldPass: true },
    { username: 'admin', password: '123456', shouldPass: true },
    { username: 'editor', password: '123456', shouldPass: true },
    { username: 'viewer', password: '123456', shouldPass: true },
    { username: 'admin', password: 'wrongpassword', shouldPass: false },
    { username: 'nonexistent', password: '123456', shouldPass: false },
  ];

  const results = [];

  for (const testUser of testUsers) {
    const result = await testLogin(testUser.username, testUser.password);

    const expectedResult = testUser.shouldPass ? 'ควรผ่าน' : 'ควรไม่ผ่าน';
    const actualResult = result.success ? 'ผ่าน' : 'ไม่ผ่าน';
    const testPassed = (result.success === testUser.shouldPass);

    results.push({
      username: testUser.username,
      expected: testUser.shouldPass,
      actual: result.success,
      passed: testPassed
    });

    console.log(`\n   📝 ผลการทดสอบ: ${expectedResult} → ${actualResult}`);
    console.log(`   ${testPassed ? '✅ ทดสอบผ่าน' : '❌ ทดสอบไม่ผ่าน'}`);
    console.log('─'.repeat(60));
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 สรุปผลการทดสอบ');
  console.log('='.repeat(60));

  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  const percentage = ((passed / total) * 100).toFixed(1);

  console.log(`\n✅ ทดสอบผ่าน: ${passed}/${total} (${percentage}%)`);
  console.log(`❌ ทดสอบไม่ผ่าน: ${total - passed}/${total}`);

  if (passed === total) {
    console.log('\n🎉 ระบบ Login ทำงานได้ถูกต้อง 100%!');
  } else {
    console.log('\n⚠️  ระบบ Login มีปัญหาบางส่วน');
    console.log('\nรายการที่ไม่ผ่าน:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.username}: คาดหวัง ${r.expected ? 'สำเร็จ' : 'ล้มเหลว'} แต่ได้ ${r.actual ? 'สำเร็จ' : 'ล้มเหลว'}`);
    });
  }

  console.log('\n' + '='.repeat(60));
  console.log('📋 บัญชีผู้ใช้ที่ใช้ทดสอบ:');
  console.log('='.repeat(60));
  console.log('👤 Username: owner   | Password: 123456 | Role: OWNER');
  console.log('👤 Username: admin   | Password: 123456 | Role: ADMIN');
  console.log('👤 Username: editor  | Password: 123456 | Role: EDITOR');
  console.log('👤 Username: viewer  | Password: 123456 | Role: VIEWER');
  console.log('='.repeat(60));
}

// Run tests
runLoginTests().catch(console.error);
