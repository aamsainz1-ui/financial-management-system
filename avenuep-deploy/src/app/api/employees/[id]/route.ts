import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const employee = await db.member.findUnique({
      where: { id: (await params).id },
      include: {
        team: true,
        salaries: {
          orderBy: { createdAt: 'desc' }
        },
        bonuses: {
          orderBy: { createdAt: 'desc' }
        },
        commissions: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    return NextResponse.json(employee)
  } catch (error) {
    console.error('Error fetching employee:', error)
    return NextResponse.json({ error: 'Failed to fetch employee' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { name, email, phone, role, position, department, salary, status, teamId } = body

    const employee = await db.member.update({
      where: { id: (await params).id },
      data: {
        name,
        email,
        phone: phone || null,
        role,
        position,
        department,
        salary,
        status,
        teamId: teamId || null
      },
      include: {
        team: true
      }
    })

    return NextResponse.json(employee)
  } catch (error: any) {
    console.error('Error updating employee:', error)
    
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }
    
    return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await db.member.delete({
      where: { id: (await params).id }
    })

    return NextResponse.json({ message: 'Employee deleted successfully' })
  } catch (error) {
    console.error('Error deleting employee:', error)
    return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 })
  }
}