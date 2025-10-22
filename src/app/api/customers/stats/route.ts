import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get all customers
    const customers = await db.customer.findMany({
      include: {
        transactions: true
      }
    })

    // Get all teams
    const teams = await db.team.findMany({
      include: {
        members: true
      }
    })

    // Get all transactions for expense calculation
    const allTransactions = await db.transaction.findMany({
      where: { type: 'expense' }
    })

    // Calculate total expenses
    const totalExpenses = allTransactions.reduce((sum, t) => sum + t.amount, 0)

    // Calculate new customers (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const newCustomers = customers.filter(customer => 
      new Date(customer.createdAt) >= thirtyDaysAgo
    ).length

    // Calculate deposit customers (customers with deposit transactions > 0)
    const depositCustomers = customers.filter(customer => {
      const deposits = customer.transactions.filter(t => t.type === 'deposit' && t.amount > 0)
      return deposits.length > 0
    }).length

    // Calculate expense per team
    const expensePerTeam = teams.length > 0 ? totalExpenses / teams.length : 0

    // Calculate average expense per new customer
    const averagePerNewCustomer = newCustomers > 0 ? totalExpenses / newCustomers : 0

    // Calculate expense per deposit customer
    const expensePerDepositCustomer = depositCustomers > 0 ? totalExpenses / depositCustomers : 0

    // Calculate total deposits and withdraws
    const totalDeposits = customers.reduce((sum, customer) => {
      const customerDeposits = customer.transactions
        .filter(t => t.type === 'deposit')
        .reduce((depositSum, t) => depositSum + t.amount, 0)
      return sum + customerDeposits
    }, 0)

    const totalWithdraws = customers.reduce((sum, customer) => {
      const customerWithdraws = customer.transactions
        .filter(t => t.type === 'withdraw')
        .reduce((withdrawSum, t) => withdrawSum + t.amount, 0)
      return sum + customerWithdraws
    }, 0)

    // Calculate expense per customer
    const totalCustomers = customers.length
    const expensePerCustomer = totalCustomers > 0 ? totalExpenses / totalCustomers : 0

    console.log('Customer Stats API Response:', {
      totalCustomers,
      newCustomers,
      depositCustomers,
      totalDeposits,
      totalWithdraws,
      totalExpenses,
      expensePerCustomer,
      expensePerDepositCustomer,
      averagePerNewCustomer,
      expensePerTeam,
      teamsCount: teams.length
    })

    return NextResponse.json({
      customers,
      teams,
      totalCustomers,
      newCustomers,
      depositCustomers,
      totalDeposits,
      totalWithdraws,
      totalExpenses,
      expensePerCustomer,
      expensePerDepositCustomer,
      averagePerNewCustomer,
      expensePerTeam
    })

  } catch (error) {
    console.error('Error fetching customer stats:', error)
    return NextResponse.json({ error: 'Failed to fetch customer stats' }, { status: 500 })
  }
}