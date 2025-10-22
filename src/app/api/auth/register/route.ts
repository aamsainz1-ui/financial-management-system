import { NextRequest, NextResponse } from 'next/server'
import { createUser, createAuditLog } from '@/lib/auth-server'
import { UserRole } from '@/lib/auth-client'
import { db } from '@/lib/db'
import { getClientIP } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const { email, username, password, name, role = UserRole.VIEWER } = await request.json()

    if (!email || !username || !password || !name) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' },
        { status: 400 }
      )
    }

    // Validate PIN (password field now contains PIN)
    if (!/^\d{6}$/.test(password)) {
      return NextResponse.json(
        { error: 'PIN ต้องเป็นตัวเลข 6 หลักเท่านั้น' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'มีผู้ใช้อีเมลหรือชื่อผู้ใช้นี้อยู่แล้ว' },
        { status: 409 }
      )
    }

    const user = await createUser({ email, username, password, name, role })

    // Create audit log
    await createAuditLog({
      userId: user.id,
      action: 'CREATE',
      resource: 'USER',
      resourceId: user.id,
      newValue: JSON.stringify({ email, username, name, role }),
      ipAddress: getClientIP(request),
      userAgent: request.headers.get('user-agent') || 'unknown',
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์' },
      { status: 500 }
    )
  }
}