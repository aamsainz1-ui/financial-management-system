'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { DateTimeFilterComponent, DateTimeFilter } from '@/components/ui/date-time-picker'
import { FileText, Download, Calendar, TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart, LineChart } from 'lucide-react'
import { IncomeExpenseLineChart } from '@/components/charts/income-expense-line-chart'
import { ExpensePieChart } from '@/components/charts/expense-pie-chart'
import { SalaryBonusCommissionChart } from '@/components/charts/salary-bonus-commission-chart'

interface ReportData {
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
  monthlyData?: any[]
  expensePieData?: any[]
  salaryData?: any[]
  paidCompensation?: {
    salaries: number
    bonuses: number
    commissions: number
    total: number
  }
  filtered?: boolean
  filterRange?: {
    startDateTime?: string
    endDateTime?: string
  }
}

export function Reports() {
  const [reportPeriod, setReportPeriod] = useState('month')
  const [reportType, setReportType] = useState('summary')
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateTimeFilter, setDateTimeFilter] = useState<DateTimeFilter>({
    startDateTime: '',
    endDateTime: ''
  })

  const fetchReportData = async (filter?: DateTimeFilter) => {
    try {
      console.log('Fetching report data...')
      
      let url = '/api/dashboard'
      if (filter?.startDateTime || filter?.endDateTime) {
        const params = new URLSearchParams()
        if (filter.startDateTime) {
          params.append('startDateTime', filter.startDateTime)
        }
        if (filter.endDateTime) {
          params.append('endDateTime', filter.endDateTime)
        }
        url += `?${params.toString()}`
      }
      
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch report data')
      const reportData = await response.json()
      
      console.log('Report data:', reportData)
      setData(reportData)
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReportData(dateTimeFilter)
  }, [dateTimeFilter])

  const handleDateTimeFilterChange = (filter: DateTimeFilter) => {
    setDateTimeFilter(filter)
    setLoading(true)
  }

  const handleClearDateTimeFilter = () => {
    setDateTimeFilter({ startDateTime: '', endDateTime: '' })
    setLoading(true)
  }

  const formatDateForDisplay = (dateTimeString: string) => {
    if (!dateTimeString) return ''
    try {
      const date = new Date(dateTimeString)
      return date.toLocaleString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateTimeString
    }
  }

  const handleExportReport = () => {
    // สร้างข้อมูลสำหรับส่งออก
    const exportData = {
      reportType,
      period: reportPeriod,
      filterRange: data?.filterRange,
      generatedAt: new Date().toISOString(),
      data: data
    }
    
    // สร้างไฟล์ JSON และดาวน์โหลด
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report-${reportType}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">กำลังโหลดข้อมูลรายงาน...</div>
  }

  if (!data) {
    return <div className="flex items-center justify-center h-64">เกิดข้อผิดพลาดในการโหลดข้อมูลรายงาน</div>
  }

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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <Button className="w-full" onClick={handleExportReport}>
                <Download className="h-4 w-4 mr-2" />
                ส่งออกรายงาน
              </Button>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">&nbsp;</label>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => fetchReportData(dateTimeFilter)}
              >
                <Calendar className="h-4 w-4 mr-2" />
                รีเฟรชข้อมูล
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Date-Time Filter */}
      <DateTimeFilterComponent
        filter={dateTimeFilter}
        onFilterChange={handleDateTimeFilterChange}
        onClearFilter={handleClearDateTimeFilter}
      />

      {/* Filter Status */}
      {data.filtered && data.filterRange && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">ช่วงเวลาที่เลือก:</span>
                {data.filterRange.startDateTime && (
                  <span className="text-sm text-orange-700">
                    จาก: {formatDateForDisplay(data.filterRange.startDateTime)}
                  </span>
                )}
                {data.filterRange.endDateTime && (
                  <span className="text-sm text-orange-700">
                    ถึง: {formatDateForDisplay(data.filterRange.endDateTime)}
                  </span>
                )}
              </div>
              <Badge variant="secondary" className="text-orange-700">
                กำลังแสดงข้อมูลที่กรอง
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

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
            <div className="text-2xl font-bold text-green-600">฿{(data.totalIncome || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {data.filtered ? 'ช่วงเวลาที่เลือก' : 'เดือนปัจจุบัน'}
            </p>
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
            <div className="text-2xl font-bold text-red-600">฿{(data.totalExpense || 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {data.filtered ? 'ช่วงเวลาที่เลือก' : 'เดือนปัจจุบัน'}
              {data.paidCompensation && data.paidCompensation.total > 0 && (
                <span className="block text-xs text-orange-600">
                  รวมค่าตอบแทน: ฿{data.paidCompensation.total.toLocaleString()}
                </span>
              )}
            </p>
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
            <div className={`text-2xl font-bold ${data.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              ฿{(data.netProfit || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {data.filtered ? 'ช่วงเวลาที่เลือก' : 'เดือนปัจจุบัน'}
            </p>
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
            <div className="text-2xl font-bold text-purple-600">
              {data.totalIncome > 0 ? Math.round((data.netProfit / data.totalIncome) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {data.filtered ? 'ช่วงเวลาที่เลือก' : 'เดือนปัจจุบัน'}
            </p>
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
              {data.filtered && (
                <Badge variant="secondary" className="text-xs">
                  กรองตามวันที่
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.monthlyData && data.monthlyData.length > 0 ? (
              <IncomeExpenseLineChart data={data.monthlyData} />
            ) : (
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center text-gray-500">
                  <LineChart className="h-12 w-12 mx-auto mb-2" />
                  <p>กราฟแนวโน้มรายรับรายจ่าย</p>
                  <p className="text-sm">ไม่มีข้อมูลรายเดือน</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              สัดส่วนรายจ่ายตามหมวดหมู่
              {data.filtered && (
                <Badge variant="secondary" className="text-xs">
                  กรองตามวันที่
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.expensePieData && data.expensePieData.length > 0 ? (
              <ExpensePieChart data={data.expensePieData} />
            ) : (
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center text-gray-500">
                  <PieChart className="h-12 w-12 mx-auto mb-2" />
                  <p>กราฟวงกลมสัดส่วนรายจ่าย</p>
                  <p className="text-sm">ไม่มีข้อมูลค่าใช้จ่าย</p>
                </div>
              </div>
            )}
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
                    {data.categoryBreakdown
                      .filter(cat => cat.type === 'income' && cat.amount > 0)
                      .length > 0 ? (
                      data.categoryBreakdown
                        .filter(cat => cat.type === 'income' && cat.amount > 0)
                        .map((item, index) => {
                          const percentage = data.totalIncome > 0 ? Math.round((item.amount / data.totalIncome) * 100) : 0
                          return (
                            <div key={index} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>{item.name}</span>
                                <span className="font-medium">฿{(item.amount || 0).toLocaleString()}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          )
                        })
                    ) : (
                      <p className="text-sm text-gray-500">ไม่มีข้อมูลรายรับตามหมวดหมู่</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">รายจ่ายตามหมวดหมู่</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.categoryBreakdown
                      .filter(cat => cat.type === 'expense' && cat.amount > 0)
                      .length > 0 ? (
                      data.categoryBreakdown
                        .filter(cat => cat.type === 'expense' && cat.amount > 0)
                        .map((item, index) => {
                          const totalExpense = data.categoryBreakdown
                            .filter(cat => cat.type === 'expense')
                            .reduce((sum, cat) => sum + cat.amount, 0)
                          const percentage = totalExpense > 0 ? Math.round((item.amount / totalExpense) * 100) : 0
                          return (
                            <div key={index} className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>{item.name}</span>
                                <span className="font-medium">฿{(item.amount || 0).toLocaleString()}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-red-500 h-2 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          )
                        })
                    ) : (
                      <p className="text-sm text-gray-500">ไม่มีข้อมูลรายจ่ายตามหมวดหมู่</p>
                    )}
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
                  {data.recentTransactions && data.recentTransactions.length > 0 ? (
                    // Group transactions by team
                    Object.entries(
                      data.recentTransactions.reduce((teams: any, transaction: any) => {
                        const teamName = transaction.team?.name || 'ไม่ระบุทีม'
                        if (!teams[teamName]) {
                          teams[teamName] = { income: 0, expense: 0, transactions: [] }
                        }
                        if (transaction.type === 'income') {
                          teams[teamName].income += transaction.amount
                        } else if (transaction.type === 'expense') {
                          teams[teamName].expense += transaction.amount
                        }
                        teams[teamName].transactions.push(transaction)
                        return teams
                      }, {})
                    ).map(([teamName, teamData]: [string, any]) => {
                      const profit = teamData.income - teamData.expense
                      return (
                        <div key={teamName} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{teamName}</p>
                            <div className="flex gap-4 mt-1">
                              <span className="text-sm text-green-600">รายรับ: ฿{teamData.income.toLocaleString()}</span>
                              <span className="text-sm text-red-600">รายจ่าย: ฿{teamData.expense.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {(profit >= 0 ? '+' : '')}฿{profit.toLocaleString()}
                            </p>
                            <Badge variant={profit >= 0 ? 'default' : 'destructive'}>
                              {profit >= 0 ? 'กำไร' : 'ขาดทุน'}
                            </Badge>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-sm text-gray-500">ไม่มีข้อมูลธุรกรรมตามทีม</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Salary, Bonus, Commission Chart */}
      {data.salaryData && data.salaryData.length > 0 && (
        <Card className="shadow-lg border-0 rounded-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-xl">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              ค่าตอบแทนพนักงานรายเดือน (เงินเดือน + โบนัส + ค่าคอมมิชชัน)
              {data.filtered && (
                <Badge variant="secondary" className="text-xs">
                  กรองตามวันที่
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <SalaryBonusCommissionChart data={data.salaryData} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}