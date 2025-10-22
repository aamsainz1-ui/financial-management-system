'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

interface Member {
  id: string
  name: string
  email: string
  team?: {
    name: string
  }
}

interface Salary {
  id: string
  amount: number
  payDate: string
  month: number
  year: number
  status: string
  description?: string
  member: Member
}

interface Bonus {
  id: string
  amount: number
  reason?: string
  date: string
  status: string
  member: Member
}

interface Commission {
  id: string
  amount: number
  percentage?: number
  salesAmount?: number
  description?: string
  date: string
  status: string
  member: Member
}

interface PayrollTrendChartProps {
  salaries: Salary[]
  bonuses: Bonus[]
  commissions: Commission[]
}

const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export function PayrollTrendChart({ salaries, bonuses, commissions }: PayrollTrendChartProps) {
  // Prepare monthly trend data
  const monthlyData = monthNames.map((month, index) => {
    const monthNum = index + 1
    const currentYear = new Date().getFullYear()
    
    const monthSalaries = salaries.filter(s => 
      s.month === monthNum && s.year === currentYear && s.status === 'paid'
    ).reduce((sum, s) => sum + s.amount, 0)
    
    const monthBonuses = bonuses.filter(b => {
      const date = new Date(b.date)
      return date.getMonth() + 1 === monthNum && date.getFullYear() === currentYear && b.status === 'paid'
    }).reduce((sum, b) => sum + b.amount, 0)
    
    const monthCommissions = commissions.filter(c => {
      const date = new Date(c.date)
      return date.getMonth() + 1 === monthNum && date.getFullYear() === currentYear && c.status === 'paid'
    }).reduce((sum, c) => sum + c.amount, 0)
    
    return {
      month,
      เงินเดือน: monthSalaries,
      โบนัส: monthBonuses,
      ค่าคอมมิชชัน: monthCommissions,
      รวม: monthSalaries + monthBonuses + monthCommissions
    }
  }).filter(data => data.รวม > 0)

  // Prepare payment type distribution
  const totalSalaries = salaries.filter(s => s.status === 'paid').reduce((sum, s) => sum + s.amount, 0)
  const totalBonuses = bonuses.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.amount, 0)
  const totalCommissions = commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0)
  
  const paymentTypeData = [
    { name: 'เงินเดือน', value: totalSalaries, color: '#0088FE' },
    { name: 'โบนัส', value: totalBonuses, color: '#00C49F' },
    { name: 'ค่าคอมมิชชัน', value: totalCommissions, color: '#FFBB28' }
  ].filter(item => item.value > 0)

  // Prepare team comparison data
  const teamData = salaries.reduce((acc, salary) => {
    if (salary.status !== 'paid') return acc
    
    const teamName = salary.member.team?.name || 'ไม่มีทีม'
    if (!acc[teamName]) {
      acc[teamName] = { team: teamName, amount: 0, count: 0 }
    }
    acc[teamName].amount += salary.amount
    acc[teamName].count += 1
    return acc
  }, {} as Record<string, any>)

  const teamComparisonData = Object.values(teamData)
    .sort((a: any, b: any) => b.amount - a.amount)
    .slice(0, 6)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly Trend */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>แนวโน้มการจ่ายค่าตอบแทนรายเดือน</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `฿${(value / 1000).toFixed(0)}K`} />
              <Tooltip 
                formatter={(value: number) => [`฿${value.toLocaleString()}`, '']}
                labelFormatter={(label) => `เดือน ${label}`}
              />
              <Line type="monotone" dataKey="เงินเดือน" stroke="#0088FE" strokeWidth={2} />
              <Line type="monotone" dataKey="โบนัส" stroke="#00C49F" strokeWidth={2} />
              <Line type="monotone" dataKey="ค่าคอมมิชชัน" stroke="#FFBB28" strokeWidth={2} />
              <Line type="monotone" dataKey="รวม" stroke="#FF8042" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Payment Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>สัดส่วนประเภทการจ่าย</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={paymentTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {paymentTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`฿${value.toLocaleString()}`, '']} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Team Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>เปรียบเทียบค่าเงินเดือนต่อทีม</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={teamComparisonData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={(value) => `฿${(value / 1000).toFixed(0)}K`} />
              <YAxis dataKey="team" type="category" width={80} />
              <Tooltip formatter={(value: number) => [`฿${value.toLocaleString()}`, '']} />
              <Bar dataKey="amount" fill="#0088FE" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}