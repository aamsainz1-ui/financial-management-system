'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { UserRole } from '@/lib/auth-client'
import { Crown, Users, AlertTriangle, CheckCircle, Shield } from 'lucide-react'

interface User {
  id: string
  username: string
  name: string
  role: UserRole
  isActive: boolean
  lastLoginAt?: string
}

export function OwnerManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUsername, setSelectedUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [currentOwner, setCurrentOwner] = useState<User | null>(null)
  const [hasOwner, setHasOwner] = useState<boolean | null>(null)
  const [eligibleUsersCount, setEligibleUsersCount] = useState(0)

  useEffect(() => {
    fetchUsers()
    checkOwnerStatus()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('auth-token')
      if (!token) {
        console.error('No auth token found')
        return
      }

      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
        const owner = data.users?.find((u: User) => u.role === UserRole.OWNER)
        setCurrentOwner(owner || null)
      } else {
        console.error('Failed to fetch users:', response.status, response.statusText)
        if (response.status === 401 || response.status === 403) {
          setMessage({ type: 'error', text: 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลผู้ใช้' })
        }
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const checkOwnerStatus = async () => {
    try {
      const response = await fetch('/api/auth/init-owner')
      if (response.ok) {
        const data = await response.json()
        setHasOwner(data.hasOwner)
        setEligibleUsersCount(data.eligibleUsersCount || 0)
      }
    } catch (error) {
      console.error('Failed to check owner status:', error)
    }
  }

  const handleLoadSampleData = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/load-sample-data', {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: data.message })
        fetchUsers()
      } else {
        setMessage({ type: 'error', text: data.error || 'ไม่สามารถโหลดข้อมูลตัวอย่างได้' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' })
    } finally {
      setLoading(false)
    }
  }

  const handleInitOwner = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/auth/init-owner', {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: data.message })
        fetchUsers()
        checkOwnerStatus()
      } else {
        setMessage({ type: 'error', text: data.error || 'ไม่สามารถสร้าง Owner ได้' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' })
    } finally {
      setLoading(false)
    }
  }

  const handleSetOwner = async () => {
    if (!selectedUsername.trim()) {
      setMessage({ type: 'error', text: 'กรุณาเลือกผู้ใช้ที่ต้องการแต่งตั้งเป็น Owner' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const token = localStorage.getItem('auth-token')
      if (!token) {
        setMessage({ type: 'error', text: 'ไม่พบข้อมูลการเข้าสู่ระบบ กรุณาเข้าสู่ระบบใหม่' })
        return
      }

      const response = await fetch('/api/auth/set-owner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username: selectedUsername }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: data.message })
        setSelectedUsername('')
        fetchUsers()
      } else {
        setMessage({ type: 'error', text: data.error || 'ไม่สามารถตั้งค่า Owner ได้' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' })
    } finally {
      setLoading(false)
    }
  }

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case UserRole.OWNER:
        return 'default'
      case UserRole.ADMIN:
        return 'secondary'
      case UserRole.EDITOR:
        return 'outline'
      case UserRole.VIEWER:
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.OWNER:
        return 'text-purple-700 bg-purple-100 border-purple-200'
      case UserRole.ADMIN:
        return 'text-blue-700 bg-blue-100 border-blue-200'
      case UserRole.EDITOR:
        return 'text-green-700 bg-green-100 border-green-200'
      case UserRole.VIEWER:
        return 'text-gray-700 bg-gray-100 border-gray-200'
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200'
    }
  }

  const activeUsers = users.filter(user => user.isActive && user.role !== UserRole.OWNER)

  return (
    <div className="space-y-6">
      {/* Current Owner Section */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="text-purple-800 flex items-center gap-2">
            <Crown className="h-5 w-5" />
            เจ้าของระบบปัจจุบัน
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentOwner ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-200 flex items-center justify-center">
                  <Crown className="h-5 w-5 text-purple-700" />
                </div>
                <div>
                  <p className="font-medium text-purple-900">{currentOwner.name}</p>
                  <p className="text-sm text-purple-700">@{currentOwner.username}</p>
                </div>
              </div>
              <Badge className="bg-purple-600 text-white">
                OWNER
              </Badge>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
                <span>ยังไม่มีผู้ใช้ที่เป็น Owner ในระบบ</span>
              </div>
              
              {hasOwner === false && eligibleUsersCount > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-amber-800 mb-3">
                    พบผู้ใช้ที่สามารถแต่งตั้งเป็น Owner ได้ {eligibleUsersCount} คน
                  </p>
                  <Button 
                    onClick={handleInitOwner}
                    disabled={loading}
                    className="w-full bg-amber-600 hover:bg-amber-700"
                  >
                    {loading ? 'กำลังดำเนินการ...' : '🚀 สร้าง Owner คนแรก (อัตโนมัติ)'}
                  </Button>
                  <p className="text-xs text-amber-700 mt-2">
                    ระบบจะเลือกผู้ใช้คนแรกที่สร้างมาเพื่อแต่งตั้งเป็น Owner
                  </p>
                </div>
              )}
              
              {hasOwner === false && eligibleUsersCount === 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 mb-3">
                    ไม่พบผู้ใช้ที่สามารถแต่งตั้งเป็น Owner ได้ กรุณาสร้างผู้ใช้ใหม่ก่อน
                  </p>
                  <Button 
                    onClick={handleLoadSampleData}
                    disabled={loading}
                    variant="outline"
                    className="w-full border-red-200 text-red-700 hover:bg-red-50"
                  >
                    {loading ? 'กำลังดำเนินการ...' : '📊 โหลดข้อมูลตัวอย่าง (ทดสอบ)'}
                  </Button>
                  <p className="text-xs text-red-700 mt-2">
                    โหลดข้อมูลตัวอย่างทีมและสมาชิกเพื่อทดสอบระบบ
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Set New Owner Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            แต่งตั้ง Owner คนใหม่
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              คำเตือน: การแต่งตั้ง Owner คนใหม่จะมอบสิทธิ์การควบคุมระบบสูงสุดให้กับผู้ใช้รายนั้น
              ผู้ใช้ที่เป็น Owner จะสามารถควบคุมทุกอย่างในระบบรวมถึงการจัดการผู้ใช้ Admin ได้
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="user-select">เลือกผู้ใช้ที่จะแต่งตั้งเป็น Owner</Label>
            <Select value={selectedUsername} onValueChange={setSelectedUsername}>
              <SelectTrigger>
                <SelectValue placeholder="เลือกผู้ใช้..." />
              </SelectTrigger>
              <SelectContent>
                {activeUsers.map((user) => (
                  <SelectItem key={user.id} value={user.username}>
                    <div className="flex items-center gap-2">
                      <span>{user.name}</span>
                      <span className="text-gray-500">(@{user.username})</span>
                      <Badge variant={getRoleBadgeVariant(user.role)} className="ml-2">
                        {user.role}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleSetOwner}
            disabled={loading || !selectedUsername}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {loading ? 'กำลังดำเนินการ...' : 'แต่งตั้งเป็น Owner'}
          </Button>

          {message && (
            <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              {message.type === 'success' ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {message.text}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* All Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            รายชื่อผู้ใช้ทั้งหมดในระบบ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {users.map((user) => (
              <div 
                key={user.id} 
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  user.role === UserRole.OWNER 
                    ? 'border-purple-200 bg-purple-50' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    user.role === UserRole.OWNER 
                      ? 'bg-purple-200' 
                      : 'bg-gray-200'
                  }`}>
                    {user.role === UserRole.OWNER ? (
                      <Crown className="h-4 w-4 text-purple-700" />
                    ) : (
                      <Users className="h-4 w-4 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500">@{user.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={getRoleBadgeVariant(user.role)}
                    className={getRoleColor(user.role)}
                  >
                    {user.role}
                  </Badge>
                  {!user.isActive && (
                    <Badge variant="outline" className="text-red-600 border-red-200">
                      ไม่ active
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}