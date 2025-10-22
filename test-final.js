// Node.js 18+ has built-in fetch

// Base URL
const BASE_URL = 'http://localhost:3000';

// Function to test API endpoints
async function testEndpoint(method, endpoint, data = null) {
  try {
    const config = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data && (method === 'POST' || method === 'PUT')) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const result = await response.json();
    
    console.log(`\n=== ${method} ${endpoint} ===`);
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, JSON.stringify(result, null, 2));
    
    return { success: response.ok, data: result, status: response.status };
  } catch (error) {
    console.error(`\n❌ Error testing ${method} ${endpoint}:`, error.message);
    return { success: false, error: error.message };
  }
}

// Main test function
async function runFinalTest() {
  console.log('🧪 เริ่มการทดสอบสุดท้ายหลังการแก้ไขทั้งหมด...\n');
  
  const results = [];
  
  // First, get existing data to use correct IDs
  console.log('📊 ดึงข้อมูลที่มีอยู่...');
  
  const teamsResponse = await testEndpoint('GET', '/api/teams');
  const membersResponse = await testEndpoint('GET', '/api/members');
  const categoriesResponse = await testEndpoint('GET', '/api/categories');
  const customersResponse = await testEndpoint('GET', '/api/customers');
  
  // Extract existing IDs
  const existingTeam = teamsResponse.success && teamsResponse.data.length > 0 ? teamsResponse.data[0] : null;
  const existingMember = membersResponse.success && membersResponse.data.length > 0 ? membersResponse.data[0] : null;
  const existingCategory = categoriesResponse.success && categoriesResponse.data.length > 0 ? categoriesResponse.data[0] : null;
  const existingCustomer = customersResponse.success && customersResponse.data.length > 0 ? customersResponse.data[0] : null;
  
  console.log('\n🔍 ข้อมูลที่ใช้ทดสอบ:');
  console.log('Team:', existingTeam?.id, existingTeam?.name);
  console.log('Member:', existingMember?.id, existingMember?.name);
  console.log('Category:', existingCategory?.id, existingCategory?.name);
  console.log('Customer:', existingCustomer?.id, existingCustomer?.name);
  
  // Test data with correct existing IDs
  const testData = {
    team: {
      name: 'ทีมทดสอบสุดท้าย',
      description: 'ทีมทดสอบระบบสุดท้าย',
      leader: 'หัวหน้าทีมทดสอบ',
      budget: 50000,
      color: 'blue'
    },
    member: existingTeam ? {
      name: 'สมาชิกทดสอบสุดท้าย',
      phone: '0800000099',
      salary: 25000,
      teamId: existingTeam.id,
      position: 'พนักงานทดสอบ',
      role: 'Tester',
      department: 'QA',
      bankName: 'ธนาคารทดสอบ',
      bankAccount: '1234567899',
      bankBranch: 'สาขาทดสอบ'
    } : null,
    customer: existingTeam && existingMember ? {
      name: 'ลูกค้าทดสอบสุดท้าย',
      phone: '0900000099',
      address: 'ที่อยู่ทดสอบสุดท้าย',
      type: 'new',
      initialAmount: 5000,
      extensionAmount: 1000,
      teamId: existingTeam.id,
      memberId: existingMember.id
    } : null,
    transaction: existingCategory && existingMember ? {
      title: 'รายการทดสอบสุดท้าย',
      description: 'รายการทดสอบระบบสุดท้าย',
      amount: 1000,
      type: 'income',
      categoryId: existingCategory.id,
      memberId: existingMember.id,
      customerId: existingCustomer?.id || null
    } : null,
    category: {
      name: 'หมวดหมู่ทดสอบสุดท้าย',
      description: 'หมวดหมู่สำหรับทดสอบสุดท้าย',
      type: 'expense',
      budget: 10000,
      color: 'purple',
      icon: '🧪'
    },
    salary: existingMember ? {
      memberId: existingMember.id,
      amount: 15000,
      month: 'มิถุนายน',
      year: 2024,
      bonus: 1000,
      deduction: 500,
      status: 'pending'
    } : null,
    bonus: existingMember ? {
      memberId: existingMember.id,
      amount: 2000,
      reason: 'โบนัสทดสอบสุดท้าย',
      date: new Date().toISOString(),
      status: 'pending'
    } : null,
    commission: existingMember && existingCustomer ? {
      memberId: existingMember.id,
      customerId: existingCustomer.id,
      amount: 500,
      percentage: 5,
      description: 'ค่าคอมมิชชันทดสอบสุดท้าย',
      salesAmount: 10000,
      status: 'pending'
    } : null,
    customerTransaction: existingCustomer ? {
      customerId: existingCustomer.id,
      amount: 500,
      description: 'รายการลูกค้าทดสอบสุดท้าย',
      type: 'payment',
      date: new Date().toISOString()
    } : null
  };
  
  // Test Teams
  console.log('\n📋 ทดสอบ Teams');
  results.push(await testEndpoint('POST', '/api/teams', testData.team));
  
  // Test Members
  if (testData.member) {
    console.log('\n👥 ทดสอบ Members');
    results.push(await testEndpoint('POST', '/api/members', testData.member));
    results.push(await testEndpoint('PUT', `/api/members/${existingMember.id}`, { 
      name: `${existingMember.name} (ทดสอบแก้ไข)`, 
      phone: existingMember.phone 
    }));
  }
  
  // Test Customers
  if (testData.customer) {
    console.log('\n👤 ทดสอบ Customers');
    results.push(await testEndpoint('POST', '/api/customers', testData.customer));
  }
  
  if (existingCustomer) {
    results.push(await testEndpoint('PUT', `/api/customers/${existingCustomer.id}`, { 
      name: `${existingCustomer.name} (แก้ไข)`, 
      notes: 'หมายเหตุทดสอบแก้ไข' 
    }));
  }
  
  // Test Categories
  console.log('\n📁 ทดสอบ Categories');
  results.push(await testEndpoint('POST', '/api/categories', testData.category));
  
  if (existingCategory) {
    results.push(await testEndpoint('PUT', `/api/categories/${existingCategory.id}`, { 
      name: `${existingCategory.name} (แก้ไข)`, 
      budget: 600000,
      type: existingCategory.type
    }));
  }
  
  // Test Transactions
  if (testData.transaction) {
    console.log('\n💰 ทดสอบ Transactions');
    results.push(await testEndpoint('POST', '/api/transactions', testData.transaction));
  }
  
  // Test Salaries
  if (testData.salary) {
    console.log('\n💵 ทดสอบ Salaries');
    results.push(await testEndpoint('POST', '/api/salaries', testData.salary));
  }
  
  // Test Bonuses
  if (testData.bonus) {
    console.log('\n🎁 ทดสอบ Bonuses');
    results.push(await testEndpoint('POST', '/api/bonuses', testData.bonus));
  }
  
  // Test Commissions
  if (testData.commission) {
    console.log('\n📈 ทดสอบ Commissions');
    results.push(await testEndpoint('POST', '/api/commissions', testData.commission));
  }
  
  // Test Customer Transactions
  if (testData.customerTransaction) {
    console.log('\n🔄 ทดสอบ Customer Transactions');
    results.push(await testEndpoint('POST', '/api/customers/transactions', testData.customerTransaction));
  }
  
  // Test Simulate Transaction
  console.log('\n🎲 ทดสอบ Simulate Transaction');
  results.push(await testEndpoint('POST', '/api/simulate-transaction', {
    type: 'added'
  }));
  
  // Test GET endpoints
  console.log('\n📊 ทดสอบ GET Endpoints');
  results.push(await testEndpoint('GET', '/api/dashboard'));
  results.push(await testEndpoint('GET', '/api/teams'));
  results.push(await testEndpoint('GET', '/api/members'));
  results.push(await testEndpoint('GET', '/api/customers'));
  results.push(await testEndpoint('GET', '/api/transactions'));
  results.push(await testEndpoint('GET', '/api/categories'));
  results.push(await testEndpoint('GET', '/api/salaries'));
  results.push(await testEndpoint('GET', '/api/bonuses'));
  results.push(await testEndpoint('GET', '/api/commissions'));
  results.push(await testEndpoint('GET', '/api/customers/transactions'));
  results.push(await testEndpoint('GET', '/api/customers/summary'));
  results.push(await testEndpoint('GET', '/api/customers/stats'));
  results.push(await testEndpoint('GET', '/api/customer-counts'));
  results.push(await testEndpoint('GET', '/api/health'));
  
  // Summary
  console.log('\n📋 สรุปผลการทดสอบสุดท้าย');
  const successCount = results.filter(r => r.success).length;
  const failCount = results.length - successCount;
  
  console.log(`✅ สำเร็จ: ${successCount}/${results.length}`);
  console.log(`❌ ล้มเหลว: ${failCount}/${results.length}`);
  console.log(`📈 อัตราความสำเร็จ: ${((successCount/results.length)*100).toFixed(1)}%`);
  
  if (failCount > 0) {
    console.log('\n❌ รายการที่ล้มเหลว:');
    results.forEach((result, index) => {
      if (!result.success) {
        console.log(`  - Test ${index + 1}: Status ${result.status || 'Unknown'} - ${result.error || 'API Error'}`);
      }
    });
  }
  
  if (successCount === results.length) {
    console.log('\n🎉 การแก้ไขปัญหาสำเร็จทั้งหมด! ระบบทำงานได้ปกติ 100%');
  } else if (successCount >= results.length * 0.9) {
    console.log('\n🎉 การแก้ไขปัญหาสำเร็จเกือบทั้งหมด! ระบบทำงานได้ดีมาก');
  } else {
    console.log('\n⚠️ ยังมีปัญหาบางรายการที่ต้องแก้ไขต่อ');
  }
  
  console.log('\n🎉 การทดสอบสุดท้ายเสร็จสิ้น!');
}

// Run tests
runFinalTest().catch(console.error);