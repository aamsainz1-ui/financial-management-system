import { NextResponse } from 'next/server';
import { memoryStorage } from '@/lib/memory-storage';

export async function GET() {
  try {
    // Use memoryStorage instead of database
    const customers = memoryStorage.allCustomers || [];
    const customerTransactions = memoryStorage.customerTransactionsList || [];

    // Get customer counts by type
    const customerCounts = customers.reduce((acc, customer) => {
      acc[customer.type] = (acc[customer.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get transaction totals by type
    const transactionTotals = customerTransactions.reduce((acc, transaction) => {
      acc[transaction.type] = (acc[transaction.type] || 0) + transaction.amount;
      return acc;
    }, {} as Record<string, number>);

    // Get team-wise customer statistics
    const teamStats = customers.reduce((acc, customer) => {
      if (customer.teamId) {
        if (!acc[customer.teamId]) {
          acc[customer.teamId] = { teamId: customer.teamId, count: 0, totalInitialAmount: 0 };
        }
        acc[customer.teamId].count++;
        acc[customer.teamId].totalInitialAmount += customer.initialAmount || 0;
      }
      return acc;
    }, {} as Record<string, any>);

    // Get recent transactions (last 10)
    const recentTransactions = customerTransactions
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    const summary = {
      customerCounts,
      transactionTotals,
      teamStats: Object.values(teamStats),
      recentTransactions
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching customer summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer summary' },
      { status: 500 }
    );
  }
}