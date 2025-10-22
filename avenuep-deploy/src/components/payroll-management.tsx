'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { DollarSign, Plus, Edit, Trash2, Calendar, Gift, TrendingUp, CheckCircle, Clock, XCircle } from 'lucide-react'
import { api } from '@/lib/api'

interface Employee {
  id: string
  name: string
  email: string
  team?: {
    name: string
  }
}

interface Salary {
  id: string
  amount: number
  payDate: string
  month: number
  year: number
  status: string
  description?: string
  member: Employee
}

interface Bonus {
  id: string
  amount: number
  reason?: string
  date: string
  status: string
  member: Employee
}

interface Commission {
  id: string
  amount: number
  percentage?: number
  salesAmount?: number
  description?: string
  date: string
  status: string
  member: Employee
}

export function PayrollManagement() {
  const [salaries, setSalaries] = useState<Salary[]>([])
  const [bonuses, setBonuses] = useState<Bonus[]>([])
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('salaries')

  // Dialog states
  const [isSalaryDialogOpen, setIsSalaryDialogOpen] = useState(false)
  const [isBonusDialogOpen, setIsBonusDialogOpen] = useState(false)
  const [isCommissionDialogOpen, setIsCommissionDialogOpen] = useState(false)

  // Form states
  const [salaryForm, setSalaryForm] = useState({
    memberId: '',
    amount: '',
    payDate: '',
    month: '',
    year: new Date().getFullYear().toString(),
    description: ''
  })

  const [bonusForm, setBonusForm] = useState({
    memberId: '',
    amount: '',
    reason: '',
    date: ''
  })

  const [commissionForm, setCommissionForm] = useState({
    memberId: '',
    amount: '',
    percentage: '',
    salesAmount: '',
    description: '',
    date: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [salariesData, bonusesData, commissionsData, employeesData] = await Promise.all([
        api.salaries.getAll(),
        api.bonuses.getAll(),
        api.commissions.getAll(),
        api.employees.getAll()
      ])
      setSalaries(salariesData)
      setBonuses(bonusesData)
      setCommissions(commissionsData)
      setEmployees(employeesData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSalary = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.salaries.create(salaryForm)
      await fetchData()
      setIsSalaryDialogOpen(false)
      resetSalaryForm()
    } catch (error) {
      console.error('Error creating salary:', error)
    }
  }

  const handleCreateBonus = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.bonuses.create(bonusForm)
      await fetchData()
      setIsBonusDialogOpen(false)
      resetBonusForm()
    } catch (error) {
      console.error('Error creating bonus:', error)
    }
  }

  const handleCreateCommission = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.commissions.create(commissionForm)
      await fetchData()
      setIsCommissionDialogOpen(false)
      resetCommissionForm()
    } catch (error) {
      console.error('Error creating commission:', error)
    }
  }

  const handleUpdateStatus = async (type: 'salary' | 'bonus' | 'commission', id: string, status: string) => {
    try {
      if (type === 'salary') {
        await api.salaries.update(id, { status })
      } else if (type === 'bonus') {
        await api.bonuses.update(id, { status })
      } else {
        await api.commissions.update(id, { status })
      }
      await fetchData()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleDelete = async (type: 'salary' | 'bonus' | 'commission', id: string) => {
    if (!confirm('คุณต้องการลบรายการนี้ใช่หรือไม่?')) return

    try {
      if (type === 'salary') {
        await api.salaries.delete(id)
      } else if (type === 'bonus') {
        await api.bonuses.delete(id)
      } else {
        await api.commissions.delete(id)
      }
      await fetchData()
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  const resetSalaryForm = () => {
    setSalaryForm({
      memberId: '',
      amount: '',
      payDate: '',
      month: '',
      year: new Date().getFullYear().toString(),
      description: ''
    })
  }

  const resetBonusForm = () => {
    setBonusForm({
      memberId: '',
      amount: '',
      reason: '',
      date: ''
    })
  }

  const resetCommissionForm = () => {
    setCommissionForm({
      memberId: '',
      amount: '',
      percentage: '',
      salesAmount: '',
      description: '',
      date: ''
    })
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      paid: 'default',
      cancelled: 'destructive'
    }
    const icons = {
      pending: <Clock className="h-3 w-3" />,
      paid: <CheckCircle className="h-3 w-3" />,
      cancelled: <XCircle className="h-3 w-3" />
    }
    const labels = {
      pending: 'รอดำเนินการ',
      paid: 'จ่ายแล้ว',
      cancelled: 'ยกเลิก'
    }

    return (
      <Badge variant={variants[status] || 'outline'} className="flex items-center gap-1">
        {icons[status as keyof typeof icons]}
        {labels[status as keyof typeof labels]}
      </Badge>
    )
  }

  const monthNames = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ]

  if (loading) {
    return <div className="flex items-center justify-center h-64">กำลังโหลด...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">จัดการค่าตอบแทน</h1>
        <p className="text-gray-600 mt-2">จัดการเงินเดือน โบนัส และค่าคอมมิชชัน</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">เงินเดือนทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ฿{salaries.filter(s => s.status === 'paid').reduce((sum, s) => sum + s.amount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {salaries.filter(s => s.status === 'pending').length} รายการรอชำระ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">โบนัสทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ฿{bonuses.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.amount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {bonuses.filter(b => b.status === 'pending').length} รายการรอชำระ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-600">ค่าคอมมิชชันทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ฿{commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {commissions.filter(c => c.status === 'pending').length} รายการรอชำระ
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="salaries" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            เงินเดือน
          </TabsTrigger>
          <TabsTrigger value="bonuses" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            โบนัส
          </TabsTrigger>
          <TabsTrigger value="commissions" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            ค่าคอมมิชชัน
          </TabsTrigger>
        </TabsList>

        {/* Salaries Tab */}
        <TabsContent value="salaries">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>รายการเงินเดือน</CardTitle>
              <Dialog open={isSalaryDialogOpen} onOpenChange={setIsSalaryDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetSalaryForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    เพิ่มเงินเดือน
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>เพิ่มรายการเงินเดือน</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateSalary} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="employee">พนักงาน</Label>
                      <Select value={salaryForm.memberId} onValueChange={(value) => setSalaryForm(prev => ({ ...prev, memberId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกพนักงาน" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount">จำนวนเงิน</Label>
                        <Input
                          id="amount"
                          type="number"
                          value={salaryForm.amount}
                          onChange={(e) => setSalaryForm(prev => ({ ...prev, amount: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="payDate">วันที่จ่าย</Label>
                        <Input
                          id="payDate"
                          type="date"
                          value={salaryForm.payDate}
                          onChange={(e) => setSalaryForm(prev => ({ ...prev, payDate: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="month">เดือน</Label>
                        <Select value={salaryForm.month} onValueChange={(value) => setSalaryForm(prev => ({ ...prev, month: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="เลือกเดือน" />
                          </SelectTrigger>
                          <SelectContent>
                            {monthNames.map((month, index) => (
                              <SelectItem key={index} value={(index + 1).toString()}>
                                {month}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="year">ปี</Label>
                        <Input
                          id="year"
                          type="number"
                          value={salaryForm.year}
                          onChange={(e) => setSalaryForm(prev => ({ ...prev, year: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">หมายเหตุ</Label>
                      <Textarea
                        id="description"
                        value={salaryForm.description}
                        onChange={(e) => setSalaryForm(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button type="submit" className="flex-1">บันทึก</Button>
                      <Button type="button" variant="outline" onClick={() => setIsSalaryDialogOpen(false)}>
                        ยกเลิก
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>พนักงาน</TableHead>
                    <TableHead>จำนวนเงิน</TableHead>
                    <TableHead>งวดที่จ่าย</TableHead>
                    <TableHead>วันที่จ่าย</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead>จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salaries.map((salary) => (
                    <TableRow key={salary.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{salary.member.name}</div>
                          <div className="text-sm text-gray-500">{salary.member.team?.name || '-'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {salary.amount.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>{monthNames[salary.month - 1]} {salary.year}</TableCell>
                      <TableCell>{new Date(salary.payDate).toLocaleDateString('th-TH')}</TableCell>
                      <TableCell>{getStatusBadge(salary.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {salary.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateStatus('salary', salary.id, 'paid')}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete('salary', salary.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bonuses Tab */}
        <TabsContent value="bonuses">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>รายการโบนัส</CardTitle>
              <Dialog open={isBonusDialogOpen} onOpenChange={setIsBonusDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetBonusForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    เพิ่มโบนัส
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>เพิ่มรายการโบนัส</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateBonus} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="employee">พนักงาน</Label>
                      <Select value={bonusForm.memberId} onValueChange={(value) => setBonusForm(prev => ({ ...prev, memberId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกพนักงาน" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount">จำนวนเงิน</Label>
                        <Input
                          id="amount"
                          type="number"
                          value={bonusForm.amount}
                          onChange={(e) => setBonusForm(prev => ({ ...prev, amount: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="date">วันที่</Label>
                        <Input
                          id="date"
                          type="date"
                          value={bonusForm.date}
                          onChange={(e) => setBonusForm(prev => ({ ...prev, date: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reason">เหตุผล</Label>
                      <Textarea
                        id="reason"
                        value={bonusForm.reason}
                        onChange={(e) => setBonusForm(prev => ({ ...prev, reason: e.target.value }))}
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button type="submit" className="flex-1">บันทึก</Button>
                      <Button type="button" variant="outline" onClick={() => setIsBonusDialogOpen(false)}>
                        ยกเลิก
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>พนักงาน</TableHead>
                    <TableHead>จำนวนเงิน</TableHead>
                    <TableHead>เหตุผล</TableHead>
                    <TableHead>วันที่</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead>จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bonuses.map((bonus) => (
                    <TableRow key={bonus.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{bonus.member.name}</div>
                          <div className="text-sm text-gray-500">{bonus.member.team?.name || '-'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Gift className="h-4 w-4" />
                          {bonus.amount.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>{bonus.reason || '-'}</TableCell>
                      <TableCell>{new Date(bonus.date).toLocaleDateString('th-TH')}</TableCell>
                      <TableCell>{getStatusBadge(bonus.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {bonus.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateStatus('bonus', bonus.id, 'paid')}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete('bonus', bonus.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commissions Tab */}
        <TabsContent value="commissions">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>รายการค่าคอมมิชชัน</CardTitle>
              <Dialog open={isCommissionDialogOpen} onOpenChange={setIsCommissionDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetCommissionForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    เพิ่มค่าคอมมิชชัน
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>เพิ่มรายการค่าคอมมิชชัน</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateCommission} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="employee">พนักงาน</Label>
                      <Select value={commissionForm.memberId} onValueChange={(value) => setCommissionForm(prev => ({ ...prev, memberId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="เลือกพนักงาน" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount">จำนวนเงินคอม</Label>
                        <Input
                          id="amount"
                          type="number"
                          value={commissionForm.amount}
                          onChange={(e) => setCommissionForm(prev => ({ ...prev, amount: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="percentage">เปอร์เซ็นต์ (%)</Label>
                        <Input
                          id="percentage"
                          type="number"
                          step="0.01"
                          value={commissionForm.percentage}
                          onChange={(e) => setCommissionForm(prev => ({ ...prev, percentage: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salesAmount">ยอดขาย</Label>
                      <Input
                        id="salesAmount"
                        type="number"
                        value={commissionForm.salesAmount}
                        onChange={(e) => setCommissionForm(prev => ({ ...prev, salesAmount: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">รายละเอียด</Label>
                      <Textarea
                        id="description"
                        value={commissionForm.description}
                        onChange={(e) => setCommissionForm(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date">วันที่</Label>
                      <Input
                        id="date"
                        type="date"
                        value={commissionForm.date}
                        onChange={(e) => setCommissionForm(prev => ({ ...prev, date: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button type="submit" className="flex-1">บันทึก</Button>
                      <Button type="button" variant="outline" onClick={() => setIsCommissionDialogOpen(false)}>
                        ยกเลิก
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>พนักงาน</TableHead>
                    <TableHead>จำนวนเงิน</TableHead>
                    <TableHead>%</TableHead>
                    <TableHead>ยอดขาย</TableHead>
                    <TableHead>รายละเอียด</TableHead>
                    <TableHead>วันที่</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead>จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissions.map((commission) => (
                    <TableRow key={commission.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{commission.member.name}</div>
                          <div className="text-sm text-gray-500">{commission.member.team?.name || '-'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          {commission.amount.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>{commission.percentage ? `${commission.percentage}%` : '-'}</TableCell>
                      <TableCell>{commission.salesAmount ? commission.salesAmount.toLocaleString() : '-'}</TableCell>
                      <TableCell>{commission.description || '-'}</TableCell>
                      <TableCell>{new Date(commission.date).toLocaleDateString('th-TH')}</TableCell>
                      <TableCell>{getStatusBadge(commission.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {commission.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateStatus('commission', commission.id, 'paid')}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete('commission', commission.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}