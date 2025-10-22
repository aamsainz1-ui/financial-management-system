'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { DateTimeFilterComponent, DateTimeFilter } from '@/components/ui/date-time-picker'
import { Plus, Users, UserPlus, TrendingUp, Calculator, DollarSign, Save, Edit, Trash2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

interface CustomerCounts {
  newCustomers: number
  depositCustomers: number
  expenses: number
  totalCustomers: number
  averageExpensePerCustomer: number
  teamId?: string
}

interface Team {
  id: string
  name: string
}

export function CustomerCounter() {
  const [counts, setCounts] = useState<CustomerCounts>({
    newCustomers: 0,
    depositCustomers: 0,
    expenses: 0,
    totalCustomers: 0,
    averageExpensePerCustomer: 0,
    teamId: 'none'
  })

  const [tempValues, setTempValues] = useState<CustomerCounts>({
    newCustomers: 0,
    depositCustomers: 0,
    expenses: 0,
    totalCustomers: 0,
    averageExpensePerCustomer: 0,
    teamId: 'none'
  })

  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(false)
  const [savedRecords, setSavedRecords] = useState<any[]>([])
  const [dateTimeFilter, setDateTimeFilter] = useState<DateTimeFilter>({
    startDateTime: '',
    endDateTime: ''
  })

  // Edit and Delete states
  const [editingRecord, setEditingRecord] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    newCustomers: 0,
    depositCustomers: 0,
    expenses: 0,
    teamId: 'none'
  })

  useEffect(() => {
    fetchTeams()
    fetchSavedRecords()
  }, [dateTimeFilter])

  const fetchTeams = async () => {
    try {
      const response = await fetch('/api/teams')
      if (response.ok) {
        const teamsData = await response.json()
        setTeams(teamsData)
      }
    } catch (error) {
      console.error('Error fetching teams:', error)
    }
  }

  const fetchSavedRecords = async () => {
    try {
      let url = '/api/customer-counts'
      if (dateTimeFilter.startDateTime || dateTimeFilter.endDateTime) {
        const params = new URLSearchParams()
        if (dateTimeFilter.startDateTime) {
          params.append('startDateTime', dateTimeFilter.startDateTime)
        }
        if (dateTimeFilter.endDateTime) {
          params.append('endDateTime', dateTimeFilter.endDateTime)
        }
        url += `?${params.toString()}`
      }

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        console.log('Customer counts data:', data)
        
        // Handle both old format (direct array) and new format (object with records)
        if (Array.isArray(data)) {
          setSavedRecords(data)
        } else if (data && data.records) {
          setSavedRecords(data.records)
          console.log('Current Thai Date:', data.currentThaiDate)
          console.log('Filtered:', data.filtered)
        }
      }
    } catch (error) {
      console.error('Error fetching saved records:', error)
    }
  }

  const handleInputChange = (field: keyof CustomerCounts, value: string) => {
    if (field === 'teamId') {
      setTempValues(prev => ({
        ...prev,
        [field]: value
      }))
    } else {
      const numValue = parseInt(value) || 0
      setTempValues(prev => ({
        ...prev,
        [field]: numValue
      }))
    }
  }

  const handleAddCount = (field: keyof CustomerCounts, amount: number) => {
    setCounts(prev => ({
      ...prev,
      [field]: Math.max(0, prev[field] + amount)
    }))
  }

  const handleSetCount = (field: keyof CustomerCounts) => {
    setCounts(prev => ({
      ...prev,
      [field]: tempValues[field]
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const totalCustomers = counts.newCustomers + counts.depositCustomers
      const averageExpensePerCustomer = counts.depositCustomers > 0 ? counts.expenses / counts.depositCustomers : 0
      
      // Get team name
      const selectedTeam = teams.find(t => t.id === counts.teamId)
      const teamName = counts.teamId === 'none' ? 'ไม่ระบุทีม' : (selectedTeam?.name || 'ไม่ระบุทีม')
      
      const data = {
        newCustomers: counts.newCustomers,
        depositCustomers: counts.depositCustomers,
        expenses: counts.expenses,
        totalCustomers: totalCustomers,
        averageExpensePerCustomer: averageExpensePerCustomer,
        teamId: counts.teamId === 'none' ? null : counts.teamId,
        teamName: teamName,
        date: new Date().toISOString()
      }

      const response = await fetch('/api/customer-counts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        await fetchSavedRecords()
        alert('บันทึกข้อมูลสำเร็จ!')
      } else {
        alert('บันทึกข้อมูลไม่สำเร็จ')
      }
    } catch (error) {
      console.error('Error saving data:', error)
      alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setCounts({
      newCustomers: 0,
      depositCustomers: 0,
      expenses: 0,
      totalCustomers: 0,
      averageExpensePerCustomer: 0,
      teamId: 'none'
    })
    setTempValues({
      newCustomers: 0,
      depositCustomers: 0,
      expenses: 0,
      totalCustomers: 0,
      averageExpensePerCustomer: 0,
      teamId: 'none'
    })
  }

  const handleDateTimeFilterChange = (filter: DateTimeFilter) => {
    setDateTimeFilter(filter)
  }

  const handleClearDateTimeFilter = () => {
    setDateTimeFilter({ startDateTime: '', endDateTime: '' })
  }

  // Edit functions
  const handleEditRecord = (record: any) => {
    setEditingRecord(record)
    setEditForm({
      newCustomers: record.newCustomers,
      depositCustomers: record.depositCustomers,
      expenses: record.expenses,
      teamId: record.teamId || 'none'
    })
    setIsEditDialogOpen(true)
  }

  const handleEditInputChange = (field: string, value: string) => {
    if (field === 'teamId') {
      setEditForm(prev => ({ ...prev, [field]: value }))
    } else {
      const numValue = parseInt(value) || 0
      setEditForm(prev => ({ ...prev, [field]: numValue }))
    }
  }

  const handleUpdateRecord = async () => {
    if (!editingRecord) return

    try {
      const totalCustomers = editForm.newCustomers + editForm.depositCustomers
      const averageExpensePerCustomer = editForm.depositCustomers > 0 ? editForm.expenses / editForm.depositCustomers : 0
      
      // Get team name
      const selectedTeam = teams.find(t => t.id === editForm.teamId)
      const teamName = editForm.teamId === 'none' ? 'ไม่ระบุทีม' : (selectedTeam?.name || 'ไม่ระบุทีม')

      const response = await fetch(`/api/customer-counts/${editingRecord.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newCustomers: editForm.newCustomers,
          depositCustomers: editForm.depositCustomers,
          expenses: editForm.expenses,
          totalCustomers: totalCustomers,
          averageExpensePerCustomer: averageExpensePerCustomer,
          teamId: editForm.teamId === 'none' ? null : editForm.teamId,
          teamName: teamName,
        }),
      })

      if (response.ok) {
        await fetchSavedRecords()
        setIsEditDialogOpen(false)
        setEditingRecord(null)
        alert('อัพเดทข้อมูลสำเร็จ!')
      } else {
        alert('อัพเดทข้อมูลไม่สำเร็จ')
      }
    } catch (error) {
      console.error('Error updating record:', error)
      alert('เกิดข้อผิดพลาดในการอัพเดทข้อมูล')
    }
  }

  // Delete function
  const handleDeleteRecord = async (recordId: string) => {
    try {
      const response = await fetch(`/api/customer-counts/${recordId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchSavedRecords()
        alert('ลบข้อมูลสำเร็จ!')
      } else {
        alert('ลบข้อมูลไม่สำเร็จ')
      }
    } catch (error) {
      console.error('Error deleting record:', error)
      alert('เกิดข้อผิดพลาดในการลบข้อมูล')
    }
  }

  const calculateTotal = () => {
    return counts.newCustomers + counts.depositCustomers
  }

  const calculateAverageExpensePerCustomer = () => {
    return counts.depositCustomers > 0 ? counts.expenses / counts.depositCustomers : 0
  }

  const calculateProgress = () => {
    const total = calculateTotal()
    const target = 100 // กำหนดเป้าหมายเริ่มต้นที่ 100
    return Math.min((total / target) * 100, 100)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">จำนวนลูกค้า</h1>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={loading} className="bg-green-600 hover:bg-green-700">
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'กำลังบันทึก...' : 'บันทึก'}
          </Button>
          <Button onClick={handleReset} variant="outline">
            รีเซ็ตทั้งหมด
          </Button>
        </div>
      </div>

      {/* Date-Time Filter */}
      <DateTimeFilterComponent
        filter={dateTimeFilter}
        onFilterChange={handleDateTimeFilterChange}
        onClearFilter={handleClearDateTimeFilter}
      />

      {/* เลือกทีม */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            เลือกทีม
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="team">ทีมที่บันทึกข้อมูล</Label>
              <Select 
                value={counts.teamId || "none"} 
                onValueChange={(value) => {
                  const newTeamId = value === "none" ? "none" : value
                  setCounts(prev => ({ ...prev, teamId: newTeamId }))
                  setTempValues(prev => ({ ...prev, teamId: newTeamId }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกทีม" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">ไม่ระบุทีม</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {counts.teamId && counts.teamId !== 'none' && teams.find(t => t.id === counts.teamId) && (
                <p className="text-sm text-gray-500">
                  ทีมที่เลือก: {teams.find(t => t.id === counts.teamId)?.name}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>สถานะการบันทึก</Label>
              <div className="p-3 border rounded-lg bg-gray-50">
                <p className="text-sm text-gray-600">
                  {counts.teamId && counts.teamId !== 'none' 
                    ? `พร้อมบันทึกข้อมูลสำหรับทีม: ${teams.find(t => t.id === counts.teamId)?.name}`
                    : 'จะบันทึกข้อมูลโดยไม่ระบุทีม'
                  }
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ส่วนเพิ่มจำนวนลูกค้าแบบตัวเลข */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            จำนวนลูกค้า
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. ลูกค้าใหม่ */}
            <div className="space-y-2">
              <Label htmlFor="newCustomers">ลูกค้าใหม่</Label>
              <Input
                id="newCustomers"
                type="number"
                min="0"
                value={counts.newCustomers}
                onChange={(e) => setCounts(prev => ({ ...prev, newCustomers: parseInt(e.target.value) || 0 }))}
                placeholder="0"
                className="text-center"
              />
            </div>

            {/* 2. ลูกค้าฝาก */}
            <div className="space-y-2">
              <Label htmlFor="depositCustomers">ลูกค้าฝาก</Label>
              <Input
                id="depositCustomers"
                type="number"
                min="0"
                value={counts.depositCustomers}
                onChange={(e) => setCounts(prev => ({ ...prev, depositCustomers: parseInt(e.target.value) || 0 }))}
                placeholder="0"
                className="text-center"
              />
            </div>

            {/* 3. ยอดค่าใช้จ่าย */}
            <div className="space-y-2">
              <Label htmlFor="expenses">ยอดค่าใช้จ่าย</Label>
              <Input
                id="expenses"
                type="number"
                min="0"
                value={counts.expenses}
                onChange={(e) => setCounts(prev => ({ ...prev, expenses: parseInt(e.target.value) || 0 }))}
                placeholder="0"
                className="text-center"
              />
            </div>
          </div>

          {/* แสดงรวมและค่าเฉลี่ย */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* รวมลูกค้าทั้งหมด */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">จำนวนลูกค้าทั้งหมด</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {counts.newCustomers + counts.depositCustomers}
                  </p>
                </div>
                <Users className="h-10 w-10 text-blue-500" />
              </div>
            </div>

            {/* ค่าเฉลี่ยต่อลูกค้าฝาก */}
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">ค่าเฉลี่ยต่อลูกค้าฝาก</p>
                  <p className="text-3xl font-bold text-green-600">
                    {calculateAverageExpensePerCustomer().toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">บาทต่อคน</p>
                </div>
                <Calculator className="h-10 w-10 text-green-500" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* รายงานการบันทึกข้อมูล */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            รายงานการบันทึกข้อมูลลูกค้า
            {(dateTimeFilter.startDateTime || dateTimeFilter.endDateTime) && (
              <Badge variant="secondary" className="ml-2">
                กรองตามวันที่
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {savedRecords.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {dateTimeFilter.startDateTime || dateTimeFilter.endDateTime 
                ? 'ไม่พบข้อมูลในช่วงเวลาที่เลือก' 
                : 'ยังไม่มีข้อมูลที่บันทึก'
              }
            </p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {savedRecords.map((record, index) => (
                <div key={record.id || index} className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold text-sm">
                          {new Date(record.date).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {record.teamName}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div className="bg-blue-100 p-2 rounded">
                          <p className="text-blue-700 font-medium">ลูกค้าใหม่</p>
                          <p className="text-blue-900 font-bold">{record.newCustomers} คน</p>
                        </div>
                        <div className="bg-green-100 p-2 rounded">
                          <p className="text-green-700 font-medium">ลูกค้าฝาก</p>
                          <p className="text-green-900 font-bold">{record.depositCustomers} คน</p>
                        </div>
                        <div className="bg-orange-100 p-2 rounded">
                          <p className="text-orange-700 font-medium">ค่าใช้จ่าย</p>
                          <p className="text-orange-900 font-bold">฿{(record.expenses || 0).toLocaleString()}</p>
                        </div>
                        <div className="bg-purple-100 p-2 rounded">
                          <p className="text-purple-700 font-medium">ค่าเฉลี่ย</p>
                          <p className="text-purple-900 font-bold">฿{record.averageExpensePerCustomer.toFixed(2)}</p>
                        </div>
                      </div>
                      
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-600">
                          <span className="font-medium">รวมทั้งหมด:</span> {record.totalCustomers} คน
                          <span className="ml-3 font-medium">ทีม:</span> {record.teamName}
                        </p>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditRecord(record)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>ยืนยันการลบรายการ</AlertDialogTitle>
                            <AlertDialogDescription>
                              คุณต้องการลบรายการลูกค้าจากวันที่ {new Date(record.date).toLocaleDateString('th-TH')} ใช่หรือไม่?
                              การดำเนินการนี้ไม่สามารถย้อนกลับได้
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteRecord(record.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              ลบ
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>แก้ไขรายการลูกค้า</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-newCustomers">ลูกค้าใหม่</Label>
                <Input
                  id="edit-newCustomers"
                  type="number"
                  value={editForm.newCustomers}
                  onChange={(e) => handleEditInputChange('newCustomers', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-depositCustomers">ลูกค้าฝาก</Label>
                <Input
                  id="edit-depositCustomers"
                  type="number"
                  value={editForm.depositCustomers}
                  onChange={(e) => handleEditInputChange('depositCustomers', e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-expenses">ค่าใช้จ่าย</Label>
              <Input
                id="edit-expenses"
                type="number"
                value={editForm.expenses}
                onChange={(e) => handleEditInputChange('expenses', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-team">ทีม</Label>
              <Select value={editForm.teamId} onValueChange={(value) => handleEditInputChange('teamId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกทีม" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">ไม่ระบุทีม</SelectItem>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4">
              <Button onClick={handleUpdateRecord} className="flex-1">
                บันทึกการแก้ไข
              </Button>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                ยกเลิก
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}