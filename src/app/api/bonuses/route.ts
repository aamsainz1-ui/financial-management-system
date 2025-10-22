import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { memoryStorage } from '@/lib/memory-storage'

export async function GET(request: NextRequest) {
  // Always use memory storage for consistency
  console.log('Getting bonuses from memory storage. Total:', memoryStorage.bonusesList?.length || 0)
  return NextResponse.json(memoryStorage.bonusesList || [])
}

export async function POST(request: NextRequest) {
  let body: any
  try {
    body = await request.json()
    const { memberId, amount, reason, date, time, status } = body

    if (!memberId || !amount) {
      return NextResponse.json({ error: 'Member ID and amount are required' }, { status: 400 })
    }

    // Try database first
    try {
      // Verify member exists
      const member = await db.member.findUnique({
        where: { id: memberId },
        include: {
          team: true
        }
      })

      if (!member) {
        // Check if database has any members at all
        const dbMemberCount = await db.member.count()
        
        if (dbMemberCount === 0) {
          // Database is empty, fall back to memory storage
          throw new Error('Database is empty')
        } else {
          return NextResponse.json({ error: 'Member not found' }, { status: 404 })
        }
      }

      // Combine date and time if provided
      let finalDate = date ? new Date(date) : new Date()
      if (time) {
        const [hours, minutes] = time.split(':')
        finalDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
      }

      const bonus = await db.bonus.create({
        data: {
          memberId,
          amount: parseInt(amount),
          reason: reason || null,
          date: finalDate,
          status: status || 'pending'
        },
        include: {
          member: {
            include: {
              team: true
            }
          }
        }
      })

      return NextResponse.json(bonus, { status: 201 })
    } catch (dbError) {
      // Fallback to memory storage if database fails
      console.log('Database failed, using memory storage for bonus creation')
      
      // Find member from memory storage
      const member = memoryStorage.membersList.find(m => m.id === memberId)
      if (!member) {
        return NextResponse.json({ error: 'Member not found' }, { status: 404 })
      }

      // Combine date and time if provided
      let finalDate = date ? new Date(date) : new Date()
      if (time) {
        const [hours, minutes] = time.split(':')
        finalDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
      }

      const newBonus = {
        id: `bonus_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        memberId,
        amount: parseInt(amount),
        reason: reason || null,
        date: finalDate,
        status: status || 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        member: {
          ...member,
          team: member.team || null
        }
      }

      const currentBonuses = memoryStorage.bonusesList || []
      currentBonuses.unshift(newBonus)
      memoryStorage.setBonuses(currentBonuses)
      console.log('Bonus added to memory storage. Total bonuses:', currentBonuses.length)
      return NextResponse.json(newBonus, { status: 201 })
    }
  } catch (error) {
    console.error('Error creating bonus:', error)
    return NextResponse.json({ error: 'Failed to create bonus' }, { status: 500 })
  }
}