import { NextResponse } from 'next/server'
import { memoryStorage } from '@/lib/memory-storage'

export async function POST() {
  try {
    // Reset all data in memory storage
    memoryStorage.resetAllData()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Storage reset successfully. All data cleared.' 
    })
  } catch (error) {
    console.error('Error resetting storage:', error)
    return NextResponse.json({ error: 'Failed to reset storage' }, { status: 500 })
  }
}