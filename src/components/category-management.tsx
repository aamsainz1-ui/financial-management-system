'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Tags, Plus, Edit, Trash2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { RelativeTime, TimeInfo } from '@/components/ui/relative-time'

export function CategoryManagement() {
  const { toast } = useToast()
  
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Load categories from API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const apiCategories = await response.json()
          setCategories(apiCategories)
        } else {
          console.error('Failed to load categories from API')
        }
      } catch (error) {
        console.error('Error loading categories:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    type: '',
    budget: '',
    icon: '',
    color: 'blue'
  })

  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const [filterType, setFilterType] = useState('all')

  const handleAddCategory = async () => {
    if (newCategory.name && newCategory.description && newCategory.type) {
      try {
        const response = await fetch('/api/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newCategory),
        })

        if (response.ok) {
          const createdCategory = await response.json()
          const updatedCategories = [createdCategory, ...categories]
          setCategories(updatedCategories)
          setNewCategory({ name: '', description: '', type: '', budget: '', icon: '', color: 'blue' })
          toast({
            title: "เพิ่มหมวดหมู่สำเร็จ",
            description: `เพิ่มหมวดหมู่ "${createdCategory.name}" เรียบร้อยแล้ว`,
          })
        } else {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create category')
        }
      } catch (error) {
        console.error('Error creating category:', error)
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถเพิ่มหมวดหมู่ได้ กรุณาลองใหม่",
          variant: "destructive"
        })
      }
    } else {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณากรอกชื่อ คำอธิบาย และประเภทหมวดหมู่",
        variant: "destructive"
      })
    }
  }

  const handleDeleteCategory = async (id: string) => {
    const category = categories.find(cat => cat.id === id)
    
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        const updatedCategories = categories.filter(cat => cat.id !== id)
        setCategories(updatedCategories)
        toast({
          title: "ลบหมวดหมู่สำเร็จ",
          description: `ลบหมวดหมู่ "${category?.name}" เรียบร้อยแล้ว`,
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete category')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบหมวดหมู่ได้ กรุณาลองใหม่",
        variant: "destructive"
      })
    }
  }

  const handleEditCategory = (category: any) => {
    setEditingCategory({
      ...category,
      budget: category.budget?.toString() || '0',
      color: category.color || 'blue'
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateCategory = async () => {
    if (editingCategory && editingCategory.name && editingCategory.description && editingCategory.type) {
      try {
        const response = await fetch(`/api/categories/${editingCategory.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editingCategory),
        })

        if (response.ok) {
          const updatedCategory = await response.json()
          const updatedCategories = categories.map(cat => 
            cat.id === editingCategory.id ? updatedCategory : cat
          )
          setCategories(updatedCategories)
          toast({
            title: "แก้ไขหมวดหมู่สำเร็จ",
            description: `แก้ไขหมวดหมู่ "${updatedCategory.name}" เรียบร้อยแล้ว`,
          })
          setEditingCategory(null)
          setIsEditDialogOpen(false)
        } else {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to update category')
        }
      } catch (error) {
        console.error('Error updating category:', error)
        toast({
          title: "เกิดข้อผิดพลาด",
          description: "ไม่สามารถแก้ไขหมวดหมู่ได้ กรุณาลองใหม่",
          variant: "destructive"
        })
      }
    } else {
      toast({
        title: "ข้อมูลไม่ครบถ้วน",
        description: "กรุณากรอกชื่อ คำอธิบาย และประเภทหมวดหมู่",
        variant: "destructive"
      })
    }
  }

  const filteredCategories = categories.filter(cat => 
    filterType === 'all' || cat.type === filterType
  )

  const totalBudget = filteredCategories.reduce((sum, cat) => sum + (cat.budget || 0), 0)
  const totalSpent = filteredCategories.reduce((sum, cat) => sum + (cat.spent || 0), 0)
  const remaining = totalBudget - totalSpent

  const getCategoryColor = (color: string) => {
    const colors: { [key: string]: string } = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      pink: 'bg-pink-100 text-pink-800 border-pink-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200'
    }
    return colors[color] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getBorderColor = (color: string) => {
    const colors: { [key: string]: string } = {
      blue: '#3b82f6',
      green: '#10b981',
      orange: '#f97316',
      red: '#ef4444',
      yellow: '#eab308',
      purple: '#a855f7',
      pink: '#ec4899',
      gray: '#6b7280'
    }
    return colors[color] || '#e5e7eb'
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">กำลังโหลดข้อมูล...</div>
      </div>
    )
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
            <div className="text-2xl font-bold">฿{(totalBudget || 0).toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">ใช้ไปแล้ว</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">฿{(totalSpent || 0).toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">คงเหลือ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ฿{(remaining || 0).toLocaleString()}
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
              <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-lg">เพิ่มหมวดหมู่ใหม่</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="category-name" className="text-sm font-medium">ชื่อหมวดหมู่</Label>
                    <Input
                      id="category-name"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                      placeholder="เช่น การตลาด"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category-description" className="text-sm font-medium">คำอธิบาย</Label>
                    <Textarea
                      id="category-description"
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                      placeholder="รายละเอียดเกี่ยวกับหมวดหมู่..."
                      className="min-h-[60px] resize-none"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category-type" className="text-sm font-medium">ประเภท</Label>
                    <Select value={newCategory.type} onValueChange={(value) => setNewCategory({ ...newCategory, type: value })}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="เลือกประเภท" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">รายรับ</SelectItem>
                        <SelectItem value="expense">รายจ่าย</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category-budget" className="text-sm font-medium">งบประมาณ (ถ้ามี)</Label>
                    <Input
                      id="category-budget"
                      type="number"
                      value={newCategory.budget}
                      onChange={(e) => setNewCategory({ ...newCategory, budget: e.target.value })}
                      placeholder="0"
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category-color" className="text-sm font-medium">สีหมวดหมู่</Label>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {[
                        { value: 'blue', label: 'น้ำเงิน', class: 'bg-blue-500' },
                        { value: 'green', label: 'เขียว', class: 'bg-green-500' },
                        { value: 'red', label: 'แดง', class: 'bg-red-500' },
                        { value: 'yellow', label: 'เหลือง', class: 'bg-yellow-500' },
                        { value: 'purple', label: 'ม่วง', class: 'bg-purple-500' },
                        { value: 'pink', label: 'ชมพู', class: 'bg-pink-500' },
                        { value: 'orange', label: 'ส้ม', class: 'bg-orange-500' },
                        { value: 'gray', label: 'เทา', class: 'bg-gray-500' }
                      ].map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          className={`h-8 w-8 rounded-full ${color.class} ${
                            newCategory.color === color.value ? 'ring-2 ring-offset-2 ring-gray-800' : ''
                          }`}
                          onClick={() => setNewCategory({ ...newCategory, color: color.value })}
                          title={color.label}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category-icon" className="text-sm font-medium">ไอคอนหมวดหมู่</Label>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 mb-2 max-h-32 overflow-y-auto">
                      {[
                        '💰', '💵', '💳', '🏦', '💸', '📈',
                        '📉', '🏪', '🛒', '🛍️', '🏬', '🏢',
                        '🏠', '🏭', '🚗', '⛽', '🍔', '☕',
                        '📱', '💻', '🎮', '👕', '👟', '💊',
                        '📚', '🎓', '🏥', '✈️', '🏨', '🎬',
                        '🎵', '⚽', '🏀', '🎾', '🏊', '🎯'
                      ].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          className={`p-1.5 text-lg border rounded hover:bg-gray-100 ${
                            newCategory.icon === emoji ? 'bg-blue-100 border-blue-500' : 'border-gray-300'
                          }`}
                          onClick={() => setNewCategory({ ...newCategory, icon: emoji })}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                    <Input
                      id="category-icon"
                      value={newCategory.icon}
                      onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                      placeholder="เลือกไอคอนด้านบนหรือพิมพ์เอง"
                      className="h-10"
                    />
                  </div>
                  <Button onClick={handleAddCategory} className="w-full h-10">
                    เพิ่มหมวดหมู่
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-lg">แก้ไขหมวดหมู่</DialogTitle>
                </DialogHeader>
                {editingCategory && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="edit-category-name" className="text-sm font-medium">ชื่อหมวดหมู่</Label>
                      <Input
                        id="edit-category-name"
                        value={editingCategory.name}
                        onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                        placeholder="เช่น การตลาด"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-category-description" className="text-sm font-medium">คำอธิบาย</Label>
                      <Textarea
                        id="edit-category-description"
                        value={editingCategory.description}
                        onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                        placeholder="รายละเอียดเกี่ยวกับหมวดหมู่..."
                        className="min-h-[60px] resize-none"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-category-type" className="text-sm font-medium">ประเภท</Label>
                      <Select 
                        value={editingCategory.type} 
                        onValueChange={(value) => setEditingCategory({ ...editingCategory, type: value })}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="เลือกประเภท" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income">รายรับ</SelectItem>
                          <SelectItem value="expense">รายจ่าย</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-category-budget" className="text-sm font-medium">งบประมาณ (ถ้ามี)</Label>
                      <Input
                        id="edit-category-budget"
                        type="number"
                        value={editingCategory.budget}
                        onChange={(e) => setEditingCategory({ ...editingCategory, budget: e.target.value })}
                        placeholder="0"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-category-color" className="text-sm font-medium">สีหมวดหมู่</Label>
                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                        {[
                          { value: 'blue', label: 'น้ำเงิน', class: 'bg-blue-500' },
                          { value: 'green', label: 'เขียว', class: 'bg-green-500' },
                          { value: 'red', label: 'แดง', class: 'bg-red-500' },
                          { value: 'yellow', label: 'เหลือง', class: 'bg-yellow-500' },
                          { value: 'purple', label: 'ม่วง', class: 'bg-purple-500' },
                          { value: 'pink', label: 'ชมพู', class: 'bg-pink-500' },
                          { value: 'orange', label: 'ส้ม', class: 'bg-orange-500' },
                          { value: 'gray', label: 'เทา', class: 'bg-gray-500' }
                        ].map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            className={`h-8 w-8 rounded-full ${color.class} ${
                              editingCategory.color === color.value ? 'ring-2 ring-offset-2 ring-gray-800' : ''
                            }`}
                            onClick={() => setEditingCategory({ ...editingCategory, color: color.value })}
                            title={color.label}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit-category-icon" className="text-sm font-medium">ไอคอนหมวดหมู่</Label>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 mb-2 max-h-32 overflow-y-auto">
                        {[
                          '💰', '💵', '💳', '🏦', '💸', '📈',
                          '📉', '🏪', '🛒', '🛍️', '🏬', '🏢',
                          '🏠', '🏭', '🚗', '⛽', '🍔', '☕',
                          '📱', '💻', '🎮', '👕', '👟', '💊',
                          '📚', '🎓', '🏥', '✈️', '🏨', '🎬',
                          '🎵', '⚽', '🏀', '🎾', '🏊', '🎯'
                        ].map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            className={`p-1.5 text-lg border rounded hover:bg-gray-100 ${
                              editingCategory.icon === emoji ? 'bg-blue-100 border-blue-500' : 'border-gray-300'
                            }`}
                            onClick={() => setEditingCategory({ ...editingCategory, icon: emoji })}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                      <Input
                        id="edit-category-icon"
                        value={editingCategory.icon}
                        onChange={(e) => setEditingCategory({ ...editingCategory, icon: e.target.value })}
                        placeholder="เลือกไอคอนด้านบนหรือพิมพ์เอง"
                        className="h-10"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleUpdateCategory} className="flex-1 h-10">
                        บันทึกการแก้ไข
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setEditingCategory(null)
                          setIsEditDialogOpen(false)
                        }}
                        className="flex-1 h-10"
                      >
                        ยกเลิก
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((category) => {
              const percentage = getBudgetPercentage(category.spent, category.budget)
              return (
                <Card key={category.id} className="relative hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl p-2 bg-gray-100 rounded-lg border-2" 
                             style={{ borderColor: getBorderColor(category.color) }}>
                          {category.icon}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold">{category.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant={category.type === 'income' ? 'default' : 'secondary'}
                              className={category.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                            >
                              {category.type === 'income' ? 'รายรับ' : 'รายจ่าย'}
                            </Badge>
                            {category.budget > 0 && (
                              <span className="text-xs text-gray-500">
                                งบประมาณ: ฿{category.budget.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditCategory(category)}
                          className="h-8 w-8 p-0 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 hover:bg-red-50"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {category.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                    
                    <TimeInfo 
                      createdAt={category.createdAt}
                      updatedAt={category.updatedAt}
                      className="text-xs text-gray-500 mb-3"
                    />
                    
                    {category.budget > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">ใช้ไปแล้ว:</span>
                          <span className="font-medium">฿{(category.spent || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">คงเหลือ:</span>
                          <span className={`font-medium ${(category.budget - (category.spent || 0)) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ฿{(category.budget - (category.spent || 0)).toLocaleString()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${getBudgetColor(percentage)}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 text-right">
                          {percentage.toFixed(1)}% ของงบประมาณ
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-3 pt-3 border-t text-xs text-gray-500">
                      <span>สร้างเมื่อ: {new Date(category.createdAt).toLocaleDateString('th-TH')}</span>
                      {category.updatedAt !== category.createdAt && (
                        <span>อัพเดท: {new Date(category.updatedAt).toLocaleDateString('th-TH')}</span>
                      )}
                    </div>
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