import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const transaction = await db.transaction.findUnique({
      where: { id: (await params).id },
      include: {
        category: true,
        team: true
      }
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error fetching transaction:', error)
    return NextResponse.json({ error: 'Failed to fetch transaction' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { title, description, amount, type, categoryId, teamId, date } = body

    // Get original transaction to update category spent
    const originalTransaction = await db.transaction.findUnique({
      where: { id: (await params).id }
    })

    if (!originalTransaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    const transaction = await db.transaction.update({
      where: { id: (await params).id },
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

    // Update category spent amounts
    if (originalTransaction.type === 'expense') {
      await db.category.update({
        where: { id: originalTransaction.categoryId },
        data: {
          spent: {
            decrement: originalTransaction.amount
          }
        }
      })
    }

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

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('Error updating transaction:', error)
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const transaction = await db.transaction.findUnique({
      where: { id: (await params).id }
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    await db.transaction.delete({
      where: { id: (await params).id }
    })

    // Update category spent amount
    if (transaction.type === 'expense') {
      await db.category.update({
        where: { id: transaction.categoryId },
        data: {
          spent: {
            decrement: transaction.amount
          }
        }
      })
    }

    return NextResponse.json({ message: 'Transaction deleted successfully' })
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 })
  }
}