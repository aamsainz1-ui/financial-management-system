'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, DollarSign, Users, UserPlus, Target } from 'lucide-react'
import { api } from '@/lib/api'

interface DashboardData {
  totalIncome: number
  totalExpense: number
  netProfit: number
  teamsCount: number
  membersCount: number
  customersCount: number
  customerStats: {
    new: number
    deposit: number
    extension: number
  }
  recentTransactions: any[]
  categoryBreakdown: any[]
}

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching dashboard data...')
        const [dashboardData, customerSummary] = await Promise.all([
          api.dashboard.getData(),
          fetch('/api/customers/summary').then(res => res.json())
        ])
        
        const enhancedData = {
          ...dashboardData,
          customersCount: Object.values(customerSummary.customerCounts || {}).reduce((sum: number, count: any) => sum + count, 0),
          customerStats: customerSummary.customerCounts || { new: 0, deposit: 0, extension: 0 }
        }
        
        console.log('Enhanced dashboard data:', enhancedData)
        setData(enhancedData)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-64">กำลังโหลด...</div>
  }

  if (!data) {
    return <div className="flex items-center justify-center h-64">เกิดข้อผิดพลาดในการโหลดข้อมูล</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">แดชบอร์ด</h1>
        <p className="text-gray-600 mt-2">ภาพรวมรายรับรายจ่ายการตลาด</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">รายรับทั้งหมด</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">฿{data.totalIncome.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              เดือนปัจจุบัน
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">รายจ่ายทั้งหมด</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">฿{data.totalExpense.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              เดือนปัจจุบัน
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">กำไรสุทธิ</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              ฿{data.netProfit.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              เดือนปัจจุบัน
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">สมาชิกทีม</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{data.membersCount}</div>
            <p className="text-xs text-muted-foreground">
              {data.teamsCount} ทีมทำงาน
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ลูกค้าทั้งหมด</CardTitle>
            <UserPlus className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{data.customersCount}</div>
            <p className="text-xs text-muted-foreground">
              ใหม่: {data.customerStats.new} | ฝาก: {data.customerStats.deposit} | ต่อยอด: {data.customerStats.extension}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>ธุรกรรมล่าสุด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentTransactions.map((transaction: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{transaction.title}</p>
                    <p className="text-sm text-gray-500">{transaction.team?.name || 'ไม่ระบุทีม'}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.type === 'income' ? '+' : '-'}฿{transaction.amount.toLocaleString()}
                    </p>
                    <Badge variant={transaction.type === 'income' ? 'default' : 'secondary'}>
                      {transaction.type === 'income' ? 'รายรับ' : 'รายจ่าย'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>สรุปตามหมวดหมู่</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.categoryBreakdown.map((item: any, index: number) => {
                const total = data.categoryBreakdown.reduce((sum, cat) => sum + cat.amount, 0)
                const percentage = total > 0 ? (item.amount / total) * 100 : 0
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{item.name}</span>
                      <span className="font-medium">฿{item.amount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}