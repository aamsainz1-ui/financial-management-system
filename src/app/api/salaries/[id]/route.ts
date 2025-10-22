import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { memoryStorage } from '@/lib/memory-storage'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { amount, payDate, month, year, status, description } = body
    const id = (await params).id

    // Try database first
    try {
      const salary = await db.salary.update({
        where: { id },
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
    } catch (dbError) {
      // Fallback to memory storage
      console.log('Database update failed, using memory storage:', dbError)
      
      const salaryIndex = memoryStorage.allSalaries.findIndex(s => s.id === id)
      if (salaryIndex === -1) {
        return NextResponse.json({ error: 'Salary not found' }, { status: 404 })
      }

      const updatedSalary = {
        ...memoryStorage.allSalaries[salaryIndex],
        amount: amount || memoryStorage.allSalaries[salaryIndex].amount,
        payDate: payDate || memoryStorage.allSalaries[salaryIndex].payDate,
        month: month ? parseInt(month) : memoryStorage.allSalaries[salaryIndex].month,
        year: year ? parseInt(year) : memoryStorage.allSalaries[salaryIndex].year,
        status: status || memoryStorage.allSalaries[salaryIndex].status,
        description: description || memoryStorage.allSalaries[salaryIndex].description,
        updatedAt: new Date().toISOString()
      }

      const currentSalaries = memoryStorage.allSalaries || [];
      currentSalaries[salaryIndex] = updatedSalary;
      memoryStorage.setSalaries(currentSalaries);
      return NextResponse.json(updatedSalary)
    }
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
    const id = (await params).id

    // Try database first
    try {
      await db.salary.delete({
        where: { id }
      })
      return NextResponse.json({ message: 'Salary deleted successfully' })
    } catch (dbError) {
      // Fallback to memory storage
      console.log('Database delete failed, using memory storage:', dbError)
      
      const salaryIndex = memoryStorage.allSalaries.findIndex(s => s.id === id)
      if (salaryIndex === -1) {
        return NextResponse.json({ error: 'Salary not found' }, { status: 404 })
      }

      const currentSalaries = memoryStorage.allSalaries || [];
      currentSalaries.splice(salaryIndex, 1);
      memoryStorage.setSalaries(currentSalaries);
      return NextResponse.json({ message: 'Salary deleted successfully' })
    }
  } catch (error) {
    console.error('Error deleting salary:', error)
    return NextResponse.json({ error: 'Failed to delete salary' }, { status: 500 })
  }
}