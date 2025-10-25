'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { UserRole } from '@/lib/auth-client'
import { User, Mail, UserCircle, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    pin: '',
    confirmPin: ''
  })
  const [showPin, setShowPin] = useState(false)
  const [showConfirmPin, setShowConfirmPin] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const validateForm = () => {
    if (!formData.name || !formData.username || !formData.email || !formData.pin || !formData.confirmPin) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน')
      return false
    }

    if (formData.pin.length !== 6) {
      setError('PIN ต้องเป็นตัวเลข 6 หลัก')
      return false
    }

    if (formData.pin !== formData.confirmPin) {
      setError('PIN ไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('รูปแบบอีเมลไม่ถูกต้อง')
      return false
    }

    if (formData.username.length < 3) {
      setError('ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          email: formData.email,
          password: formData.pin,
          role: UserRole.VIEWER
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push('/login?message=สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ')
      } else {
        setError(data.error || 'การสมัครสมาชิกล้มเหลว กรุณาลองใหม่')
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    } finally {
      setLoading(false)
    }
  }

  const pinStrength = () => {
    if (formData.pin.length === 0) return null
    if (formData.pin.length < 6) return 'weak'
    const uniqueDigits = new Set(formData.pin).size
    if (uniqueDigits >= 5) return 'strong'
    if (uniqueDigits >= 3) return 'medium'
    return 'weak'
  }

  const strength = pinStrength()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4">
      <div className="w-full max-w-md">
        <Card className="w-full shadow-xl border-0">
          <CardHeader className="space-y-4 pb-6">
            <div className="text-center space-y-3">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <UserCircle className="w-10 h-10 text-white" />
              </div>
              <div>
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  สมัครสมาชิก
                </CardTitle>
                <CardDescription className="text-gray-600 mt-2">
                  สร้างบัญชีเพื่อเริ่มใช้งานระบบ
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  ชื่อ-นามสกุล
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="กรอกชื่อ-นามสกุลของคุณ"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="h-12 text-base border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  disabled={loading}
                />
              </div>

              {/* Username Field */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <UserCircle className="w-4 h-4" />
                  ชื่อผู้ใช้
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="เลือกชื่อผู้ใช้ (ภาษาอังกฤษหรือตัวเลข)"
                  value={formData.username}
                  onChange={(e) => {
                    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')
                    setFormData(prev => ({ ...prev, username: value }))
                  }}
                  required
                  className="h-12 text-base border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500">
                  ตัวอักษร a-z, ตัวเลข 0-9 และ _ เท่านั้น (อย่างน้อย 3 ตัว)
                </p>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  อีเมล
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="h-12 text-base border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  disabled={loading}
                />
              </div>

              {/* PIN Field */}
              <div className="space-y-2">
                <Label htmlFor="pin" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  PIN 6 หลัก
                </Label>
                <div className="relative">
                  <Input
                    id="pin"
                    name="pin"
                    type={showPin ? "text" : "password"}
                    placeholder="สร้าง PIN 6 หลัก"
                    value={formData.pin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6)
                      setFormData(prev => ({ ...prev, pin: value }))
                    }}
                    required
                    className="h-12 text-base pr-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    maxLength={6}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    tabIndex={-1}
                  >
                    {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">{formData.pin.length}/6 หลัก</span>
                  {strength && (
                    <span className={`flex items-center gap-1 ${
                      strength === 'strong' ? 'text-green-600' :
                      strength === 'medium' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {strength === 'strong' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {strength === 'strong' ? 'แข็งแรง' : strength === 'medium' ? 'ปานกลาง' : 'อ่อนแอ'}
                    </span>
                  )}
                </div>
              </div>

              {/* Confirm PIN Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPin" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  ยืนยัน PIN
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPin"
                    name="confirmPin"
                    type={showConfirmPin ? "text" : "password"}
                    placeholder="กรอก PIN อีกครั้งเพื่อยืนยัน"
                    value={formData.confirmPin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 6)
                      setFormData(prev => ({ ...prev, confirmPin: value }))
                    }}
                    required
                    className="h-12 text-base pr-12 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    maxLength={6}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPin(!showConfirmPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {formData.confirmPin.length === 6 && (
                  <div className="flex items-center gap-1 text-xs">
                    {formData.pin === formData.confirmPin ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        PIN ตรงกัน
                      </span>
                    ) : (
                      <span className="text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        PIN ไม่ตรงกัน
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 text-base font-medium bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all"
                disabled={
                  loading ||
                  formData.pin.length !== 6 ||
                  formData.confirmPin.length !== 6 ||
                  formData.pin !== formData.confirmPin ||
                  !formData.name ||
                  !formData.username ||
                  !formData.email
                }
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    กำลังสร้างบัญชี...
                  </div>
                ) : (
                  'สมัครสมาชิก'
                )}
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm">
              <span className="text-gray-600">มีบัญชีอยู่แล้ว? </span>
              <Link href="/login" className="text-purple-600 hover:text-purple-700 font-medium hover:underline">
                เข้าสู่ระบบ
              </Link>
            </div>

            {/* Info Box */}
            <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4">
              <h4 className="font-semibold text-purple-900 text-sm mb-2">ข้อมูลสำหรับคุณ</h4>
              <ul className="text-xs text-purple-700 space-y-1">
                <li>• PIN จะใช้สำหรับเข้าสู่ระบบ</li>
                <li>• ควรใช้ PIN ที่ไม่ซ้ำกันและจดจำได้ง่าย</li>
                <li>• ข้อมูลของคุณจะถูกเก็บอย่างปลอดภัย</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>© 2025 Financial Management System</p>
          <p className="mt-1">การสมัครสมาชิกฟรี ไม่มีค่าใช้จ่าย</p>
        </div>
      </div>
    </div>
  )
}
