import { NextRequest, NextResponse } from 'next/server'
import { memoryStorage } from '@/lib/memory-storage'
import { getCurrentThaiDate } from '@/lib/timeUtils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDateTime = searchParams.get('startDateTime')
    const endDateTime = searchParams.get('endDateTime')

    let records = memoryStorage.allCustomerCounts || []

    // Apply date-time filter if provided
    if (startDateTime || endDateTime) {
      records = records.filter(record => {
        const recordDate = new Date(record.date)
        
        if (startDateTime) {
          const startDate = new Date(startDateTime)
          if (recordDate < startDate) {
            return false
          }
        }
        
        if (endDateTime) {
          const endDate = new Date(endDateTime)
          if (recordDate > endDate) {
            return false
          }
        }
        
        return true
      })
    }

    console.log('Current Thai Date:', getCurrentThaiDate())
    
    return NextResponse.json({
      records: records,
      currentThaiDate: getCurrentThaiDate(),
      timestamp: new Date().toISOString(),
      filtered: startDateTime || endDateTime ? true : false
    })
  } catch (error) {
    console.error('Error fetching customer counts:', error)
    return NextResponse.json({ error: 'Failed to fetch customer counts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Create a new record with ID and timestamp using Thai time
    const now = new Date()
    const thaiTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Bangkok' }))
    
    const newRecord = {
      id: `record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      newCustomers: data.newCustomers || 0,
      depositCustomers: data.depositCustomers || 0,
      expenses: data.expenses || 0,
      totalCustomers: data.totalCustomers || 0,
      averageExpensePerCustomer: data.averageExpensePerCustomer || 0,
      teamId: data.teamId,
      teamName: data.teamName || 'ไม่ระบุทีม',
      date: data.date || thaiTime.toISOString(),
      createdAt: thaiTime.toISOString()
    }
    
    // Add to memory storage
    memoryStorage.createCustomerCount(newRecord)
    
    console.log('Customer count record saved:', newRecord)
    console.log('Current Thai time:', thaiTime.toISOString())
    
    return NextResponse.json({ 
      success: true, 
      message: 'Data saved successfully',
      data: newRecord,
      currentThaiDate: getCurrentThaiDate()
    })
  } catch (error) {
    console.error('Error creating customer count:', error)
    return NextResponse.json({ error: 'Failed to create customer count' }, { status: 500 })
  }
}