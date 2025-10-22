'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Users } from 'lucide-react'

export function SimpleCustomerCounter() {
  const [count, setCount] = useState(0)

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">จำนวนลูกค้า</h1>
      
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            เพิ่มจำนวนลูกค้า
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="text-4xl font-bold text-blue-600">{count}</div>
            <div className="flex gap-2 justify-center">
              <Button 
                variant="outline" 
                onClick={() => setCount(Math.max(0, count - 1))}
              >
                ลบ
              </Button>
              <Button 
                onClick={() => setCount(count + 1)}
              >
                เพิ่ม
              </Button>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setCount(0)}
              className="w-full"
            >
              รีเซ็ต
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}