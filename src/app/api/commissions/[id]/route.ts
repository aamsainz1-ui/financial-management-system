import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { memoryStorage } from '@/lib/memory-storage'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const body = await request.json()
    const { amount, percentage, salesAmount, description, date, status } = body

    // Try database first
    try {
      const commission = await db.commission.update({
        where: { id: resolvedParams.id },
        data: {
          amount,
          percentage,
          salesAmount,
          description,
          date: date ? new Date(date) : undefined,
          status
        },
        include: {
          member: {
            include: {
              team: true
            }
          }
        }
      })

      return NextResponse.json(commission)
    } catch (dbError) {
      // Fallback to memory storage
      console.log('Database update failed, using memory storage:', dbError)
      
      const commissionIndex = memoryStorage.allCommissions.findIndex(c => c.id === resolvedParams.id)
      if (commissionIndex === -1) {
        return NextResponse.json({ error: 'Commission not found' }, { status: 404 })
      }

      const updatedCommission = {
        ...memoryStorage.allCommissions[commissionIndex],
        amount: amount || memoryStorage.allCommissions[commissionIndex].amount,
        percentage: percentage || memoryStorage.allCommissions[commissionIndex].percentage,
        salesAmount: salesAmount || memoryStorage.allCommissions[commissionIndex].salesAmount,
        description: description || memoryStorage.allCommissions[commissionIndex].description,
        date: date || memoryStorage.allCommissions[commissionIndex].date,
        status: status || memoryStorage.allCommissions[commissionIndex].status,
        updatedAt: new Date().toISOString()
      }

      const currentCommissions = memoryStorage.allCommissions || [];
      currentCommissions[commissionIndex] = updatedCommission;
      memoryStorage.setCommissions(currentCommissions);
      return NextResponse.json(updatedCommission)
    }
  } catch (error) {
    console.error('Error updating commission:', error)
    return NextResponse.json({ error: 'Failed to update commission' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params

    // Try database first
    try {
      await db.commission.delete({
        where: { id: resolvedParams.id }
      })
      return NextResponse.json({ message: 'Commission deleted successfully' })
    } catch (dbError) {
      // Fallback to memory storage
      console.log('Database delete failed, using memory storage:', dbError)
      
      const commissionIndex = memoryStorage.allCommissions.findIndex(c => c.id === resolvedParams.id)
      if (commissionIndex === -1) {
        return NextResponse.json({ error: 'Commission not found' }, { status: 404 })
      }

      const currentCommissions = memoryStorage.allCommissions || [];
      currentCommissions.splice(commissionIndex, 1);
      memoryStorage.setCommissions(currentCommissions);
      return NextResponse.json({ message: 'Commission deleted successfully' })
    }
  } catch (error) {
    console.error('Error deleting commission:', error)
    return NextResponse.json({ error: 'Failed to delete commission' }, { status: 500 })
  }
}