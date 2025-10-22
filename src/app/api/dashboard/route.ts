import { NextRequest, NextResponse } from 'next/server'

// Get data from our in-memory APIs
async function getTransactions(startDateTime?: string, endDateTime?: string) {
  try {
    let url = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/transactions`
    if (startDateTime || endDateTime) {
      const params = new URLSearchParams()
      if (startDateTime) {
        params.append('startDateTime', startDateTime)
      }
      if (endDateTime) {
        params.append('endDateTime', endDateTime)
      }
      url += `?${params.toString()}`
    }
    
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch transactions')
    return await response.json()
  } catch (error) {
    console.error('Error fetching transactions for dashboard:', error)
    return []
  }
}

async function getTeams() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/teams`)
    if (!response.ok) throw new Error('Failed to fetch teams')
    return await response.json()
  } catch (error) {
    console.error('Error fetching teams for dashboard:', error)
    return []
  }
}

async function getCategories() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/categories`)
    if (!response.ok) throw new Error('Failed to fetch categories')
    return await response.json()
  } catch (error) {
    console.error('Error fetching categories for dashboard:', error)
    return []
  }
}

async function getCustomerCounts(startDateTime?: string, endDateTime?: string) {
  try {
    let url = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/customer-counts`
    if (startDateTime || endDateTime) {
      const params = new URLSearchParams()
      if (startDateTime) {
        params.append('startDateTime', startDateTime)
      }
      if (endDateTime) {
        params.append('endDateTime', endDateTime)
      }
      url += `?${params.toString()}`
    }
    
    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch customer counts')
    const data = await response.json()
    return Array.isArray(data) ? data : (data.records || [])
  } catch (error) {
    console.error('Error fetching customer counts for dashboard:', error)
    return []
  }
}

async function getSalaries() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/salaries`)
    if (!response.ok) throw new Error('Failed to fetch salaries')
    return await response.json()
  } catch (error) {
    console.error('Error fetching salaries for dashboard:', error)
    return []
  }
}

async function getBonuses() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/bonuses`)
    if (!response.ok) throw new Error('Failed to fetch bonuses')
    return await response.json()
  } catch (error) {
    console.error('Error fetching bonuses for dashboard:', error)
    return []
  }
}

async function getCommissions() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/commissions`)
    if (!response.ok) throw new Error('Failed to fetch commissions')
    return await response.json()
  } catch (error) {
    console.error('Error fetching commissions for dashboard:', error)
    return []
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDateTime = searchParams.get('startDateTime')
    const endDateTime = searchParams.get('endDateTime')

    const [transactions, teams, categories, customerCounts, salaries, bonuses, commissions] = await Promise.all([
      getTransactions(startDateTime, endDateTime),
      getTeams(),
      getCategories(),
      getCustomerCounts(startDateTime, endDateTime),
      getSalaries(),
      getBonuses(),
      getCommissions()
    ])

    // Calculate totals
    const incomeTransactions = transactions.filter((t: any) => t.type === 'income')
    const expenseTransactions = transactions.filter((t: any) => t.type === 'expense')
    
    const totalIncome = incomeTransactions.reduce((sum: number, t: any) => sum + t.amount, 0)
    const totalExpense = expenseTransactions.reduce((sum: number, t: any) => sum + t.amount, 0)
    
    // Calculate paid compensation (salaries + bonuses + commissions with status 'paid')
    const paidSalaries = salaries.filter((s: any) => s.status === 'paid').reduce((sum: number, s: any) => sum + (s.amount || 0), 0)
    const paidBonuses = bonuses.filter((b: any) => b.status === 'paid').reduce((sum: number, b: any) => sum + (b.amount || 0), 0)
    const paidCommissions = commissions.filter((c: any) => c.status === 'paid').reduce((sum: number, c: any) => sum + (c.amount || 0), 0)
    const totalPaidCompensation = paidSalaries + paidBonuses + paidCommissions
    
    // Add paid compensation to total expenses
    const totalExpenseWithCompensation = totalExpense + totalPaidCompensation
    const netProfit = totalIncome - totalExpenseWithCompensation

    // Get recent transactions (last 5)
    const recentTransactions = transactions.slice(0, 5)

    // Calculate category breakdown
    const categoryBreakdown = categories.map((category: any) => {
      const categoryTransactions = transactions.filter((t: any) => t.categoryId === category.id)
      const total = categoryTransactions.reduce((sum: number, t: any) => sum + t.amount, 0)
      return {
        id: category.id,
        name: category.name,
        amount: total,
        type: category.type
      }
    }).filter((cat: any) => cat.amount > 0)

    // Calculate customer stats
    const customerStats = {
      new: customerCounts.reduce((sum: number, record: any) => sum + (record.newCustomers || 0), 0),
      deposit: customerCounts.reduce((sum: number, record: any) => sum + (record.depositCustomers || 0), 0),
      extension: 0
    }

    const totalCustomers = customerCounts.reduce((sum: number, record: any) => sum + (record.totalCustomers || 0), 0)

    // Generate monthly income vs expense data
    const monthlyData = generateMonthlyData(transactions)

    // Generate expense breakdown for pie chart
    const expensePieData = generateExpensePieData(expenseTransactions, categories)

    // Generate salary/bonus/commission data
    const salaryData = generateSalaryData(salaries, bonuses, commissions)

    const dashboardData = {
      totalIncome,
      totalExpense: totalExpenseWithCompensation,
      netProfit,
      teamsCount: teams.length,
      membersCount: teams.reduce((sum: number, team: any) => sum + (team.members?.length || 0), 0),
      customersCount: totalCustomers,
      customerStats,
      recentTransactions,
      categoryBreakdown,
      recentCustomerRecords: customerCounts.slice(0, 5),
      monthlyData,
      expensePieData,
      salaryData,
      paidCompensation: {
        salaries: paidSalaries,
        bonuses: paidBonuses,
        commissions: paidCommissions,
        total: totalPaidCompensation
      },
      filtered: startDateTime || endDateTime ? true : false,
      filterRange: {
        startDateTime,
        endDateTime
      }
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}

function generateMonthlyData(transactions: any[]) {
  const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
  
  // Get all unique months from transactions, sorted by date
  const transactionMonths = new Map()
  
  transactions.forEach((t: any) => {
    const transactionDate = new Date(t.date || t.createdAt)
    const year = transactionDate.getFullYear()
    const month = transactionDate.getMonth()
    const key = `${year}-${month}`
    
    if (!transactionMonths.has(key)) {
      transactionMonths.set(key, {
        year,
        month,
        income: 0,
        expense: 0
      })
    }
    
    const monthData = transactionMonths.get(key)
    if (t.type === 'income') {
      monthData.income += t.amount
    } else if (t.type === 'expense') {
      monthData.expense += t.amount
    }
  })
  
  // Convert to array and sort by date
  const sortedMonths = Array.from(transactionMonths.values())
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year
      return a.month - b.month
    })
  
  // Take the last 12 months
  const last12Months = sortedMonths.slice(-12)
  
  // Format for output
  return last12Months.map(data => ({
    month: monthNames[data.month],
    income: data.income,
    expense: data.expense,
    year: data.year
  }))
}

function generateExpensePieData(expenseTransactions: any[], categories: any[]) {
  const categoryMap = new Map()
  
  categories
    .filter((cat: any) => cat.type === 'expense')
    .forEach((category: any) => {
      categoryMap.set(category.id, category.name)
    })

  const expenseByCategory = new Map()
  
  expenseTransactions.forEach((transaction: any) => {
    const categoryName = categoryMap.get(transaction.categoryId) || 'อื่นๆ'
    const current = expenseByCategory.get(categoryName) || 0
    expenseByCategory.set(categoryName, current + transaction.amount)
  })

  return Array.from(expenseByCategory.entries()).map(([name, value]) => ({
    name,
    value: value as number
  }))
}

function generateSalaryData(salaries: any[], bonuses: any[], commissions: any[]) {
  const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
  const currentYear = new Date().getFullYear()
  const monthlyData = []

  for (let i = 0; i < 12; i++) {
    const month = i + 1
    
    const monthSalaries = salaries.filter((s: any) => {
      const salaryDate = new Date(s.payDate || s.createdAt)
      return salaryDate.getMonth() === i && salaryDate.getFullYear() === currentYear
    })

    const monthBonuses = bonuses.filter((b: any) => {
      const bonusDate = new Date(b.date || b.createdAt)
      return bonusDate.getMonth() === i && bonusDate.getFullYear() === currentYear
    })

    const monthCommissions = commissions.filter((c: any) => {
      const commissionDate = new Date(c.date || c.createdAt)
      return commissionDate.getMonth() === i && commissionDate.getFullYear() === currentYear
    })

    const salary = monthSalaries.reduce((sum: number, s: any) => sum + s.amount, 0)
    const bonus = monthBonuses.reduce((sum: number, b: any) => sum + b.amount, 0)
    const commission = monthCommissions.reduce((sum: number, c: any) => sum + c.amount, 0)

    monthlyData.push({
      month: monthNames[i],
      salary,
      bonus,
      commission,
      total: salary + bonus + commission
    })
  }

  return monthlyData
}