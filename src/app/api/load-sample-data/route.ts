import { NextRequest, NextResponse } from 'next/server'
import { memoryStorage } from '@/lib/memory-storage'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Loading sample data...')
    
    // Load sample data manually
    memoryStorage.loadSampleDataManually()
    
    console.log('✅ Sample data loaded successfully')
    
    return NextResponse.json({
      success: true,
      message: 'โหลดข้อมูลตัวอย่างเรียบร้อยแล้ว',
      timestamp: new Date().toISOString(),
      data: {
        teams: memoryStorage.allTeams.length,
        members: memoryStorage.allMembers.length,
        customers: memoryStorage.allCustomers.length,
        customerCounts: memoryStorage.allCustomerCounts.length,
        salaries: memoryStorage.allSalaries.length,
        bonuses: memoryStorage.allBonuses.length,
        commissions: memoryStorage.allCommissions.length,
        categories: memoryStorage.allCategories.length,
        transactions: memoryStorage.allTransactions.length,
        incomeCategories: memoryStorage.allCategories.filter(c => c.type === 'income').length,
        expenseCategories: memoryStorage.allCategories.filter(c => c.type === 'expense').length,
        incomeTransactions: memoryStorage.allTransactions.filter(t => t.type === 'income').length,
        expenseTransactions: memoryStorage.allTransactions.filter(t => t.type === 'expense').length,
        totalIncome: memoryStorage.allTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
        totalExpense: memoryStorage.allTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
      }
    })
    
  } catch (error) {
    console.error('❌ Failed to load sample data:', error)
    return NextResponse.json({
      success: false,
      error: 'ไม่สามารถโหลดข้อมูลตัวอย่างได้',
      message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
    }, { status: 500 })
  }
}