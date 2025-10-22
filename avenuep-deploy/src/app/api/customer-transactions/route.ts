import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const transactions = await db.customerTransaction.findMany({
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
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
    const body = await request.json();
    const { customerId, amount, type, description } = body;

    const transaction = await db.customerTransaction.create({
      data: {
        customerId,
        amount,
        type,
        description,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error('Error creating customer transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create customer transaction' },
      { status: 500 }
    );
  }
}