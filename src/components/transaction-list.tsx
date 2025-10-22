'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'
import { DateTimeFilterComponent, DateTimeFilter } from '@/components/ui/date-time-picker'
import { Search, Filter, Edit, Trash2, Eye, Download, Calendar, Plus } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { Permission } from '@/components/auth/ProtectedRoute'
import { RelativeTime, TimeInfo } from '@/components/ui/relative-time'

export function TransactionList() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterTeam, setFilterTeam] = useState('all')
  const [dateTimeFilter, setDateTimeFilter] = useState<DateTimeFilter>({
    startDateTime: '',
    endDateTime: ''
  })
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    type: 'income',
    categoryId: '',
    teamId: 'none',
    date: '',
    bankName: '',
    bankAccount: '',
    accountName: ''
  })

  const fetchTransactions = async (dateTimeFilter?: DateTimeFilter) => {
    try {
      let url = '/api/transactions'
      if (dateTimeFilter?.startDateTime || dateTimeFilter?.endDateTime) {
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
      if (!response.ok) throw new Error('Failed to fetch transactions')
      return await response.json()
    } catch (error) {
      console.error('Error fetching transactions:', error)
      return []
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [transactionsData, categoriesData, teamsData] = await Promise.all([
          fetchTransactions(dateTimeFilter),
          api.categories.getAll(),
          api.teams.getAll()
        ])
        
        // Ensure transactions is an array
        const transactionsArray = Array.isArray(transactionsData) ? transactionsData : []
        const categoriesArray = Array.isArray(categoriesData) ? categoriesData : []
        const teamsArray = Array.isArray(teamsData) ? teamsData : []
        
        setTransactions(transactionsArray)
        setCategories(categoriesArray)
        setTeams(teamsArray)
      } catch (error) {
        console.error('Error fetching data:', error)
        // Set empty arrays on error
        setTransactions([])
        setCategories([])
        setTeams([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [dateTimeFilter])

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (transaction.description && transaction.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = filterType === 'all' || transaction.type === filterType
    const matchesCategory = filterCategory === 'all' || transaction.categoryId === filterCategory
    const matchesTeam = filterTeam === 'all' || transaction.teamId === filterTeam

    return matchesSearch && matchesType && matchesCategory && matchesTeam
  })

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const netProfit = totalIncome - totalExpense

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId)
    return category ? category.name : 'ไม่ระบุ'
  }

  const getTeamName = (teamId: string | null) => {
    if (!teamId) return 'ไม่ระบุทีม'
    const team = teams.find(t => t.id === teamId)
    return team ? team.name : 'ไม่ระบุทีม'
  }

  const handleDelete = async (id: string) => {
    try {
      await api.transactions.delete(id)
      setTransactions(transactions.filter(t => t.id !== id))
    } catch (error) {
      console.error('Error deleting transaction:', error)
    }
  }

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction)
    setFormData({
      title: transaction.title,
      description: transaction.description || '',
      amount: transaction.amount.toString(),
      type: transaction.type,
      categoryId: transaction.categoryId || '',
      teamId: transaction.teamId || 'none',
      date: transaction.date.split('T')[0],
      bankName: transaction.bankName || '',
      bankAccount: transaction.bankAccount || '',
      accountName: transaction.accountName || ''
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTransaction) return

    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount) || 0,
        teamId: formData.teamId === 'none' ? null : formData.teamId,
        bankName: formData.type === 'income' ? formData.bankName : null,
        bankAccount: formData.type === 'income' ? formData.bankAccount : null,
        accountName: formData.type === 'income' ? formData.accountName : null
      }
      
      await api.transactions.update(editingTransaction.id, data)
      
      // Update local state
      setTransactions(transactions.map(t => 
        t.id === editingTransaction.id 
          ? { ...t, ...data }
          : t
      ))
      
      setIsEditDialogOpen(false)
      setEditingTransaction(null)
      setFormData({
        title: '',
        description: '',
        amount: '',
        type: 'income',
        categoryId: '',
        teamId: 'none',
        date: '',
        bankName: '',
        bankAccount: '',
        accountName: ''
      })
    } catch (error) {
      console.error('Error updating transaction:', error)
    }
  }

  const handleDateTimeFilterChange = (filter: DateTimeFilter) => {
    setDateTimeFilter(filter)
  }

  const handleClearDateTimeFilter = () => {
    setDateTimeFilter({ startDateTime: '', endDateTime: '' })
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">กำลังโหลด...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">รายการธุรกรรม</h1>
        <p className="text-gray-600 mt-2">จัดการรายรับและรายจ่ายทั้งหมด</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">รายรับทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">฿{(totalIncome || 0).toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">รายจ่ายทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">฿{(totalExpense || 0).toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">กำไรสุทธิ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              ฿{(netProfit || 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Date-Time Filter */}
      <DateTimeFilterComponent
        filter={dateTimeFilter}
        onFilterChange={handleDateTimeFilterChange}
        onClearFilter={handleClearDateTimeFilter}
      />

      {/* Other Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            ตัวกรองและค้นหาเพิ่มเติม
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="ค้นหารายการ..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="ประเภท" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                <SelectItem value="income">รายรับ</SelectItem>
                <SelectItem value="expense">รายจ่าย</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="หมวดหมู่" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterTeam} onValueChange={setFilterTeam}>
              <SelectTrigger>
                <SelectValue placeholder="ทีม" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            รายการทั้งหมด ({filteredTransactions.length} รายการ)
            {(dateTimeFilter.startDateTime || dateTimeFilter.endDateTime) && (
              <Badge variant="secondary" className="ml-2">
                กรองตามวันที่
              </Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              ส่งออก
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>วันที่/เวลา</TableHead>
                  <TableHead>อัพเดทล่าสุด</TableHead>
                  <TableHead>รายการ</TableHead>
                  <TableHead>ประเภท</TableHead>
                  <TableHead>หมวดหมู่</TableHead>
                  <TableHead>ทีม</TableHead>
                  <TableHead>ข้อมูลธนาคาร</TableHead>
                  <TableHead className="text-right">จำนวนเงิน</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{new Date(transaction.date).toLocaleDateString('th-TH')}</p>
                        <p className="text-sm text-gray-500">{new Date(transaction.date).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <TimeInfo 
                        createdAt={transaction.createdAt || transaction.date}
                        updatedAt={transaction.updatedAt}
                        showBoth={false}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{transaction.title}</p>
                        {transaction.description && (
                          <p className="text-sm text-gray-500">{transaction.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={transaction.type === 'income' ? 'default' : 'secondary'}>
                        {transaction.type === 'income' ? 'รายรับ' : 'รายจ่าย'}
                      </Badge>
                    </TableCell>
                    <TableCell>{getCategoryName(transaction.categoryId)}</TableCell>
                    <TableCell>{getTeamName(transaction.teamId)}</TableCell>
                    <TableCell>
                      {transaction.type === 'income' && transaction.bankName ? (
                        <div className="text-sm">
                          <p className="font-medium">{transaction.bankName}</p>
                          {transaction.bankAccount && (
                            <p className="text-gray-500">บช: {transaction.bankAccount}</p>
                          )}
                          {transaction.accountName && (
                            <p className="text-gray-500">ชื่อ: {transaction.accountName}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className={`text-right font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}฿{(transaction.amount || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Permission action="edit">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEdit(transaction)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Permission>
                        <Permission action="delete">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>ยืนยันการลบรายการธุรกรรม</AlertDialogTitle>
                                <AlertDialogDescription>
                                  คุณต้องการลบรายการ "{transaction.title}" ใช่หรือไม่?
                                การดำเนินการนี้ไม่สามารถย้อนกลับได้
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(transaction.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                ลบรายการ
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        </Permission>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Transaction Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>แก้ไขรายการธุรกรรม</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">ชื่อรายการ</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">จำนวนเงิน</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">ประเภท</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">รายรับ</SelectItem>
                    <SelectItem value="expense">รายจ่าย</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">หมวดหมู่</Label>
                <Select value={formData.categoryId} onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(cat => cat.type === formData.type).map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="team">ทีม</Label>
                <Select value={formData.teamId} onValueChange={(value) => setFormData(prev => ({ ...prev, teamId: value }))}>
                  <SelectTrigger>
                    <SelectValue />
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
              <div className="space-y-2">
                <Label htmlFor="date">วันที่</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">รายละเอียด</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            {formData.type === 'income' && (
              <div className="space-y-4">
                <h3 className="font-medium">ข้อมูลธนาคาร</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">ชื่อธนาคาร</Label>
                    <Input
                      id="bankName"
                      value={formData.bankName}
                      onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bankAccount">เลขบัญชี</Label>
                    <Input
                      id="bankAccount"
                      value={formData.bankAccount}
                      onChange={(e) => setFormData(prev => ({ ...prev, bankAccount: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountName">ชื่อบัญชี</Label>
                    <Input
                      id="accountName"
                      value={formData.accountName}
                      onChange={(e) => setFormData(prev => ({ ...prev, accountName: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                บันทึกการแก้ไข
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
                className="flex-1"
              >
                ยกเลิก
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}