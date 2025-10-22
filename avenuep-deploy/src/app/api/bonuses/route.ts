import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const bonuses = await db.bonus.findMany({
      include: {
        member: {
          include: {
            team: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(bonuses)
  } catch (error) {
    console.error('Error fetching bonuses:', error)
    return NextResponse.json({ error: 'Failed to fetch bonuses' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { memberId, amount, reason, date } = body

    if (!memberId || !amount) {
      return NextResponse.json({ error: 'Member ID and amount are required' }, { status: 400 })
    }

    const bonus = await db.bonus.create({
      data: {
        memberId,
        amount,
        reason: reason || null,
        date: date ? new Date(date) : new Date()
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
  } catch (error) {
    console.error('Error creating bonus:', error)
    return NextResponse.json({ error: 'Failed to create bonus' }, { status: 500 })
  }
}