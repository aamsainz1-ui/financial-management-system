import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken, createAuditLog, hashPassword } from '@/lib/auth-server'
import { getClientIP } from '@/lib/utils'
import { UserRole } from '@/lib/auth-client'

export async function POST(
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

    // Generate a new random 6-digit PIN
    const newPin = Math.floor(100000 + Math.random() * 900000).toString()
    const hashedPin = await hashPassword(newPin)

    // Get old user data for audit
    const oldUser = await db.user.findUnique({
      where: { id: userId },
      select: { password: true }
    })

    // Update user PIN
    await db.user.update({
      where: { id: userId },
      data: { password: hashedPin },
    })

    // Create audit log
    await createAuditLog({
      userId: currentUser.id,
      action: 'UPDATE',
      resource: 'USER',
      resourceId: userId,
      oldValue: JSON.stringify({ pin: '***' }),
      newValue: JSON.stringify({ pin: newPin }),
      ipAddress: getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json({ 
      message: 'รีเซ็ต PIN สำเร็จ',
      newPin 
    })
  } catch (error) {
    console.error('PIN reset error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' }, { status: 500 })
  }
}