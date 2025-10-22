import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const body = await request.json()
    const { amount, percentage, salesAmount, description, date, status } = body

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
    await db.commission.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({ message: 'Commission deleted successfully' })
  } catch (error) {
    console.error('Error deleting commission:', error)
    return NextResponse.json({ error: 'Failed to delete commission' }, { status: 500 })
  }
}