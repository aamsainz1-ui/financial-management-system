import { NextRequest, NextResponse } from 'next/server'
import { memoryStorage } from '@/lib/memory-storage'

export async function GET(request: NextRequest) {
  // Always use memory storage for consistency
  return NextResponse.json(memoryStorage.commissionsList || [])
}

export async function POST(request: NextRequest) {
  let body: any
  try {
    body = await request.json()
    const { memberId, amount, percentage, salesAmount, description, date, time, status, customerId } = body

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

      // Verify customer exists if provided
      if (customerId) {
        const customer = await db.customer.findUnique({
          where: { id: customerId }
        })
        if (!customer) {
          return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
        }
      }

      // Combine date and time if provided
      let finalDate = date ? new Date(date) : new Date()
      if (time) {
        const [hours, minutes] = time.split(':')
        finalDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
      }

      const commission = await db.commission.create({
        data: {
          memberId,
          amount: parseInt(amount),
          percentage: percentage ? parseFloat(percentage) : null,
          salesAmount: salesAmount ? parseInt(salesAmount) : null,
          description: description || null,
          date: finalDate,
          status: status || 'pending',
          customerId: customerId || null
        },
        include: {
          member: {
            include: {
              team: true
            }
          }
        }
      })

      return NextResponse.json(commission, { status: 201 })
    } catch (dbError) {
      // Fallback to memory storage if database fails
      console.log('Database failed, using memory storage for commission creation')
      
      // Find member from memory storage
      const member = memoryStorage.membersList.find(m => m.id === memberId)
      if (!member) {
        return NextResponse.json({ error: 'Member not found' }, { status: 404 })
      }

      // Find customer if provided
      const customer = customerId ? memoryStorage.customers.find(c => c.id === customerId) : null

      // Combine date and time if provided
      let finalDate = date ? new Date(date) : new Date()
      if (time) {
        const [hours, minutes] = time.split(':')
        finalDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
      }

      const newCommission = {
        id: `commission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        memberId,
        amount: parseInt(amount),
        percentage: percentage ? parseFloat(percentage) : null,
        salesAmount: salesAmount ? parseInt(salesAmount) : null,
        description: description || null,
        date: finalDate,
        status: status || 'pending',
        customerId: customerId || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        member: {
          ...member,
          team: member.team || null
        }
      }

      const currentCommissions = memoryStorage.commissionsList || []
      currentCommissions.unshift(newCommission)
      memoryStorage.setCommissions(currentCommissions)
      return NextResponse.json(newCommission, { status: 201 })
    }
  } catch (error) {
    console.error('Error creating commission:', error)
    return NextResponse.json({ error: 'Failed to create commission' }, { status: 500 })
  }
}