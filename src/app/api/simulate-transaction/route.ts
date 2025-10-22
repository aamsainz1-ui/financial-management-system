import { NextRequest, NextResponse } from 'next/server'
import { broadcastTransactionUpdate } from '@/lib/socket'
import { memoryStorage } from '@/lib/memory-storage'

export async function POST(request: NextRequest) {
  try {
    const { type } = await request.json()
    
    // Simulate different types of transaction updates
    const updateType = type || 'added'
    
    // Try to get socket.io server
    try {
      const { getServer } = await import('@/lib/socket-server')
      const io = getServer()
      
      if (io) {
        // Broadcast the transaction update to all connected clients
        broadcastTransactionUpdate(io, updateType as 'added' | 'updated' | 'deleted')
        
        return NextResponse.json({ 
          success: true, 
          message: `Transaction ${updateType} event broadcasted via Socket.io`,
          timestamp: new Date().toISOString()
        })
      }
    } catch (socketError) {
      console.log('Socket.io not available, using fallback simulation')
    }
    
    // Fallback: Create a simulated transaction in memory storage
    const simulatedTransaction = {
      id: `simulated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: `รายการจำลอง (${updateType})`,
      description: 'รายการที่สร้างขึ้นจากการจำลองระบบ',
      amount: Math.floor(Math.random() * 10000) + 1000,
      type: Math.random() > 0.5 ? 'income' : 'expense',
      categoryId: memoryStorage.categories[0]?.id || 'default',
      teamId: memoryStorage.allTeams[0]?.id || null,
      memberId: memoryStorage.members[0]?.id || null,
      date: new Date(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      simulated: true
    }

    // Initialize transactions array if it doesn't exist
    if (!memoryStorage.transactions) {
      memoryStorage.transactions = []
    }
    
    // Add to memory storage based on update type
    if (updateType === 'added') {
      memoryStorage.transactions.unshift(simulatedTransaction)
    } else if (updateType === 'updated' && memoryStorage.transactions.length > 0) {
      // Update the first transaction
      memoryStorage.transactions[0] = {
        ...memoryStorage.transactions[0],
        title: 'รายการที่อัปเดต (จำลอง)',
        updatedAt: new Date().toISOString(),
        simulated: true
      }
    } else if (updateType === 'deleted' && memoryStorage.transactions.length > 0) {
      // Remove the first transaction
      memoryStorage.transactions.shift()
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Transaction ${updateType} simulated successfully (fallback mode)`,
      data: simulatedTransaction,
      timestamp: new Date().toISOString(),
      mode: 'fallback'
    })
    
  } catch (error) {
    console.error('Error simulating transaction:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Internal server error' 
    }, { status: 500 })
  }
}