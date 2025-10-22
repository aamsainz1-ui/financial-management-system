import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Get customer counts by type
    const customerCounts = await db.customer.groupBy({
      by: ['type'],
      _count: {
        id: true
      }
    });

    // Get transaction totals by type
    const transactionTotals = await db.customerTransaction.groupBy({
      by: ['type'],
      _sum: {
        amount: true
      }
    });

    // Get team-wise customer statistics
    const teamStats = await db.customer.groupBy({
      by: ['teamId'],
      _count: {
        id: true
      },
      _sum: {
        initialAmount: true
      }
    });

    // Get recent transactions
    const recentTransactions = await db.customerTransaction.findMany({
      take: 10,
      include: {
        customer: {
          include: {
            team: true,
            member: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });

    const summary = {
      customerCounts: customerCounts.reduce((acc, item) => {
        acc[item.type] = item._count.id;
        return acc;
      }, {} as Record<string, number>),
      transactionTotals: transactionTotals.reduce((acc, item) => {
        acc[item.type] = item._sum.amount || 0;
        return acc;
      }, {} as Record<string, number>),
      teamStats: teamStats.filter(stat => stat.teamId !== null),
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