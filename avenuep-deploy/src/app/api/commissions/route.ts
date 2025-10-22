import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const commissions = await db.commission.findMany({
      include: {
        member: {
          include: {
            team: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(commissions)
  } catch (error) {
    console.error('Error fetching commissions:', error)
    return NextResponse.json({ error: 'Failed to fetch commissions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { memberId, amount, percentage, salesAmount, description, date } = body

    if (!memberId || !amount) {
      return NextResponse.json({ error: 'Member ID and amount are required' }, { status: 400 })
    }

    const commission = await db.commission.create({
      data: {
        memberId,
        amount,
        percentage: percentage || null,
        salesAmount: salesAmount || null,
        description: description || null,
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

    return NextResponse.json(commission, { status: 201 })
  } catch (error) {
    console.error('Error creating commission:', error)
    return NextResponse.json({ error: 'Failed to create commission' }, { status: 500 })
  }
}