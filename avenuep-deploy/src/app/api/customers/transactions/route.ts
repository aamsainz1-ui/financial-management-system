import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const transactions = await db.customerTransaction.findMany({
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

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching customer transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const transaction = await db.customerTransaction.create({
      data: {
        customerId: data.customerId,
        amount: data.amount,
        type: data.type, // "deposit", "withdrawal", "extension"
        description: data.description || null,
      },
      include: {
        customer: {
          include: {
            team: true,
            member: true
          }
        }
      }
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error creating customer transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create customer transaction' },
      { status: 500 }
    );
  }
}