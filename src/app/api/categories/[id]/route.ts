import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { memoryStorage } from '@/lib/memory-storage'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, type, budget, color, icon } = body

    if (!name || !type) {
      return NextResponse.json({ error: 'Name and type are required' }, { status: 400 })
    }

    // Try database first
    try {
      // Check if category exists
      const existingCategory = await db.category.findUnique({
        where: { id }
      })

      if (!existingCategory) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 })
      }

      // Update category
      const updatedCategory = await db.category.update({
        where: { id },
        data: {
          name,
          description: description || '',
          type,
          budget: budget ? parseInt(budget) : existingCategory.budget,
          color: color || existingCategory.color,
          icon: icon || existingCategory.icon
        }
      })

      console.log('Category updated in database:', updatedCategory)
      return NextResponse.json(updatedCategory)
    } catch (dbError) {
      // Fallback to memory storage
      console.log('Database failed, using memory storage for category update')
      
      const categoryIndex = memoryStorage.categories.findIndex(c => c.id === id)
      if (categoryIndex === -1) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 })
      }

      const updatedCategory = {
        ...memoryStorage.categories[categoryIndex],
        name,
        description: description || memoryStorage.categories[categoryIndex].description,
        type,
        budget: budget ? parseInt(budget) : memoryStorage.categories[categoryIndex].budget,
        color: color || memoryStorage.categories[categoryIndex].color,
        icon: icon || memoryStorage.categories[categoryIndex].icon,
        updatedAt: new Date().toISOString()
      }

      memoryStorage.categories[categoryIndex] = updatedCategory
      console.log('Category updated in memory storage:', updatedCategory)
      return NextResponse.json(updatedCategory)
    }
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check if category exists
    const existingCategory = await db.category.findUnique({
      where: { id }
    })

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // Delete category
    await db.category.delete({
      where: { id }
    })

    console.log('Category deleted from database:', existingCategory)

    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}