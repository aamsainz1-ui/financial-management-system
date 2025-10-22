import { NextRequest, NextResponse } from 'next/server'

// In-memory storage (same as parent route)
// This should be replaced with proper database storage in production
let savedRecords: any[] = []

// Function to get records from parent route's storage
// In a real app, this would be a database query
const getRecords = () => {
  // This is a workaround to access the same data as the parent route
  // In production, use a proper database
  return globalThis.customerCountsRecords || []
}

const setRecords = (records: any[]) => {
  globalThis.customerCountsRecords = records
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const records = getRecords()
    const record = records.find(r => r.id === id)
    
    if (!record) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 })
    }
    
    return NextResponse.json(record)
  } catch (error) {
    console.error('Error fetching customer count:', error)
    return NextResponse.json({ error: 'Failed to fetch customer count' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    const records = getRecords()
    const recordIndex = records.findIndex(r => r.id === id)
    
    if (recordIndex === -1) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 })
    }
    
    // Update the record
    const updatedRecord = {
      ...records[recordIndex],
      newCustomers: data.newCustomers || records[recordIndex].newCustomers,
      depositCustomers: data.depositCustomers || records[recordIndex].depositCustomers,
      expenses: data.expenses || records[recordIndex].expenses,
      totalCustomers: data.totalCustomers || records[recordIndex].totalCustomers,
      averageExpensePerCustomer: data.averageExpensePerCustomer || records[recordIndex].averageExpensePerCustomer,
      teamId: data.teamId !== undefined ? data.teamId : records[recordIndex].teamId,
      teamName: data.teamName || records[recordIndex].teamName,
      updatedAt: new Date().toISOString()
    }
    
    records[recordIndex] = updatedRecord
    setRecords(records)
    
    console.log('Customer count record updated:', updatedRecord)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Record updated successfully',
      data: updatedRecord
    })
  } catch (error) {
    console.error('Error updating customer count:', error)
    return NextResponse.json({ error: 'Failed to update customer count' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const records = getRecords()
    const recordIndex = records.findIndex(r => r.id === id)
    
    if (recordIndex === -1) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 })
    }
    
    const deletedRecord = records[recordIndex]
    records.splice(recordIndex, 1)
    setRecords(records)
    
    console.log('Customer count record deleted:', deletedRecord)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Record deleted successfully',
      data: deletedRecord
    })
  } catch (error) {
    console.error('Error deleting customer count:', error)
    return NextResponse.json({ error: 'Failed to delete customer count' }, { status: 500 })
  }
}