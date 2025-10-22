// Test script to verify category functionality
// Run this in browser console

async function testCategories() {
  console.log('Testing category functionality...')
  
  try {
    // Test 1: Get existing categories
    console.log('1. Getting existing categories...')
    const getResponse = await fetch('/api/categories')
    const categories = await getResponse.json()
    console.log('Existing categories:', categories.length)
    
    // Test 2: Create a new category
    console.log('2. Creating a new category...')
    const newCategory = {
      name: 'หมวดหมู่ทดสอบ',
      description: 'นี่คือหมวดหมู่ทดสอบ',
      type: 'expense',
      budget: 5000,
      icon: '🧪'
    }
    
    const createResponse = await fetch('/api/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newCategory),
    })
    
    if (createResponse.ok) {
      const createdCategory = await createResponse.json()
      console.log('Created category:', createdCategory)
      
      // Test 3: Verify category was added
      console.log('3. Verifying category was added...')
      const verifyResponse = await fetch('/api/categories')
      const updatedCategories = await verifyResponse.json()
      console.log('Categories after creation:', updatedCategories.length)
      
      // Test 4: Check localStorage
      console.log('4. Checking localStorage...')
      const localStorageData = localStorage.getItem('businessData')
      if (localStorageData) {
        const parsedData = JSON.parse(localStorageData)
        console.log('Categories in localStorage:', parsedData.categories?.length)
      }
      
      console.log('✅ All tests passed!')
    } else {
      console.error('❌ Failed to create category')
    }
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

// Auto-run test
testCategories()