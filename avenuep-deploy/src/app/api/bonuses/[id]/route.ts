import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const body = await request.json()
    const { amount, reason, date, status } = body

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
    await db.bonus.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({ message: 'Bonus deleted successfully' })
  } catch (error) {
    console.error('Error deleting bonus:', error)
    return NextResponse.json({ error: 'Failed to delete bonus' }, { status: 500 })
  }
}