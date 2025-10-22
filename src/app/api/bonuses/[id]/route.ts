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
    const { amount, reason, date, status } = body

    // Try database first
    try {
      const bonus = await db.bonus.update({
        where: { id: resolvedParams.id },
        data: {
          amount,
          reason,
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

      return NextResponse.json(bonus)
    } catch (dbError) {
      // Fallback to memory storage
      console.log('Database update failed, using memory storage:', dbError)
      console.log('Looking for bonus ID:', resolvedParams.id)
      console.log('Available bonus IDs:', memoryStorage.allBonuses.map(b => b.id))
      
      const bonusIndex = memoryStorage.allBonuses.findIndex(b => b.id === resolvedParams.id)
      if (bonusIndex === -1) {
        return NextResponse.json({ error: 'Bonus not found' }, { status: 404 })
      }

      const updatedBonus = {
        ...memoryStorage.allBonuses[bonusIndex],
        amount: amount || memoryStorage.allBonuses[bonusIndex].amount,
        reason: reason || memoryStorage.allBonuses[bonusIndex].reason,
        date: date || memoryStorage.allBonuses[bonusIndex].date,
        status: status || memoryStorage.allBonuses[bonusIndex].status,
        updatedAt: new Date().toISOString()
      }

      const currentBonuses = memoryStorage.allBonuses || [];
      currentBonuses[bonusIndex] = updatedBonus;
      memoryStorage.setBonuses(currentBonuses);
      return NextResponse.json(updatedBonus)
    }
  } catch (error) {
    console.error('Error updating bonus:', error)
    return NextResponse.json({ error: 'Failed to update bonus' }, { status: 500 })
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
      await db.bonus.delete({
        where: { id: resolvedParams.id }
      })
      return NextResponse.json({ message: 'Bonus deleted successfully' })
    } catch (dbError) {
      // Fallback to memory storage
      console.log('Database delete failed, using memory storage:', dbError)
      
      const bonusIndex = memoryStorage.allBonuses.findIndex(b => b.id === resolvedParams.id)
      if (bonusIndex === -1) {
        return NextResponse.json({ error: 'Bonus not found' }, { status: 404 })
      }

      const currentBonuses = memoryStorage.allBonuses || [];
      currentBonuses.splice(bonusIndex, 1);
      memoryStorage.setBonuses(currentBonuses);
      return NextResponse.json({ message: 'Bonus deleted successfully' })
    }
  } catch (error) {
    console.error('Error deleting bonus:', error)
    return NextResponse.json({ error: 'Failed to delete bonus' }, { status: 500 })
  }
}