import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { amount, payDate, month, year, status, description } = body

    const salary = await db.salary.update({
      where: { id: (await params).id },
      data: {
        amount,
        payDate: payDate ? new Date(payDate) : undefined,
        month: month ? parseInt(month) : undefined,
        year: year ? parseInt(year) : undefined,
        status,
        description
      },
      include: {
        member: {
          include: {
            team: true
          }
        }
      }
    })

    return NextResponse.json(salary)
  } catch (error) {
    console.error('Error updating salary:', error)
    return NextResponse.json({ error: 'Failed to update salary' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await db.salary.delete({
      where: { id: (await params).id }
    })

    return NextResponse.json({ message: 'Salary deleted successfully' })
  } catch (error) {
    console.error('Error deleting salary:', error)
    return NextResponse.json({ error: 'Failed to delete salary' }, { status: 500 })
  }
}