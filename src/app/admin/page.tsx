'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ProtectedRoute, Permission } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/lib/auth-client'
import { ArrowLeft, Home, Activity, Clock, User, Settings, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface User {
  id: string
  email: string
  username: string
  name: string
  role: UserRole
  isActive: boolean
  lastLoginAt?: string
  createdAt: string
}

interface ActivityLog {
  id: string
  userId: string
  user?: {
    id: string
    name: string
    email: string
    role: string
  }
  action: string
  resource: string
  resourceId?: string
  oldValue?: string
  newValue?: string
  ipAddress?: string
  userAgent?: string
  createdAt: string
}

export default function AdminPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [logsLoading, setLogsLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const { user: currentUser } = useAuth()

  useEffect(() => {
    fetchUsers()
    fetchActivityLogs()
  }, [])

  const logActivity = async (action: string, resource: string, resourceId?: string, oldValue?: any, newValue?: any) => {
    try {
      const token = localStorage.getItem('auth_token')
      await fetch('/api/admin/activity-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: currentUser?.id,
          action,
          resource,
          resourceId,
          oldValue,
          newValue,
          ipAddress: '127.0.0.1', // ในระบบจริงควรใช้ IP จริง
          userAgent: navigator.userAgent
        })
      })
    } catch (error) {
      console.error('Failed to log activity:', error)
    }
  }

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      } else {
        setError('Failed to fetch users')
      }
    } catch (error) {
      setError('An error occurred while fetching users')
    } finally {
      setLoading(false)
    }
  }

  const fetchActivityLogs = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch('/api/admin/activity-logs?limit=50', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setActivityLogs(data.logs)
      } else {
        console.error('Failed to fetch activity logs')
      }
    } catch (error) {
      console.error('An error occurred while fetching activity logs')
    } finally {
      setLogsLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    const user = users.find(u => u.id === userId)
    const oldRole = user?.role
    
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        setMessage('User role updated successfully')
        await logActivity('UPDATE', 'USER', userId, { role: oldRole }, { role: newRole })
        fetchUsers()
        fetchActivityLogs()
      } else {
        setError('Failed to update user role')
      }
    } catch (error) {
      setError('An error occurred while updating user role')
    }
  }

  const handleStatusToggle = async (userId: string, isActive: boolean) => {
    const user = users.find(u => u.id === userId)
    const oldStatus = user?.isActive
    
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        setMessage(`User ${isActive ? 'activated' : 'deactivated'} successfully`)
        await logActivity('UPDATE', 'USER', userId, { isActive: oldStatus }, { isActive })
        fetchUsers()
        fetchActivityLogs()
      } else {
        setError('Failed to update user status')
      }
    } catch (error) {
      setError('An error occurred while updating user status')
    }
  }

  const handlePasswordReset = async (userId: string) => {
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMessage(`รีเซ็ต PIN สำเร็จ PIN ใหม่: ${data.newPin}`)
        await logActivity('RESET_PIN', 'USER', userId, null, { newPin: data.newPin })
        fetchActivityLogs()
      } else {
        setError('ไม่สามารถรีเซ็ต PIN ได้')
      }
    } catch (error) {
      setError('เกิดข้อผิดพลาดขณะรีเซ็ต PIN')
    }
  }

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.OWNER:
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case UserRole.ADMIN:
        return 'bg-red-100 text-red-800'
      case UserRole.EDITOR:
        return 'bg-blue-100 text-blue-800'
      case UserRole.VIEWER:
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-800'
      case 'UPDATE':
        return 'bg-blue-100 text-blue-800'
      case 'DELETE':
        return 'bg-red-100 text-red-800'
      case 'LOGIN':
        return 'bg-purple-100 text-purple-800'
      case 'LOGOUT':
        return 'bg-orange-100 text-orange-800'
      case 'RESET_PIN':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'สร้าง'
      case 'UPDATE':
        return 'อัปเดต'
      case 'DELETE':
        return 'ลบ'
      case 'LOGIN':
        return 'เข้าสู่ระบบ'
      case 'LOGOUT':
        return 'ออกจากระบบ'
      case 'RESET_PIN':
        return 'รีเซ็ต PIN'
      default:
        return action
    }
  }

  const getResourceLabel = (resource: string) => {
    switch (resource) {
      case 'USER':
        return 'ผู้ใช้'
      case 'TRANSACTION':
        return 'รายการ'
      case 'TEAM':
        return 'ทีม'
      case 'CUSTOMER':
        return 'ลูกค้า'
      default:
        return resource
    }
  }

  const formatLogDetails = (log: ActivityLog) => {
    try {
      if (log.action === 'RESET_PIN' && log.newValue) {
        const newValue = JSON.parse(log.newValue)
        return `รีเซ็ต PIN เป็น: ${newValue.newPin}`
      }
      if (log.action === 'UPDATE' && log.oldValue && log.newValue) {
        const oldVal = JSON.parse(log.oldValue)
        const newVal = JSON.parse(log.newValue)
        const changes = []
        
        if (oldVal.role !== newVal.role) {
          changes.push(`บทบาท: ${oldVal.role} → ${newVal.role}`)
        }
        if (oldVal.isActive !== newVal.isActive) {
          changes.push(`สถานะ: ${oldVal.isActive ? 'Active' : 'Inactive'} → ${newVal.isActive ? 'Active' : 'Inactive'}`)
        }
        
        return changes.join(', ')
      }
      return `${getActionLabel(log.action)} ${getResourceLabel(log.resource)}`
    } catch (error) {
      return `${getActionLabel(log.action)} ${getResourceLabel(log.resource)}`
    }
  }

  return (
    <ProtectedRoute requiredRole={UserRole.ADMIN}>
      <div className="container mx-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              {currentUser?.role === UserRole.OWNER ? '👑' : '🛡️'} User Management
            </h1>
            <p className="text-gray-600 mt-2">
              {currentUser?.role === UserRole.OWNER 
                ? 'จัดการผู้ใช้ทุกระดับ รวมถึง Admin' 
                : 'Manage user roles and permissions'
              }
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            หน้าแรก
          </Button>
        </div>

        {message && (
          <Alert className="mb-4">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              จัดการผู้ใช้
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              บันทึกกิจกรรม
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading users...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Name</th>
                          <th className="text-left p-2">Email</th>
                          <th className="text-left p-2">Username</th>
                          <th className="text-left p-2">Role</th>
                          <th className="text-left p-2">Status</th>
                          <th className="text-left p-2">Last Login</th>
                          <th className="text-left p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user.id} className="border-b hover:bg-gray-50">
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                {user.name}
                                {user.role === UserRole.OWNER && <span className="text-purple-600">👑</span>}
                              </div>
                            </td>
                            <td className="p-2">{user.email}</td>
                            <td className="p-2">{user.username}</td>
                            <td className="p-2">
                              <Badge className={`${getRoleBadgeColor(user.role)} border`}>
                                {user.role}
                              </Badge>
                            </td>
                            <td className="p-2">
                              <Badge variant={user.isActive ? "default" : "secondary"}>
                                {user.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </td>
                            <td className="p-2">
                              {user.lastLoginAt 
                                ? new Date(user.lastLoginAt).toLocaleDateString()
                                : 'Never'
                              }
                            </td>
                            <td className="p-2">
                              <div className="flex gap-2 flex-wrap">
                                <Permission action="edit">
                                  <select
                                    value={user.role}
                                    onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                                    className="px-2 py-1 border rounded text-sm"
                                    disabled={user.id === currentUser?.id || user.role === UserRole.OWNER}
                                  >
                                    <option value={UserRole.VIEWER}>Viewer</option>
                                    <option value={UserRole.EDITOR}>Editor</option>
                                    <option value={UserRole.ADMIN}>Admin</option>
                                    {currentUser?.role === UserRole.OWNER && (
                                      <option value={UserRole.OWNER}>Owner</option>
                                    )}
                                  </select>
                                </Permission>
                                <Permission action="edit">
                                  <Button
                                    size="sm"
                                    variant={user.isActive ? "destructive" : "default"}
                                    onClick={() => handleStatusToggle(user.id, !user.isActive)}
                                    disabled={user.id === currentUser?.id || user.role === UserRole.OWNER}
                                  >
                                    {user.isActive ? 'Deactivate' : 'Activate'}
                                  </Button>
                                </Permission>
                                <Permission action="edit">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handlePasswordReset(user.id)}
                                    disabled={user.role === UserRole.OWNER && currentUser?.role !== UserRole.OWNER}
                                  >
                                    รีเซ็ต PIN
                                  </Button>
                                </Permission>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  บันทึกกิจกรรมล่าสุด
                </CardTitle>
              </CardHeader>
              <CardContent>
                {logsLoading ? (
                  <div className="text-center py-8">Loading activity logs...</div>
                ) : activityLogs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    ยังไม่มีบันทึกกิจกรรม
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>วันที่/เวลา</TableHead>
                          <TableHead>ผู้ใช้</TableHead>
                          <TableHead>การกระทำ</TableHead>
                          <TableHead>รายละเอียด</TableHead>
                          <TableHead>IP Address</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activityLogs.map((log) => (
                          <TableRow key={log.id} className="hover:bg-gray-50">
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <div>
                                  <div className="text-sm">
                                    {new Date(log.createdAt).toLocaleDateString('th-TH')}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {new Date(log.createdAt).toLocaleTimeString('th-TH')}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                  <User className="w-3 h-3 text-blue-600" />
                                </div>
                                <div>
                                  <div className="font-medium">{log.user?.name || 'Unknown'}</div>
                                  <div className="text-xs text-gray-500">{log.user?.email}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getActionBadgeColor(log.action)}>
                                {getActionLabel(log.action)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {formatLogDetails(log)}
                              </div>
                              {log.resourceId && (
                                <div className="text-xs text-gray-500">
                                  ID: {log.resourceId}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-gray-600">
                                {log.ipAddress || '-'}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}