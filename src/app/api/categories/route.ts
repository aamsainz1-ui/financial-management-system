import { NextRequest, NextResponse } from 'next/server'
import { memoryStorage } from '@/lib/memory-storage'

export async function GET() {
  try {
    let categories

    // Try database first
    try {
      categories = await db.category.findMany({
        orderBy: {
          createdAt: 'desc'
        }
      })
      
      console.log('Getting categories from database. Total:', categories.length)
    } catch (dbError) {
      // Fallback to memory storage
      console.log('Database failed, using memory storage for categories')
      categories = memoryStorage.allCategories || []
    }
    
    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, type, budget, color, icon } = body

    if (!name || !type) {
      return NextResponse.json({ error: 'Name and type are required' }, { status: 400 })
    }

    // Try database first
    try {
      const newCategory = await db.category.create({
        data: {
          name,
          description: description || '',
          type,
          budget: parseInt(budget) || 0,
          color: color || 'blue',
          icon: icon || (type === 'income' ? '💰' : '📝'),
          spent: 0
        }
      })

      console.log('Category created in database:', newCategory)
      console.log('Total categories after creation:', await db.category.count())

      return NextResponse.json(newCategory, { status: 201 })
    } catch (dbError) {
      // Fallback to memory storage
      console.log('Database failed, using memory storage for category creation')
      
      const newCategory = memoryStorage.createCategory({
        name,
        description: description || '',
        type,
        budget: parseInt(budget) || 0,
        color: color || 'blue',
        icon: icon || (type === 'income' ? '💰' : '📝'),
        spent: 0
      })

      console.log('Category created in memory storage:', newCategory)
      return NextResponse.json(newCategory, { status: 201 })
    }
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}