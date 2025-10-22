'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Tags, Plus, Edit, Trash2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

export function CategoryManagement() {
  const [categories, setCategories] = useState([
    {
      id: 1,
      name: 'การตลาด',
      description: 'ค่าใช้จ่ายด้านการตลาดและโฆษณา',
      type: 'expense',
      color: 'blue',
      budget: 50000,
      spent: 35000,
      icon: '📢'
    },
    {
      id: 2,
      name: 'การขาย',
      description: 'รายได้จากการขายสินค้าและบริการ',
      type: 'income',
      color: 'green',
      budget: 200000,
      spent: 150000,
      icon: '💰'
    },
    {
      id: 3,
      name: 'การดำเนินงาน',
      description: 'ค่าใช้จ่ายในการดำเนินงานทั่วไป',
      type: 'expense',
      color: 'orange',
      budget: 30000,
      spent: 22000,
      icon: '⚙️'
    },
    {
      id: 4,
      name: 'ค่าจ้าง/เงินเดือน',
      description: 'ค่าจ้างและเงินเดือนพนักงาน',
      type: 'expense',
      color: 'red',
      budget: 100000,
      spent: 100000,
      icon: '💼'
    },
    {
      id: 5,
      name: 'สาธารณูปโภค',
      description: 'ค่าไฟฟ้า น้ำ อินเทอร์เน็ต',
      type: 'expense',
      color: 'yellow',
      budget: 10000,
      spent: 7500,
      icon: '💡'
    },
    {
      id: 6,
      name: 'ค่าเช่า',
      description: 'ค่าเช่าสถานที่และอุปกรณ์',
      type: 'expense',
      color: 'purple',
      budget: 25000,
      spent: 25000,
      icon: '🏢'
    }
  ])

  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    type: '',
    budget: '',
    icon: ''
  })

  const [filterType, setFilterType] = useState('all')

  const handleAddCategory = () => {
    if (newCategory.name && newCategory.description && newCategory.type) {
      const category = {
        id: categories.length + 1,
        ...newCategory,
        budget: parseInt(newCategory.budget) || 0,
        spent: 0,
        color: ['blue', 'green', 'orange', 'red', 'yellow', 'purple'][categories.length % 6]
      }
      setCategories([...categories, category])
      setNewCategory({ name: '', description: '', type: '', budget: '', icon: '' })
    }
  }

  const handleDeleteCategory = (id: number) => {
    setCategories(categories.filter(cat => cat.id !== id))
  }

  const filteredCategories = categories.filter(cat => 
    filterType === 'all' || cat.type === filterType
  )

  const totalBudget = filteredCategories.reduce((sum, cat) => sum + cat.budget, 0)
  const totalSpent = filteredCategories.reduce((sum, cat) => sum + cat.spent, 0)
  const remaining = totalBudget - totalSpent

  const getCategoryColor = (color: string) => {
    const colors: { [key: string]: string } = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200'
    }
    return colors[color] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getBudgetPercentage = (spent: number, budget: number) => {
    if (budget === 0) return 0
    return Math.min((spent / budget) * 100, 100)
  }

  const getBudgetColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">จัดการหมวดหมู่</h1>
        <p className="text-gray-600 mt-2">จัดการหมวดหมู่รายรับและรายจ่าย</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">งบประมาณรวม</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{totalBudget.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">ใช้ไปแล้ว</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">฿{totalSpent.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">คงเหลือ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ฿{remaining.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">จำนวนหมวดหมู่</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredCategories.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Add */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Tags className="h-5 w-5" />
            รายการหมวดหมู่
          </CardTitle>
          <div className="flex gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                <SelectItem value="income">รายรับ</SelectItem>
                <SelectItem value="expense">รายจ่าย</SelectItem>
              </SelectContent>
            </Select>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  เพิ่มหมวดหมู่
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>เพิ่มหมวดหมู่ใหม่</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="category-name">ชื่อหมวดหมู่</Label>
                    <Input
                      id="category-name"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      placeholder="เช่น การตลาด"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category-description">คำอธิบาย</Label>
                    <Textarea
                      id="category-description"
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                      placeholder="รายละเอียดเกี่ยวกับหมวดหมู่..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category-type">ประเภท</Label>
                    <Select value={newCategory.type} onValueChange={(value) => setNewCategory({ ...newCategory, type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกประเภท" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">รายรับ</SelectItem>
                        <SelectItem value="expense">รายจ่าย</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category-budget">งบประมาณ (ถ้ามี)</Label>
                    <Input
                      id="category-budget"
                      type="number"
                      value={newCategory.budget}
                      onChange={(e) => setNewCategory({ ...newCategory, budget: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category-icon">ไอคอน (Emoji)</Label>
                    <Input
                      id="category-icon"
                      value={newCategory.icon}
                      onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                      placeholder="เช่น 📢, 💰, ⚙️"
                    />
                  </div>
                  <Button onClick={handleAddCategory} className="w-full">
                    เพิ่มหมวดหมู่
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((category) => {
              const percentage = getBudgetPercentage(category.spent, category.budget)
              return (
                <Card key={category.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{category.icon}</span>
                        <div>
                          <CardTitle className="text-lg">{category.name}</CardTitle>
                          <Badge 
                            variant={category.type === 'income' ? 'default' : 'secondary'}
                            className="mt-1"
                          >
                            {category.type === 'income' ? 'รายรับ' : 'รายจ่าย'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                    
                    {category.type === 'expense' && category.budget > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>งบประมาณ</span>
                          <span className="font-medium">฿{category.budget.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>ใช้ไป</span>
                          <span className="font-medium text-red-600">฿{category.spent.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>คงเหลือ</span>
                          <span className={`font-medium ${category.budget - category.spent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ฿{(category.budget - category.spent).toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className={`h-2 rounded-full ${getBudgetColor(percentage)}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 text-center mt-1">
                          {percentage.toFixed(1)}% ของงบประมาณ
                        </p>
                      </div>
                    )}

                    {category.type === 'income' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>เป้าหมาย</span>
                          <span className="font-medium">฿{category.budget.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>ได้รับแล้ว</span>
                          <span className="font-medium text-green-600">฿{category.spent.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 text-center mt-1">
                          {percentage.toFixed(1)}% ของเป้าหมาย
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}