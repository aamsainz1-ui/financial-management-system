'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { FileText, Download, Calendar, TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart, LineChart } from 'lucide-react'

export function Reports() {
  const [reportPeriod, setReportPeriod] = useState('month')
  const [reportType, setReportType] = useState('summary')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">รายงาน</h1>
        <p className="text-gray-600 mt-2">รายงานการเงินและสรุปภาพรวม</p>
      </div>

      {/* Report Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            ตัวเลือกรายงาน
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">ช่วงเวลา</label>
              <Select value={reportPeriod} onValueChange={setReportPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">สัปดาห์นี้</SelectItem>
                  <SelectItem value="month">เดือนนี้</SelectItem>
                  <SelectItem value="quarter">ไตรมาสนี้</SelectItem>
                  <SelectItem value="year">ปีนี้</SelectItem>
                  <SelectItem value="custom">กำหนดเอง</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">ประเภทรายงาน</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">สรุปภาพรวม</SelectItem>
                  <SelectItem value="income">รายรับ</SelectItem>
                  <SelectItem value="expense">รายจ่าย</SelectItem>
                  <SelectItem value="profit">กำไรขาดทุน</SelectItem>
                  <SelectItem value="category">ตามหมวดหมู่</SelectItem>
                  <SelectItem value="team">ตามทีม</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">&nbsp;</label>
              <Button className="w-full">
                <Download className="h-4 w-4 mr-2" />
                ส่งออกรายงาน
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              รายรับทั้งหมด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">฿125,000</div>
            <p className="text-xs text-muted-foreground">+20.1% จากเดือนที่แล้ว</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              รายจ่ายทั้งหมด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">฿85,000</div>
            <p className="text-xs text-muted-foreground">+5.2% จากเดือนที่แล้ว</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              กำไรสุทธิ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">฿40,000</div>
            <p className="text-xs text-muted-foreground">+45.3% จากเดือนที่แล้ว</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-600" />
              อัตรากำไร
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">32%</div>
            <p className="text-xs text-muted-foreground">+8.5% จากเดือนที่แล้ว</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              แนวโน้มรายรับรายจ่าย
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <LineChart className="h-12 w-12 mx-auto mb-2" />
                <p>กราฟแนวโน้มรายรับรายจ่าย</p>
                <p className="text-sm">จะแสดงข้อมูลเมื่อมีข้อมูลจริง</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              สัดส่วนรายจ่ายตามหมวดหมู่
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <PieChart className="h-12 w-12 mx-auto mb-2" />
                <p>กราฟวงกลมสัดส่วนรายจ่าย</p>
                <p className="text-sm">จะแสดงข้อมูลเมื่อมีข้อมูลจริง</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Card>
        <CardHeader>
          <CardTitle>รายงานละเอียด</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">รายรับตามหมวดหมู่</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { category: 'การขาย', amount: 95000, percentage: 76 },
                      { category: 'บริการ', amount: 20000, percentage: 16 },
                      { category: 'อื่นๆ', amount: 10000, percentage: 8 },
                    ].map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{item.category}</span>
                          <span className="font-medium">฿{item.amount.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">รายจ่ายตามหมวดหมู่</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { category: 'ค่าจ้าง/เงินเดือน', amount: 45000, percentage: 53 },
                      { category: 'การตลาด', amount: 20000, percentage: 24 },
                      { category: 'การดำเนินงาน', amount: 12000, percentage: 14 },
                      { category: 'อื่นๆ', amount: 8000, percentage: 9 },
                    ].map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{item.category}</span>
                          <span className="font-medium">฿{item.amount.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">สรุปตามทีม</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { team: 'ทีมขาย', income: 95000, expense: 15000, profit: 80000 },
                    { team: 'ทีมการตลาด', income: 20000, expense: 35000, profit: -15000 },
                    { team: 'ทีม IT', income: 10000, expense: 20000, profit: -10000 },
                    { team: 'ทีมบริหาร', income: 0, expense: 15000, profit: -15000 },
                  ].map((team, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{team.team}</p>
                        <div className="flex gap-4 mt-1">
                          <span className="text-sm text-green-600">รายรับ: ฿{team.income.toLocaleString()}</span>
                          <span className="text-sm text-red-600">รายจ่าย: ฿{team.expense.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${team.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {team.profit >= 0 ? '+' : ''}฿{team.profit.toLocaleString()}
                        </p>
                        <Badge variant={team.profit >= 0 ? 'default' : 'destructive'}>
                          {team.profit >= 0 ? 'กำไร' : 'ขาดทุน'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}