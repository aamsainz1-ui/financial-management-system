import { NextRequest, NextResponse } from 'next/server'
import { memoryStorage } from '@/lib/memory-storage'

export async function GET() {
  try {
    const salaries = memoryStorage.getSalaries()
    return NextResponse.json(salaries)
  } catch (error) {
    console.error('Error fetching salaries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch salaries' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const salary = memoryStorage.createSalary({
      memberId: data.memberId,
      month: data.month,
      year: data.year,
      baseSalary: data.baseSalary,
      overtime: data.overtime || 0,
      bonus: data.bonus || 0,
      deduction: data.deduction || 0,
      totalSalary: data.totalSalary,
      paymentDate: data.paymentDate,
      status: data.status || 'pending',
      notes: data.notes,
    })

    return NextResponse.json(salary, { status: 201 })
  } catch (error) {
    console.error('Error creating salary:', error)
    return NextResponse.json(
      { error: 'Failed to create salary' },
      { status: 500 }
    )
  }
}