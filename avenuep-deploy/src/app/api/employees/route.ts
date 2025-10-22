import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const employees = await db.member.findMany({
      include: {
        team: true,
        salaries: {
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        bonuses: {
          where: { status: 'pending' },
          orderBy: { createdAt: 'desc' }
        },
        commissions: {
          where: { status: 'pending' },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(employees)
  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, role, position, department, salary, hireDate, teamId } = body

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    const employee = await db.member.create({
      data: {
        name,
        email,
        phone: phone || null,
        role: role || 'สมาชิก',
        position: position || null,
        department: department || null,
        salary: salary || 0,
        hireDate: hireDate ? new Date(hireDate) : new Date(),
        teamId: teamId || null
      },
      include: {
        team: true
      }
    })

    return NextResponse.json(employee, { status: 201 })
  } catch (error: any) {
    console.error('Error creating employee:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 })
  }
}