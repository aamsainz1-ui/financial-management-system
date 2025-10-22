'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Users, UserPlus, TrendingUp, Calculator, DollarSign } from 'lucide-react'

interface CustomerCounts {
  newCustomers: number
  depositCustomers: number
  extensionCustomers: number
  totalCustomers: number
  targetCustomers: number
}

export function CustomerCounter() {
  const [counts, setCounts] = useState<CustomerCounts>({
    newCustomers: 0,
    depositCustomers: 0,
    extensionCustomers: 0,
    totalCustomers: 0,
    targetCustomers: 0
  })

  const [tempValues, setTempValues] = useState<CustomerCounts>({
    newCustomers: 0,
    depositCustomers: 0,
    extensionCustomers: 0,
    totalCustomers: 0,
    targetCustomers: 0
  })

  const handleInputChange = (field: keyof CustomerCounts, value: string) => {
    const numValue = parseInt(value) || 0
    setTempValues(prev => ({
      ...prev,
      [field]: numValue
    }))
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

  const handleReset = () => {
    setCounts({
      newCustomers: 0,
      depositCustomers: 0,
      extensionCustomers: 0,
      totalCustomers: 0,
      targetCustomers: 0
    })
    setTempValues({
      newCustomers: 0,
      depositCustomers: 0,
      extensionCustomers: 0,
      totalCustomers: 0,
      targetCustomers: 0
    })
  }

  const calculateTotal = () => {
    return counts.newCustomers + counts.depositCustomers + counts.extensionCustomers
  }

  const calculateProgress = () => {
    const total = calculateTotal()
    const target = counts.targetCustomers || 1
    return Math.min((total / target) * 100, 100)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">จำนวนลูกค้า</h1>
        <Button onClick={handleReset} variant="outline">
          รีเซ็ตทั้งหมด
        </Button>
      </div>

      {/* ส่วนเพิ่มจำนวนลูกค้าแบบตัวเลข */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            เพิ่มจำนวนลูกค้า
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* 1. ลูกค้าใหม่ */}
            <div className="text-center p-4 border rounded-lg bg-green-50">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {counts.newCustomers}
              </div>
              <div className="text-sm text-gray-600 mb-3">ลูกค้าใหม่</div>
              <div className="space-y-2">
                <div className="flex gap-1 justify-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddCount('newCustomers', -1)}
                    className="h-8 w-8 p-0"
                  >
                    -
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddCount('newCustomers', 1)}
                    className="h-8 w-8 p-0"
                  >
                    +
                  </Button>
                </div>
                <Input
                  type="number"
                  value={tempValues.newCustomers}
                  onChange={(e) => handleInputChange('newCustomers', e.target.value)}
                  placeholder="กำหนดค่า"
                  className="text-center"
                  min="0"
                />
                <Button
                  size="sm"
                  onClick={() => handleSetCount('newCustomers')}
                  className="w-full"
                >
                  ตั้งค่า
                </Button>
              </div>
            </div>

            {/* 2. ลูกค้าฝาก */}
            <div className="text-center p-4 border rounded-lg bg-blue-50">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {counts.depositCustomers}
              </div>
              <div className="text-sm text-gray-600 mb-3">ลูกค้าฝาก</div>
              <div className="space-y-2">
                <div className="flex gap-1 justify-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddCount('depositCustomers', -1)}
                    className="h-8 w-8 p-0"
                  >
                    -
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddCount('depositCustomers', 1)}
                    className="h-8 w-8 p-0"
                  >
                    +
                  </Button>
                </div>
                <Input
                  type="number"
                  value={tempValues.depositCustomers}
                  onChange={(e) => handleInputChange('depositCustomers', e.target.value)}
                  placeholder="กำหนดค่า"
                  className="text-center"
                  min="0"
                />
                <Button
                  size="sm"
                  onClick={() => handleSetCount('depositCustomers')}
                  className="w-full"
                >
                  ตั้งค่า
                </Button>
              </div>
            </div>

            {/* 3. ลูกค้าต่อยอด */}
            <div className="text-center p-4 border rounded-lg bg-purple-50">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {counts.extensionCustomers}
              </div>
              <div className="text-sm text-gray-600 mb-3">ลูกค้าต่อยอด</div>
              <div className="space-y-2">
                <div className="flex gap-1 justify-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddCount('extensionCustomers', -1)}
                    className="h-8 w-8 p-0"
                  >
                    -
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddCount('extensionCustomers', 1)}
                    className="h-8 w-8 p-0"
                  >
                    +
                  </Button>
                </div>
                <Input
                  type="number"
                  value={tempValues.extensionCustomers}
                  onChange={(e) => handleInputChange('extensionCustomers', e.target.value)}
                  placeholder="กำหนดค่า"
                  className="text-center"
                  min="0"
                />
                <Button
                  size="sm"
                  onClick={() => handleSetCount('extensionCustomers')}
                  className="w-full"
                >
                  ตั้งค่า
                </Button>
              </div>
            </div>

            {/* 4. รวมทั้งหมด */}
            <div className="text-center p-4 border rounded-lg bg-orange-50">
              <div className="text-2xl font-bold text-orange-600 mb-2">
                {calculateTotal()}
              </div>
              <div className="text-sm text-gray-600 mb-3">รวมทั้งหมด</div>
              <div className="space-y-2">
                <div className="text-xs text-gray-500">
                  ลูกค้าใหม่: {counts.newCustomers}
                </div>
                <div className="text-xs text-gray-500">
                  ลูกค้าฝาก: {counts.depositCustomers}
                </div>
                <div className="text-xs text-gray-500">
                  ต่อยอด: {counts.extensionCustomers}
                </div>
                <div className="mt-2 pt-2 border-t">
                  <div className="text-sm font-semibold text-orange-700">
                    คิดเป็น: {calculateProgress().toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* 5. เป้าหมาย */}
            <div className="text-center p-4 border rounded-lg bg-red-50">
              <div className="text-2xl font-bold text-red-600 mb-2">
                {counts.targetCustomers}
              </div>
              <div className="text-sm text-gray-600 mb-3">เป้าหมาย</div>
              <div className="space-y-2">
                <div className="flex gap-1 justify-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddCount('targetCustomers', -10)}
                    className="h-8 px-2"
                  >
                    -10
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddCount('targetCustomers', -1)}
                    className="h-8 w-8 p-0"
                  >
                    -
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddCount('targetCustomers', 1)}
                    className="h-8 w-8 p-0"
                  >
                    +
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddCount('targetCustomers', 10)}
                    className="h-8 px-2"
                  >
                    +10
                  </Button>
                </div>
                <Input
                  type="number"
                  value={tempValues.targetCustomers}
                  onChange={(e) => handleInputChange('targetCustomers', e.target.value)}
                  placeholder="กำหนดเป้าหมาย"
                  className="text-center"
                  min="0"
                />
                <Button
                  size="sm"
                  onClick={() => handleSetCount('targetCustomers')}
                  className="w-full"
                >
                  ตั้งค่า
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* สรุปข้อมูล */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ยอดรวมทั้งหมด</p>
                <p className="text-2xl font-bold text-gray-900">{calculateTotal()}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">เป้าหมาย</p>
                <p className="text-2xl font-bold text-gray-900">{counts.targetCustomers}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ความคืบหน้า</p>
                <p className="text-2xl font-bold text-gray-900">{calculateProgress().toFixed(1)}%</p>
              </div>
              <Calculator className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* แถบความคืบหน้า */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>ความคืบหน้าในการบรรลุเป้าหมาย</span>
              <span>{calculateTotal()} / {counts.targetCustomers} ({calculateProgress().toFixed(1)}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-300"
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}