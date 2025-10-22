import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { memoryStorage } from '@/lib/memory-storage'

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting system reset...')
    
    // Clear memory storage first (to prevent re-initialization)
    console.log('Clearing memory storage...')
    memoryStorage.resetAllData()
    console.log('✅ Memory storage cleared')
    
    // Clear database tables
    try {
      console.log('Clearing database tables...')
      
      // Delete all records in correct order to respect foreign key constraints
      await db.transaction.deleteMany({})
      await db.commission.deleteMany({})
      await db.bonus.deleteMany({})
      await db.salary.deleteMany({})
      await db.customer.deleteMany({})
      await db.customerCount.deleteMany({})
      await db.member.deleteMany({})
      await db.category.deleteMany({})
      await db.team.deleteMany({})
      
      console.log('✅ Database cleared successfully')
    } catch (dbError) {
      console.log('Database clear failed, memory storage already cleared:', dbError.message)
    }
    
    // Verify reset by checking counts
    let verificationData = {}
    try {
      const [teamsCount, membersCount, categoriesCount, transactionsCount, customersCount, customerCountsCount] = await Promise.all([
        db.team.count(),
        db.member.count(),
        db.category.count(),
        db.transaction.count(),
        db.customer.count(),
        db.customerCount.count()
      ])
      
      verificationData = {
        database: {
          teams: teamsCount,
          members: membersCount,
          categories: categoriesCount,
          transactions: transactionsCount,
          customers: customersCount,
          customerCounts: customerCountsCount
        },
        memory: {
          teams: memoryStorage.teams.length,
          members: memoryStorage.allMembers.length,
          categories: memoryStorage.categories.length,
          transactions: memoryStorage.transactions?.length || 0,
          customers: memoryStorage.allCustomers.length,
          customerCounts: memoryStorage.allCustomerCounts.length
        }
      }
    } catch (verifyError) {
      console.log('Verification failed:', verifyError.message)
      verificationData = { error: 'Verification failed' }
    }
    
    console.log('🎉 System reset completed!')
    console.log('Verification data:', verificationData)
    
    return NextResponse.json({
      success: true,
      message: 'ระบบถูกรีเซ็ตเรียบร้อยแล้ว',
      timestamp: new Date().toISOString(),
      verification: verificationData
    })
    
  } catch (error) {
    console.error('❌ System reset failed:', error)
    return NextResponse.json({
      success: false,
      error: 'ไม่สามารถรีเซ็ตระบบได้',
      message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
    }, { status: 500 })
  }
}