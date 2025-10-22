'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Calendar, DollarSign, FileText, Tag, Users, Building2, CreditCard } from 'lucide-react'
import { api } from '@/lib/api'

export function TransactionForm() {
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    amount: '',
    category: '',
    team: 'none',
    date: '',
    description: '',
    bankName: '',
    bankAccount: '',
    accountName: '',
    cardNumber: '',
    cardHolderName: '',
  })

  const [categories, setCategories] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, teamsData] = await Promise.all([
          api.categories.getAll(),
          api.teams.getAll()
        ])
        setCategories(categoriesData)
        setTeams(teamsData)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    try {
      await api.transactions.create({
        title: formData.title,
        description: formData.description,
        amount: parseInt(formData.amount),
        type: formData.type,
        categoryId: formData.category,
        teamId: formData.team === 'none' ? null : formData.team,
        date: formData.date,
        bankName: formData.type === 'income' ? formData.bankName : null,
        bankAccount: formData.type === 'income' ? formData.bankAccount : null,
        accountName: formData.type === 'income' ? formData.accountName : null,
        cardNumber: formData.type === 'expense' ? formData.cardNumber : null,
        cardHolderName: formData.type === 'expense' ? formData.cardHolderName : null,
      })

      setSuccess(true)
      setFormData({
        type: '',
        title: '',
        amount: '',
        category: '',
        team: 'none',
        date: '',
        description: '',
        bankName: '',
        bankAccount: '',
        accountName: '',
        cardNumber: '',
        cardHolderName: '',
      })

      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Error creating transaction:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    // Format card number automatically
    if (field === 'cardNumber') {
      // Remove all non-digit characters
      const cleaned = value.replace(/\D/g, '')
      // Add spaces every 4 digits
      const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim()
      setFormData(prev => ({ ...prev, [field]: formatted }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const filteredCategories = categories.filter(cat => cat.type === formData.type)

  return (
    <div className="max-w-2xl mx-auto space-y-6 px-4 sm:px-0">
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">เพิ่มรายการใหม่</h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">บันทึกรายรับหรือรายจ่ายของคุณ</p>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          บันทึกรายการสำเร็จแล้ว!
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <FileText className="h-5 w-5" />
            ข้อมูลรายการ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-medium">ประเภทรายการ</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="เลือกประเภท" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">รายรับ</SelectItem>
                    <SelectItem value="expense">รายจ่าย</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium">จำนวนเงิน</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    className="pl-10 h-12 text-base"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium">ชื่อรายการ</Label>
              <Input
                id="title"
                placeholder="เช่น โฆษณา Facebook, ขายสินค้า"
                className="h-12 text-base"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">หมวดหมู่</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleInputChange('category', value)}
                  disabled={!formData.type || filteredCategories.length === 0}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="เลือกหมวดหมู่" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="team" className="text-sm font-medium">ทีม</Label>
                <Select value={formData.team} onValueChange={(value) => handleInputChange('team', value)}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="เลือกทีม (ไม่ระบุก็ได้)" />
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium">วันที่</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                <Input
                  id="date"
                  type="date"
                  className="pl-10 h-12 text-base"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">รายละเอียดเพิ่มเติม</Label>
              <Textarea
                id="description"
                placeholder="เพิ่มรายละเอียดเกี่ยวกับรายการนี้..."
                rows={3}
                className="text-base resize-none"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>

            {/* Card Information - Only show for expense */}
            {formData.type === 'expense' && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-red-800 text-lg">
                    <CreditCard className="h-5 w-5" />
                    ข้อมูลบัตรเครดิต/เดบิต (สำหรับรายจ่าย)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber" className="text-sm font-medium">เลขบัตร</Label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="cardNumber"
                          placeholder="XXXX-XXXX-XXXX-XXXX"
                          className="pl-10 h-12 text-base"
                          value={formData.cardNumber}
                          onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                          maxLength={19} // XXXX XXXX XXXX XXXX (16 digits + 3 spaces)
                        />
                      </div>
                      <p className="text-xs text-gray-500">กรอกเลขบัตร 16 หลัก (ไม่ต้องใส่ขีดคั่นก็ได้)</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cardHolderName" className="text-sm font-medium">ชื่อผู้ถือบัตร</Label>
                      <Input
                        id="cardHolderName"
                        placeholder="ชื่อ-นามสกุล ผู้ถือบัตร"
                        className="h-12 text-base"
                        value={formData.cardHolderName}
                        onChange={(e) => handleInputChange('cardHolderName', e.target.value)}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-red-600">
                    ข้อมูลบัตรจะถูกบันทึกเฉพาะกับรายจ่ายเท่านั้น
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Bank Information - Only show for income */}
            {formData.type === 'income' && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-green-800 text-lg">
                    <Building2 className="h-5 w-5" />
                    ข้อมูลธนาคาร (สำหรับรายรับ)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bankName" className="text-sm font-medium">ชื่อธนาคาร</Label>
                      <Input
                        id="bankName"
                        placeholder="เช่น ธนาคารไทยพาณิชย์"
                        className="h-12 text-base"
                        value={formData.bankName}
                        onChange={(e) => handleInputChange('bankName', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bankAccount" className="text-sm font-medium">เลขบัญชีธนาคาร</Label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="bankAccount"
                          placeholder="เลขบัญชี"
                          className="pl-10 h-12 text-base"
                          value={formData.bankAccount}
                          onChange={(e) => handleInputChange('bankAccount', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accountName" className="text-sm font-medium">ชื่อบัญชี</Label>
                      <Input
                        id="accountName"
                        placeholder="ชื่อเจ้าของบัญชี"
                        className="h-12 text-base"
                        value={formData.accountName}
                        onChange={(e) => handleInputChange('accountName', e.target.value)}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-green-600">
                    ข้อมูลธนาคารจะถูกบันทึกเฉพาะกับรายรับเท่านั้น
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button type="submit" className="flex-1 h-12 text-base font-medium" disabled={loading}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    กำลังบันทึก...
                  </div>
                ) : (
                  'บันทึกรายการ'
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full sm:w-auto h-12 text-base"
                onClick={() => setFormData({
                  type: '',
                  title: '',
                  amount: '',
                  category: '',
                  team: 'none',
                  date: '',
                  description: '',
                  bankName: '',
                  bankAccount: '',
                  accountName: '',
                  cardNumber: '',
                  cardHolderName: '',
                })}
              >
                ล้างข้อมูล
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Tag className="h-5 w-5" />
            หมวดหมู่ที่มีอยู่
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-3">หมวดหมู่รายรับ:</p>
              <div className="flex flex-wrap gap-2">
                {categories.filter(cat => cat.type === 'income').map((category) => (
                  <Badge
                    key={category.id}
                    variant="outline"
                    className="cursor-pointer hover:bg-green-50 hover:border-green-300 py-1.5 px-3 text-sm"
                  >
                    {category.icon} {category.name}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-600 mb-3">หมวดหมู่รายจ่าย:</p>
              <div className="flex flex-wrap gap-2">
                {categories.filter(cat => cat.type === 'expense').map((category) => (
                  <Badge
                    key={category.id}
                    variant="outline"
                    className="cursor-pointer hover:bg-red-50 hover:border-red-300 py-1.5 px-3 text-sm"
                  >
                    {category.icon} {category.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}