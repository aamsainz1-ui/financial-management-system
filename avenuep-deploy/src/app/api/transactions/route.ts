import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const transactions = await db.transaction.findMany({
      include: {
        category: true,
        team: true
      },
      orderBy: {
        date: 'desc'
      }
    })
    
    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, amount, type, categoryId, teamId, date } = body

    if (!title || !amount || !type || !categoryId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const transaction = await db.transaction.create({
      data: {
        title,
        description,
        amount: parseInt(amount),
        type,
        categoryId,
        teamId: teamId || null,
        date: date ? new Date(date) : new Date()
      },
      include: {
        category: true,
        team: true
      }
    })

    // Update category spent amount
    if (type === 'expense') {
      await db.category.update({
        where: { id: categoryId },
        data: {
          spent: {
            increment: parseInt(amount)
          }
        }
      })
    }

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
  }
}