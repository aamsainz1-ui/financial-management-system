import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken, createAuditLog } from '@/lib/auth-server'
import { UserRole } from '@/lib/auth-client'
import { getClientIP } from '@/lib/utils'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Check if user is admin
    const currentUser = await db.user.findUnique({
      where: { id: decoded.id },
    })

    if (!currentUser || (currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.OWNER)) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { role } = await request.json()

    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Get old user data for audit
    const oldUser = await db.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    // Update user role
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
    })

    // Create audit log
    await createAuditLog({
      userId: currentUser.id,
      action: 'UPDATE',
      resource: 'USER',
      resourceId: userId,
      oldValue: JSON.stringify({ role: oldUser?.role }),
      newValue: JSON.stringify({ role }),
      ipAddress: getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Role update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}