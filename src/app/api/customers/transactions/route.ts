import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { memoryStorage } from '@/lib/memory-storage';

export async function GET() {
  try {
    let transactions

    // Try database first
    try {
      transactions = await db.customerTransaction.findMany({
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
    } catch (dbError) {
      // Fallback to memory storage
      console.log('Database failed, using memory storage for customer transactions')
      transactions = memoryStorage.allCustomerTransactions || []
    }

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
    const { customerId, amount, type, description, date } = data;

    if (!customerId || !amount || !type) {
      return NextResponse.json({ 
        error: 'Customer ID, amount, and type are required' 
      }, { status: 400 });
    }

    // Try database first
    try {
      // Verify customer exists
      const customer = await db.customer.findUnique({
        where: { id: customerId },
        include: {
          team: true,
          member: true
        }
      });

      if (!customer) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      }

      const transaction = await db.customerTransaction.create({
        data: {
          customerId,
          amount: parseInt(amount),
          type, // "deposit", "withdrawal", "extension", "payment"
          description: description || null,
          date: date ? new Date(date) : new Date()
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

      return NextResponse.json(transaction, { status: 201 });
    } catch (dbError) {
      // Fallback to memory storage
      console.log('Database failed, using memory storage for customer transaction creation')
      
      // Find customer from memory storage
      const customer = memoryStorage.customers.find(c => c.id === customerId)
      if (!customer) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
      }

      const newTransaction = {
        id: `customer_transaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        customerId,
        amount: parseInt(amount),
        type,
        description: description || null,
        date: date ? new Date(date) : new Date(),
        customer: {
          ...customer,
          team: customer.team || null,
          member: customer.member || null
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Initialize customer transactions array if it doesn't exist
      if (!memoryStorage.allCustomerTransactions) {
        memoryStorage.setCustomerTransactions([]);
      }
      
      const currentTransactions = memoryStorage.allCustomerTransactions || [];
      currentTransactions.unshift(newTransaction);
      memoryStorage.setCustomerTransactions(currentTransactions);
      return NextResponse.json(newTransaction, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating customer transaction:', error);
    return NextResponse.json(
      { error: 'Failed to create customer transaction' },
      { status: 500 }
    );
  }
}