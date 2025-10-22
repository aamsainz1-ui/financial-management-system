'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, DollarSign, FileText, Building2, CreditCard, Plus } from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

export function IncomeForm() {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: '',
    team: 'none',
    date: '',
    description: '',
    bankName: '',
    bankAccount: '',
    accountName: '',
  })

  const [categories, setCategories] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

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

    try {
      await api.transactions.create({
        title: formData.title,
        description: formData.description,
        amount: parseInt(formData.amount),
        type: 'income',
        categoryId: formData.category,
        teamId: formData.team === 'none' ? null : formData.team,
        date: formData.date,
        bankName: formData.bankName,
        bankAccount: formData.bankAccount,
        accountName: formData.accountName,
      })

      toast({
        title: "บันทึกรายรับสำเร็จ",
        description: "รายการรายรับของคุณถูกบันทึกเรียบร้อยแล้ว",
      })

      setFormData({
        title: '',
        amount: '',
        category: '',
        team: 'none',
        date: '',
        description: '',
        bankName: '',
        bankAccount: '',
        accountName: '',
      })
    } catch (error) {
      console.error('Error creating income:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกรายการได้ กรุณาลองใหม่",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const incomeCategories = categories.filter(cat => cat.type === 'income')

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">เพิ่มรายรับใหม่</h1>
        <p className="text-gray-600 mt-2">บันทึกรายรับและข้อมูลธนาคารของคุณ</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            ข้อมูลรายรับ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">ชื่อรายการ</Label>
                <Input
                  id="title"
                  placeholder="เช่น ขายสินค้า, ค่าบริการ"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">จำนวนเงิน</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    className="pl-10"
                    value={formData.amount}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">หมวดหมู่</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => handleInputChange('category', value)}
                  disabled={incomeCategories.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกหมวดหมู่" />
                  </SelectTrigger>
                  <SelectContent>
                    {incomeCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="team">ทีม</Label>
                <Select value={formData.team} onValueChange={(value) => handleInputChange('team', value)}>
                  <SelectTrigger>
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
              <Label htmlFor="date">วันที่</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="date"
                  type="date"
                  className="pl-10"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">รายละเอียดเพิ่มเติม</Label>
              <Textarea
                id="description"
                placeholder="เพิ่มรายละเอียดเกี่ยวกับรายการนี้..."
                rows={3}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
              />
            </div>

            {/* Bank Information */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <Building2 className="h-5 w-5" />
                  ข้อมูลธนาคาร
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bankName">ชื่อธนาคาร *</Label>
                    <Input
                      id="bankName"
                      placeholder="เช่น ธนาคารไทยพาณิชย์"
                      value={formData.bankName}
                      onChange={(e) => handleInputChange('bankName', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bankAccount">เลขบัญชีธนาคาร *</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="bankAccount"
                        placeholder="เลขบัญชี"
                        className="pl-10"
                        value={formData.bankAccount}
                        onChange={(e) => handleInputChange('bankAccount', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accountName">ชื่อบัญชี *</Label>
                    <Input
                      id="accountName"
                      placeholder="ชื่อเจ้าของบัญชี"
                      value={formData.accountName}
                      onChange={(e) => handleInputChange('accountName', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <p className="text-sm text-green-600">
                  ข้อมูลธนาคารจำเป็นสำหรับการบันทึกรายรับ
                </p>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'กำลังบันทึก...' : 'บันทึกรายรับ'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setFormData({
                  title: '',
                  amount: '',
                  category: '',
                  team: 'none',
                  date: '',
                  description: '',
                  bankName: '',
                  bankAccount: '',
                  accountName: '',
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
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            หมวดหมู่รายรับที่มีอยู่
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {incomeCategories.map((category) => (
              <div
                key={category.id}
                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm cursor-pointer hover:bg-green-200"
                onClick={() => handleInputChange('category', category.id)}
              >
                {category.icon} {category.name}
              </div>
            ))}
            {incomeCategories.length === 0 && (
              <p className="text-gray-500">ยังไม่มีหมวดหมู่รายรับ กรุณาสร้างหมวดหมู่ก่อน</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}