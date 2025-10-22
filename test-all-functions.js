// Node.js 18+ has built-in fetch

// Base URL
const BASE_URL = 'http://localhost:3000';

// Test data
const testData = {
  team: {
    name: 'ทีมทดสอบ',
    description: 'ทีมทดสอบระบบ',
    leader_id: 1
  },
  member: {
    name: 'สมาชิกทดสอบ',
    email: 'test@example.com',
    phone: '0800000000',
    team_id: 1,
    position: 'พนักงานทดสอบ'
  },
  customer: {
    name: 'ลูกค้าทดสอบ',
    email: 'customer@test.com',
    phone: '0900000000',
    address: 'ที่อยู่ทดสอบ'
  },
  transaction: {
    description: 'รายการทดสอบ',
    amount: 1000,
    type: 'income',
    category_id: 1,
    member_id: 1,
    customer_id: 1
  },
  category: {
    name: 'หมวดหมู่ทดสอบ',
    description: 'หมวดหมู่สำหรับทดสอบ',
    type: 'expense'
  },
  salary: {
    member_id: 1,
    amount: 15000,
    month: 'มิถุนายน',
    year: 2024,
    bonus: 1000,
    deduction: 500
  },
  bonus: {
    member_id: 1,
    amount: 2000,
    reason: 'โบนัสทดสอบ',
    date: new Date().toISOString()
  },
  commission: {
    member_id: 1,
    customer_id: 1,
    amount: 500,
    percentage: 5,
    description: 'ค่าคอมมิชชันทดสอบ'
  }
};

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
    
    return { success: response.ok, data: result };
  } catch (error) {
    console.error(`\n❌ Error testing ${method} ${endpoint}:`, error.message);
    return { success: false, error: error.message };
  }
}

// Main test function
async function runAllTests() {
  console.log('🧪 เริ่มการทดสอบทุกฟังก์ชัน...\n');
  
  const results = [];
  
  // Test Teams
  console.log('\n📋 ทดสอบ Teams');
  results.push(await testEndpoint('POST', '/api/teams', testData.team));
  
  // Test Members
  console.log('\n👥 ทดสอบ Members');
  results.push(await testEndpoint('POST', '/api/members', testData.member));
  
  // Test Customers
  console.log('\n👤 ทดสอบ Customers');
  results.push(await testEndpoint('POST', '/api/customers', testData.customer));
  
  // Test Categories
  console.log('\n📁 ทดสอบ Categories');
  results.push(await testEndpoint('POST', '/api/categories', testData.category));
  
  // Test Transactions
  console.log('\n💰 ทดสอบ Transactions');
  results.push(await testEndpoint('POST', '/api/transactions', testData.transaction));
  
  // Test Salaries
  console.log('\n💵 ทดสอบ Salaries');
  results.push(await testEndpoint('POST', '/api/salaries', testData.salary));
  
  // Test Bonuses
  console.log('\n🎁 ทดสอบ Bonuses');
  results.push(await testEndpoint('POST', '/api/bonuses', testData.bonus));
  
  // Test Commissions
  console.log('\n📈 ทดสอบ Commissions');
  results.push(await testEndpoint('POST', '/api/commissions', testData.commission));
  
  // Test Customer Transactions
  console.log('\n🔄 ทดสอบ Customer Transactions');
  results.push(await testEndpoint('POST', '/api/customers/transactions', {
    customer_id: 1,
    amount: 500,
    description: 'รายการลูกค้าทดสอบ',
    type: 'payment'
  }));
  
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
  results.push(await testEndpoint('GET', '/api/customers/summary'));
  results.push(await testEndpoint('GET', '/api/customers/stats'));
  results.push(await testEndpoint('GET', '/api/customer-counts'));
  results.push(await testEndpoint('GET', '/api/health'));
  
  // Summary
  console.log('\n📋 สรุปผลการทดสอบ');
  const successCount = results.filter(r => r.success).length;
  const failCount = results.length - successCount;
  
  console.log(`✅ สำเร็จ: ${successCount}/${results.length}`);
  console.log(`❌ ล้มเหลว: ${failCount}/${results.length}`);
  
  if (failCount > 0) {
    console.log('\n❌ รายการที่ล้มเหลว:');
    results.forEach((result, index) => {
      if (!result.success) {
        console.log(`  - Test ${index + 1}: ${result.error || 'Unknown error'}`);
      }
    });
  }
  
  console.log('\n🎉 การทดสอบเสร็จสิ้น!');
}

// Run tests
runAllTests().catch(console.error);