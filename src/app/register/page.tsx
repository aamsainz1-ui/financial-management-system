'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { PinInput } from '@/components/ui/pin-input'
import { UserRole } from '@/lib/auth-client'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    pin: '',
    confirmPin: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (formData.pin !== formData.confirmPin) {
      setError('PIN ไม่ตรงกัน')
      setLoading(false)
      return
    }

    if (formData.pin.length !== 6) {
      setError('กรุณากรอก PIN 6 หลักให้ครบ')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          password: formData.pin, // Send PIN as password
          role: UserRole.VIEWER // Default role for new registrations
        }),
      })

      if (response.ok) {
        router.push('/login?message=สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ')
      } else {
        const data = await response.json()
        setError(data.error || 'การสมัครสมาชิกล้มเหลว')
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">สมัครสมาชิก</CardTitle>
          <CardDescription className="text-center">
            สร้างบัญชีของคุณเพื่อเริ่มใช้งาน
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">ชื่อ-นามสกุล</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="กรอกชื่อ-นามสกุลของคุณ"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">ชื่อผู้ใช้</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="เลือกชื่อผู้ใช้"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-4">
              <Label>PIN 6 หลัก</Label>
              <PinInput
                value={formData.pin}
                onChange={(value) => setFormData(prev => ({ ...prev, pin: value }))}
                length={6}
              />
              <p className="text-xs text-gray-500 text-center">
                กรอกตัวเลข 6 หลักสำหรับเข้าสู่ระบบ
              </p>
            </div>
            <div className="space-y-4">
              <Label>ยืนยัน PIN 6 หลัก</Label>
              <PinInput
                value={formData.confirmPin}
                onChange={(value) => setFormData(prev => ({ ...prev, confirmPin: value }))}
                length={6}
              />
              <p className="text-xs text-gray-500 text-center">
                กรอกตัวเลข 6 หลักอีกครั้งเพื่อยืนยัน
              </p>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={loading || formData.pin.length !== 6 || formData.confirmPin.length !== 6}>
              {loading ? 'กำลังสร้างบัญชี...' : 'สมัครสมาชิก'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-gray-600">มีบัญชีอยู่แล้ว? </span>
            <Link href="/login" className="text-primary hover:underline">
              เข้าสู่ระบบ
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}