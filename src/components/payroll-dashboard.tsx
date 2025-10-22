'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { DollarSign, TrendingUp, TrendingDown, Users, Calendar, CheckCircle, Clock, XCircle, Award, Target } from 'lucide-react'

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

interface PayrollDashboardProps {
  salaries: Salary[]
  bonuses: Bonus[]
  commissions: Commission[]
  members: Member[]
}

export function PayrollDashboard({ salaries, bonuses, commissions, members }: PayrollDashboardProps) {
  // Calculate statistics
  const totalSalariesPaid = salaries.filter(s => s.status === 'paid').reduce((sum, s) => sum + s.amount, 0)
  const totalSalariesPending = salaries.filter(s => s.status === 'pending').reduce((sum, s) => sum + s.amount, 0)
  const totalBonusesPaid = bonuses.filter(b => b.status === 'paid').reduce((sum, b) => sum + b.amount, 0)
  const totalBonusesPending = bonuses.filter(b => b.status === 'pending').reduce((sum, b) => sum + b.amount, 0)
  const totalCommissionsPaid = commissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.amount, 0)
  const totalCommissionsPending = commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0)

  const totalPaid = totalSalariesPaid + totalBonusesPaid + totalCommissionsPaid
  const totalPending = totalSalariesPending + totalBonusesPending + totalCommissionsPending
  const totalAll = totalPaid + totalPending

  // Monthly statistics
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  const currentMonthSalaries = salaries.filter(s => s.month === currentMonth && s.year === currentYear)
  const currentMonthPaid = currentMonthSalaries.filter(s => s.status === 'paid').reduce((sum, s) => sum + s.amount, 0)
  const currentMonthPending = currentMonthSalaries.filter(s => s.status === 'pending').reduce((sum, s) => sum + s.amount, 0)

  // Team statistics
  const teamStats = members.reduce((acc, member) => {
    const teamName = member.team?.name || 'ไม่มีทีม'
    if (!acc[teamName]) {
      acc[teamName] = { name: teamName, members: 0, totalSalary: 0, totalBonus: 0, totalCommission: 0 }
    }
    acc[teamName].members += 1
    
    const memberSalaries = salaries.filter(s => s.memberId === member.id && s.status === 'paid')
    const memberBonuses = bonuses.filter(b => b.memberId === member.id && b.status === 'paid')
    const memberCommissions = commissions.filter(c => c.memberId === member.id && c.status === 'paid')
    
    acc[teamName].totalSalary += memberSalaries.reduce((sum, s) => sum + s.amount, 0)
    acc[teamName].totalBonus += memberBonuses.reduce((sum, b) => sum + b.amount, 0)
    acc[teamName].totalCommission += memberCommissions.reduce((sum, c) => sum + c.amount, 0)
    
    return acc
  }, {} as Record<string, any>)

  // Top performers
  const topEarners = members
    .map(member => {
      const memberSalaries = salaries.filter(s => s.memberId === member.id && s.status === 'paid')
      const memberBonuses = bonuses.filter(b => b.memberId === member.id && b.status === 'paid')
      const memberCommissions = commissions.filter(c => c.memberId === member.id && c.status === 'paid')
      
      const totalEarnings = 
        memberSalaries.reduce((sum, s) => sum + s.amount, 0) +
        memberBonuses.reduce((sum, b) => sum + b.amount, 0) +
        memberCommissions.reduce((sum, c) => sum + c.amount, 0)
      
      return { member, totalEarnings }
    })
    .sort((a, b) => b.totalEarnings - a.totalEarnings)
    .slice(0, 5)

  const monthNames = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">แดชบอร์ดค่าตอบแทน</h2>
        <p className="text-gray-600 mt-1">ภาพรวมการจ่ายค่าตอบแทนทั้งหมด</p>
      </div>

      {/* Main Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              ยอดรวมทั้งหมด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ฿{totalAll.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              จ่ายแล้ว ฿{totalPaid.toLocaleString()} | รอชำระ ฿{totalPending.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              จ่ายแล้ว
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ฿{totalPaid.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {salaries.filter(s => s.status === 'paid').length + bonuses.filter(b => b.status === 'paid').length + commissions.filter(c => c.status === 'paid').length} รายการ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              รอชำระ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ฿{totalPending.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {salaries.filter(s => s.status === 'pending').length + bonuses.filter(b => b.status === 'pending').length + commissions.filter(c => c.status === 'pending').length} รายการ
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              พนักงานทั้งหมด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {members.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {Object.keys(teamStats).length} ทีม
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Current Month Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            ภาพรวมเดือน {monthNames[currentMonth - 1]} {currentYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">เงินเดือน</span>
                <span className="text-sm text-gray-600">฿{currentMonthPaid.toLocaleString()}</span>
              </div>
              <Progress value={(currentMonthPaid / (currentMonthPaid + currentMonthPending)) * 100} className="h-2" />
              <p className="text-xs text-muted-foreground">
                จ่ายแล้ว {currentMonthSalaries.filter(s => s.status === 'paid').length}/{currentMonthSalaries.length} คน
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">โบนัส</span>
                <span className="text-sm text-gray-600">฿{bonuses.filter(b => b.status === 'paid' && new Date(b.date).getMonth() + 1 === currentMonth).reduce((sum, b) => sum + b.amount, 0).toLocaleString()}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {bonuses.filter(b => new Date(b.date).getMonth() + 1 === currentMonth).length} รายการ
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">ค่าคอมมิชชัน</span>
                <span className="text-sm text-gray-600">฿{commissions.filter(c => c.status === 'paid' && new Date(c.date).getMonth() + 1 === currentMonth).reduce((sum, c) => sum + c.amount, 0).toLocaleString()}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {commissions.filter(c => new Date(c.date).getMonth() + 1 === currentMonth).length} รายการ
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              สถิติต่อทีม
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.values(teamStats).map((team: any, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{team.name}</span>
                    <span className="text-sm text-gray-600">฿{(team.totalSalary + team.totalBonus + team.totalCommission).toLocaleString()}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">เงินเดือน: </span>
                      <span className="font-medium">฿{team.totalSalary.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">โบนัส: </span>
                      <span className="font-medium">฿{team.totalBonus.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">คอม: </span>
                      <span className="font-medium">฿{team.totalCommission.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {team.members} พนักงาน
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              พนักงานที่ได้รับค่าตอบแทนสูงสุด
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topEarners.map((earner, index) => (
                <div key={earner.member.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{earner.member.name}</div>
                      <div className="text-xs text-muted-foreground">{earner.member.team?.name || '-'}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-green-600">฿{earner.totalEarnings.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>ภาพรวมสถานะการจ่ายเงิน</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mx-auto">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div className="text-2xl font-bold text-green-600">
                {salaries.filter(s => s.status === 'paid').length + bonuses.filter(b => b.status === 'paid').length + commissions.filter(c => c.status === 'paid').length}
              </div>
              <div className="text-sm text-muted-foreground">จ่ายแล้ว</div>
            </div>
            
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 text-orange-600 mx-auto">
                <Clock className="h-6 w-6" />
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {salaries.filter(s => s.status === 'pending').length + bonuses.filter(b => b.status === 'pending').length + commissions.filter(c => c.status === 'pending').length}
              </div>
              <div className="text-sm text-muted-foreground">รอชำระ</div>
            </div>
            
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto">
                <XCircle className="h-6 w-6" />
              </div>
              <div className="text-2xl font-bold text-red-600">
                {salaries.filter(s => s.status === 'cancelled').length + bonuses.filter(b => b.status === 'cancelled').length + commissions.filter(c => c.status === 'cancelled').length}
              </div>
              <div className="text-sm text-muted-foreground">ยกเลิก</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}