import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const salaries = await db.salary.findMany({
      include: {
        member: {
          include: {
            team: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(salaries)
  } catch (error) {
    console.error('Error fetching salaries:', error)
    return NextResponse.json({ error: 'Failed to fetch salaries' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { memberId, amount, payDate, month, year, description } = body

    if (!memberId || !amount || !month || !year) {
      return NextResponse.json({ error: 'Member ID, amount, month, and year are required' }, { status: 400 })
    }

    const salary = await db.salary.create({
      data: {
        memberId,
        amount,
        payDate: payDate ? new Date(payDate) : new Date(),
        month: parseInt(month),
        year: parseInt(year),
        description: description || null
      },
      include: {
        member: {
          include: {
            team: true
          }
        }
      }
    })

    return NextResponse.json(salary, { status: 201 })
  } catch (error) {
    console.error('Error creating salary:', error)
    return NextResponse.json({ error: 'Failed to create salary' }, { status: 500 })
  }
}