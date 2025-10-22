'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DateTimeFilterComponent, DateTimeFilter } from '@/components/ui/date-time-picker'
import { TrendingUp, TrendingDown, DollarSign, Users, UserPlus, Calendar, BarChart3, PieChart, TrendingUp as TrendingUpIcon } from 'lucide-react'
import { getCurrentThaiDate, formatThaiDate } from '@/lib/timeUtils'
import { IncomeExpenseLineChart } from '@/components/charts/income-expense-line-chart'
import { ExpensePieChart } from '@/components/charts/expense-pie-chart'
import { SalaryBonusCommissionChart } from '@/components/charts/salary-bonus-commission-chart'

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
  recentCustomerRecords?: any[]
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

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState<string>('')
  const [dateTimeFilter, setDateTimeFilter] = useState<DateTimeFilter>({
    startDateTime: '',
    endDateTime: ''
  })

  const fetchDashboardData = async (filter?: DateTimeFilter) => {
    try {
      console.log('Fetching dashboard data...')
      
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
      if (!response.ok) throw new Error('Failed to fetch dashboard data')
      const dashboardData = await response.json()
      
      // Get current Thai date
      const thaiDate = getCurrentThaiDate()
      setCurrentDate(thaiDate)
      
      console.log('Dashboard data:', dashboardData)
      setData(dashboardData)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData(dateTimeFilter)
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

  if (loading) {
    return <div className="flex items-center justify-center h-64">กำลังโหลด...</div>
  }

  if (!data) {
    return <div className="flex items-center justify-center h-64">เกิดข้อผิดพลาดในการโหลดข้อมูล</div>
  }

  return (
    <div className="space-y-3 sm:space-y-4 px-2 sm:px-4 lg:px-0">
      <div className="text-center sm:text-left">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">แดชบอร์ด</h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">
          ภาพรวมรายรับรายจ่ายการตลาด
          {currentDate && !data.filtered && (
            <span className="ml-2 text-sm font-medium text-blue-600 block sm:inline">
              (วันที่แสดง: {formatThaiDate(currentDate)})
            </span>
          )}
          {data.filtered && (
            <span className="ml-2 text-sm font-medium text-orange-600 block sm:inline">
              (กรองตามช่วงเวลา)
            </span>
          )}
        </p>
      </div>

      {/* Date-Time Filter */}
      <DateTimeFilterComponent
        filter={dateTimeFilter}
        onFilterChange={handleDateTimeFilterChange}
        onClearFilter={handleClearDateTimeFilter}
      />

      {/* Filter Status */}
      {data.filtered && data.filterRange && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <Calendar className="h-4 w-4 text-orange-600 flex-shrink-0" />
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
              <Badge variant="secondary" className="text-orange-700 self-start sm:self-auto">
                กำลังแสดงข้อมูลที่กรอง
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
        <Card className="shadow-lg border-0 rounded-xl bg-gradient-to-br from-green-50 to-green-100 hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-green-800">รายรับ</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-700">฿{(data.totalIncome || 0).toLocaleString()}</div>
            <p className="text-xs text-green-600 mt-1">
              {data.filtered ? 'ช่วงเวลา' : 'เดือนปัจจุบัน'}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 rounded-xl bg-gradient-to-br from-red-50 to-red-100 hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-red-800">รายจ่าย</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-red-700">฿{(data.totalExpense || 0).toLocaleString()}</div>
            <p className="text-xs text-red-600 mt-1">
              {data.filtered ? 'ช่วงเวลา' : 'เดือนปัจจุบัน'}
              {data.paidCompensation && data.paidCompensation.total > 0 && (
                <span className="block text-xs text-orange-600 mt-1">
                  ค่าตอบแทน: ฿{data.paidCompensation.total.toLocaleString()}
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-blue-800">กำไรสุทธิ</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className={`text-lg sm:text-xl lg:text-2xl font-bold ${data.netProfit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
              ฿{(data.netProfit || 0).toLocaleString()}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              {data.filtered ? 'ช่วงเวลา' : 'เดือนปัจจุบัน'}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-purple-800">สมาชิก</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-700">{data.membersCount}</div>
            <p className="text-xs text-purple-600 mt-1">
              {data.teamsCount || 0} ทีม
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-xl transition-shadow duration-300 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-orange-800">ลูกค้า</CardTitle>
            <UserPlus className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 lg:p-6">
            <div className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-700">{data.customersCount}</div>
            <p className="text-xs text-orange-600 mt-1">
              <span className="hidden sm:inline">ใหม่: {data.customerStats?.new || 0} | ฝาก: {data.customerStats?.deposit || 0}</span>
              <span className="sm:hidden">ใหม่: {data.customerStats?.new || 0}</span>
            </p>
          </CardContent>
        </Card>
      </div>

  

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Income vs Expenses Line Chart */}
        <Card className="shadow-lg border-0 rounded-xl hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 rounded-t-xl">
            <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-gray-800">
              <div className="flex items-center gap-2">
                <TrendingUpIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-sm sm:text-base">รายรับเทียบรายจ่ายรายเดือน</span>
              </div>
              {data.filtered && (
                <Badge variant="secondary" className="text-xs self-start sm:self-auto">
                  กรองตามวันที่
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {data.monthlyData && data.monthlyData.length > 0 ? (
              <div className="h-64 sm:h-80">
                <IncomeExpenseLineChart data={data.monthlyData} />
              </div>
            ) : (
              <div className="h-64 sm:h-80 flex items-center justify-center text-gray-500">
                ไม่มีข้อมูลรายเดือน
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expense Pie Chart */}
        <Card className="shadow-lg border-0 rounded-xl hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-xl">
            <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-gray-800">
              <div className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-orange-600 flex-shrink-0" />
                <span className="text-sm sm:text-base">สัดส่วนค่าใช้จ่าย</span>
              </div>
              {data.filtered && (
                <Badge variant="secondary" className="text-xs self-start sm:self-auto">
                  กรองตามวันที่
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {data.expensePieData && data.expensePieData.length > 0 ? (
              <div className="h-64 sm:h-80">
                <ExpensePieChart data={data.expensePieData} />
              </div>
            ) : (
              <div className="h-64 sm:h-80 flex items-center justify-center text-gray-500">
                ไม่มีข้อมูลค่าใช้จ่าย
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Salary, Bonus, Commission Chart */}
      <Card className="shadow-lg border-0 rounded-xl hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-xl">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-gray-800">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600 flex-shrink-0" />
              <span className="text-sm sm:text-base">ค่าตอบแทนพนักงานรายเดือน</span>
            </div>
            <span className="text-xs sm:text-sm text-gray-600">(เงินเดือน + โบนัส + ค่าคอมมิชชัน)</span>
            {data.filtered && (
              <Badge variant="secondary" className="text-xs self-start sm:self-auto">
                กรองตามวันที่
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {data.salaryData && data.salaryData.length > 0 ? (
            <div className="h-64 sm:h-80">
              <SalaryBonusCommissionChart data={data.salaryData} />
            </div>
          ) : (
            <div className="h-64 sm:h-80 flex items-center justify-center text-gray-500">
              ไม่มีข้อมูลค่าตอบแทนพนักงาน
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        <Card className="shadow-lg border-0 rounded-xl hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-t-xl">
            <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-gray-800">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base">ธุรกรรมล่าสุด</span>
              </div>
              {data.filtered && (
                <Badge variant="secondary" className="text-xs self-start sm:self-auto">
                  กรองตามวันที่
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 overflow-y-auto">
              {data.recentTransactions && data.recentTransactions.length > 0 ? (
                data.recentTransactions.map((transaction: any, index: number) => (
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-gray-200 rounded-lg bg-white shadow-sm gap-2 sm:gap-0">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{transaction.title || 'ไม่มีชื่อ'}</p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {transaction.team?.name || 'ไม่ระบุทีม'}
                        <span className="ml-2 text-xs text-gray-400 block sm:inline">
                          {new Date(transaction.date).toLocaleDateString('th-TH')} {new Date(transaction.date).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-sm sm:text-base ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'}฿{(transaction.amount || 0).toLocaleString()}
                      </p>
                      <Badge variant={transaction.type === 'income' ? 'default' : 'secondary'} className="text-xs">
                        {transaction.type === 'income' ? 'รายรับ' : 'รายจ่าย'}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-6 sm:py-8">
                  {data.filtered ? 'ไม่พบข้อมูลธุรกรรมในช่วงเวลาที่เลือก' : 'ยังไม่มีข้อมูลธุรกรรม'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 rounded-xl hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-t-xl">
            <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-gray-800">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base">สรุปตามหมวดหมู่</span>
              </div>
              {data.filtered && (
                <Badge variant="secondary" className="text-xs self-start sm:self-auto">
                  กรองตามวันที่
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 overflow-y-auto">
              {data.categoryBreakdown && data.categoryBreakdown.length > 0 ? (
                data.categoryBreakdown.map((item: any, index: number) => {
                  const total = data.categoryBreakdown.reduce((sum, cat) => sum + (cat.amount || 0), 0)
                  const percentage = total > 0 ? ((item.amount || 0) / total) * 100 : 0
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700 truncate flex-1 mr-2">{item.name || 'ไม่มีชื่อ'}</span>
                        <span className="font-medium text-gray-900 whitespace-nowrap">฿{(item.amount || 0).toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-gray-500 text-center py-6 sm:py-8">
                  {data.filtered ? 'ไม่พบข้อมูลหมวดหมู่ในช่วงเวลาที่เลือก' : 'ยังไม่มีข้อมูลหมวดหมู่'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 rounded-xl hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-100 rounded-t-xl">
            <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-gray-800">
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base">บันทึกลูกค้าล่าสุด</span>
              </div>
              {data.filtered && (
                <Badge variant="secondary" className="text-xs self-start sm:self-auto">
                  กรองตามวันที่
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 overflow-y-auto">
              {data.recentCustomerRecords && data.recentCustomerRecords.length > 0 ? (
                data.recentCustomerRecords.map((record: any, index: number) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                      <p className="font-medium text-sm text-gray-900">{record.teamName}</p>
                      <Badge variant="outline" className="text-xs self-start sm:self-auto">
                        {new Date(record.date).toLocaleDateString('th-TH')} {new Date(record.date).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600">ใหม่:</span>
                        <span className="font-bold text-blue-600 ml-1">{record.newCustomers}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">ฝาก:</span>
                        <span className="font-bold text-green-600 ml-1">{record.depositCustomers}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">ค่าใช้จ่าย:</span>
                        <span className="font-bold text-orange-600 ml-1">฿{(record.expenses || 0).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">รวม:</span>
                        <span className="font-bold text-purple-600 ml-1">{record.totalCustomers}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  {data.filtered ? 'ไม่พบข้อมูลลูกค้าในช่วงเวลาที่เลือก' : 'ยังไม่มีข้อมูลลูกค้าที่บันทึก'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}