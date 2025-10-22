import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { UserRole } from '@/lib/auth-client'

export async function POST(request: NextRequest) {
  try {
    // Check if there's already an OWNER in the system
    const existingOwner = await db.user.findFirst({
      where: { role: UserRole.OWNER }
    })

    if (existingOwner) {
      return NextResponse.json({ 
        error: 'System already has an OWNER user',
        currentOwner: {
          id: existingOwner.id,
          username: existingOwner.username,
          name: existingOwner.name
        }
      }, { status: 400 })
    }

    // Get the first active user (preferably ADMIN or EDITOR)
    const firstUser = await db.user.findFirst({
      where: { 
        isActive: true,
        role: { in: [UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER] }
      },
      orderBy: { createdAt: 'asc' }
    })

    if (!firstUser) {
      return NextResponse.json({ error: 'No active users found in the system' }, { status: 404 })
    }

    // Promote the first user to OWNER
    const newOwner = await db.user.update({
      where: { id: firstUser.id },
      data: { role: UserRole.OWNER }
    })

    return NextResponse.json({
      message: `User ${firstUser.username} has been promoted to OWNER successfully`,
      owner: {
        id: newOwner.id,
        username: newOwner.username,
        name: newOwner.name,
        role: newOwner.role
      }
    })

  } catch (error) {
    console.error('Init owner error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const existingOwner = await db.user.findFirst({
      where: { role: UserRole.OWNER },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    })

    if (existingOwner) {
      return NextResponse.json({
        hasOwner: true,
        owner: existingOwner
      })
    } else {
      // Count active users who could be promoted
      const activeUsersCount = await db.user.count({
        where: { 
          isActive: true,
          role: { in: [UserRole.ADMIN, UserRole.EDITOR, UserRole.VIEWER] }
        }
      })

      return NextResponse.json({
        hasOwner: false,
        eligibleUsersCount: activeUsersCount,
        message: activeUsersCount > 0 
          ? `Found ${activeUsersCount} eligible users for promotion`
          : 'No eligible users found for promotion'
      })
    }

  } catch (error) {
    console.error('Check owner status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}