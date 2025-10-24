import { NextResponse } from 'next/server'
import { memoryStorage } from '@/lib/memory-storage'

export async function GET() {
  try {
    // Use memoryStorage instead of database
    const customers = memoryStorage.allCustomers || [];
    const teams = memoryStorage.allTeams || [];
    const customerTransactions = memoryStorage.customerTransactionsList || [];
    const allTransactions = memoryStorage.allTransactions || [];

    // Calculate total expenses
    const totalExpenses = allTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate new customers (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const newCustomers = customers.filter(customer =>
      new Date(customer.createdAt) >= thirtyDaysAgo
    ).length;

    // Group customer transactions by customer ID
    const transactionsByCustomer = customerTransactions.reduce((acc, t) => {
      if (!acc[t.customerId]) acc[t.customerId] = [];
      acc[t.customerId].push(t);
      return acc;
    }, {} as Record<string, any[]>);

    // Calculate deposit customers (customers with deposit transactions > 0)
    const depositCustomers = customers.filter(customer => {
      const customerTxs = transactionsByCustomer[customer.id] || [];
      const deposits = customerTxs.filter(t => t.type === 'deposit' && t.amount > 0);
      return deposits.length > 0;
    }).length;

    // Calculate expense per team
    const expensePerTeam = teams.length > 0 ? totalExpenses / teams.length : 0;

    // Calculate average expense per new customer
    const averagePerNewCustomer = newCustomers > 0 ? totalExpenses / newCustomers : 0;

    // Calculate expense per deposit customer
    const expensePerDepositCustomer = depositCustomers > 0 ? totalExpenses / depositCustomers : 0;

    // Calculate total deposits and withdraws
    const totalDeposits = customerTransactions
      .filter(t => t.type === 'deposit')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalWithdraws = customerTransactions
      .filter(t => t.type === 'withdraw')
      .reduce((sum, t) => sum + t.amount, 0);

    // Calculate expense per customer
    const totalCustomers = customers.length;
    const expensePerCustomer = totalCustomers > 0 ? totalExpenses / totalCustomers : 0;

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