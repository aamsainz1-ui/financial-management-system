import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken, createAuditLog } from '@/lib/auth'
import { UserRole } from '@/lib/auth-client'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = await verifyToken(token)
    
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Only current OWNER can set new owner
    const currentUser = await db.user.findUnique({
      where: { id: decoded.id }
    })

    if (!currentUser || currentUser.role !== UserRole.OWNER) {
      return NextResponse.json({ error: 'Only OWNER can set new owner' }, { status: 403 })
    }

    const { username } = await request.json()

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    // Find user to promote to owner
    const targetUser = await db.user.findUnique({
      where: { username }
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (!targetUser.isActive) {
      return NextResponse.json({ error: 'User is not active' }, { status: 400 })
    }

    // Update target user to OWNER role
    const updatedUser = await db.user.update({
      where: { id: targetUser.id },
      data: { role: UserRole.OWNER }
    })

    // Create audit log
    await createAuditLog({
      userId: currentUser.id,
      action: 'UPDATE',
      resource: 'USER',
      resourceId: targetUser.id,
      oldValue: JSON.stringify({ role: targetUser.role }),
      newValue: JSON.stringify({ role: UserRole.OWNER }),
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    })

    return NextResponse.json({
      message: `User ${username} has been promoted to OWNER successfully`,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        name: updatedUser.name,
        role: updatedUser.role
      }
    })

  } catch (error) {
    console.error('Set owner error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}