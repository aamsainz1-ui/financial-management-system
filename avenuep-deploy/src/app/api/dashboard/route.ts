import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get total income and expenses
    const incomeTransactions = await db.transaction.findMany({
      where: { type: 'income' }
    })

    const expenseTransactions = await db.transaction.findMany({
      where: { type: 'expense' }
    })

    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0)
    const totalExpense = expenseTransactions.reduce((sum, t) => sum + t.amount, 0)
    const netProfit = totalIncome - totalExpense

    // Get team counts
    const teamsCount = await db.team.count()
    const membersCount = await db.member.count()

    // Get recent transactions
    const recentTransactions = await db.transaction.findMany({
      take: 5,
      include: {
        category: true,
        team: true
      },
      orderBy: {
        date: 'desc'
      }
    })

    // Get category breakdown
    const categories = await db.category.findMany({
      include: {
        transactions: true
      }
    })

    const categoryBreakdown = categories.map(category => {
      const total = category.transactions.reduce((sum, t) => sum + t.amount, 0)
      return {
        id: category.id,
        name: category.name,
        amount: total,
        type: category.type
      }
    }).filter(cat => cat.amount > 0)

    return NextResponse.json({
      totalIncome,
      totalExpense,
      netProfit,
      teamsCount,
      membersCount,
      recentTransactions,
      categoryBreakdown
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}