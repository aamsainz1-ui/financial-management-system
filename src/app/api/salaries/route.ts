import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { memoryStorage } from '@/lib/memory-storage'

export async function GET(request: NextRequest) {
  try {
    let salaries

    // Try database first
    try {
      salaries = await db.salary.findMany({
        include: {
          member: {
            include: {
              team: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
      
      // If database is empty, fallback to memory storage
      if (salaries.length === 0) {
        console.log('Database is empty, using memory storage for salaries')
        salaries = memoryStorage.salariesList || []
      }
    } catch (dbError) {
      // Fallback to memory storage
      console.log('Database failed, using memory storage for salaries')
      salaries = memoryStorage.salariesList || []
    }

    return NextResponse.json(salaries)
  } catch (error) {
    console.error('Error fetching salaries:', error)
    return NextResponse.json({ error: 'Failed to fetch salaries' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { memberId, amount, payDate, payTime, month, year, description, bonus, deduction, status } = body

    if (!memberId || !amount || !month || !year) {
      return NextResponse.json({ error: 'Member ID, amount, month, and year are required' }, { status: 400 })
    }

    // Try database first
    try {
      // Verify member exists
      const member = await db.member.findUnique({
        where: { id: memberId },
        include: {
          team: true
        }
      })

      if (!member) {
        // Check if database has any members at all
        const dbMemberCount = await db.member.count()
        
        if (dbMemberCount === 0) {
          // Database is empty, fall back to memory storage
          throw new Error('Database is empty')
        } else {
          return NextResponse.json({ error: 'Member not found' }, { status: 404 })
        }
      }

      // Combine date and time if provided
      let finalPayDate = payDate ? new Date(payDate) : new Date()
      if (payTime) {
        const [hours, minutes] = payTime.split(':')
        finalPayDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
      }

      const salary = await db.salary.create({
        data: {
          memberId,
          amount: parseInt(amount),
          payDate: finalPayDate,
          month: parseInt(month),
          year: parseInt(year),
          description: description || null,
          bonus: bonus ? parseInt(bonus) : 0,
          deduction: deduction ? parseInt(deduction) : 0,
          status: status || 'pending'
        },
        include: {
          member: {
            include: {
              team: true
            }
          }
        }
      })

      console.log('Salary created:', salary)
      return NextResponse.json(salary, { status: 201 })
    } catch (dbError) {
      // Fallback to memory storage
      console.log('Database failed, using memory storage for salary creation')
      
      // Find member from memory storage
      const member = memoryStorage.membersList.find(m => m.id === memberId)
      if (!member) {
        return NextResponse.json({ error: 'Member not found' }, { status: 404 })
      }

      // Combine date and time if provided
      let finalPayDate = payDate ? new Date(payDate) : new Date()
      if (payTime) {
        const [hours, minutes] = payTime.split(':')
        finalPayDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
      }

      const newSalary = {
        id: `salary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        memberId,
        amount: parseInt(amount),
        payDate: finalPayDate,
        month: parseInt(month),
        year: parseInt(year),
        description: description || null,
        bonus: bonus ? parseInt(bonus) : 0,
        deduction: deduction ? parseInt(deduction) : 0,
        status: status || 'pending',
        member: {
          ...member,
          team: member.team || null
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Initialize salaries array if it doesn't exist
      if (!memoryStorage.salariesList) {
        memoryStorage.setSalaries([])
      }
      
      const currentSalaries = memoryStorage.salariesList
      currentSalaries.unshift(newSalary)
      memoryStorage.setSalaries(currentSalaries)
      console.log('Salary created in memory storage:', newSalary)
      return NextResponse.json(newSalary, { status: 201 })
    }
  } catch (error) {
    console.error('Error creating salary:', error)
    return NextResponse.json({ error: 'Failed to create salary' }, { status: 500 })
  }
}