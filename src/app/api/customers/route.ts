import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { memoryStorage } from '@/lib/memory-storage';

export async function GET() {
  try {
    // Try database first, fallback to memory storage
    try {
      const customers = await db.customer.findMany({
        include: {
          team: true,
          member: true,
          transactions: {
            orderBy: { date: 'desc' }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json(customers);
    } catch (dbError) {
      console.log('Database failed, using memory storage for customers');
      return NextResponse.json(memoryStorage.customers || []);
    }
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Try database first, fallback to memory storage
    try {
      const customer = await db.customer.create({
        data: {
          name: data.name,
          email: data.email || null,
          phone: data.phone || null,
          address: data.address || null,
          type: data.type || 'new',
          initialAmount: data.initialAmount || 0,
          teamId: data.teamId || null,
          memberId: data.memberId || null,
          status: data.status || 'active',
          notes: data.notes || null,
        },
        include: {
          team: true,
          member: true
        }
      });

      return NextResponse.json(customer);
    } catch (dbError) {
      console.log('Database failed, using memory storage for customer creation');
      
      // Initialize customers array if it doesn't exist
      if (!memoryStorage.customers) {
        memoryStorage.customers = [];
      }
      
      // Find team and member from memory storage
      const team = data.teamId ? memoryStorage.allTeams.find(t => t.id === data.teamId) : null;
      const member = data.memberId ? memoryStorage.members.find(m => m.id === data.memberId) : null;
      
      const newCustomer = {
        id: `customer_${Date.now()}`,
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        type: data.type || 'new',
        initialAmount: data.initialAmount || 0,
        extensionAmount: 0,
        totalAmount: data.initialAmount || 0,
        teamId: data.teamId || null,
        memberId: data.memberId || null,
        status: data.status || 'active',
        notes: data.notes || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        team,
        member,
        transactions: []
      };

      memoryStorage.customers.unshift(newCustomer);
      memoryStorage.saveToStorage() // Save to localStorage
      console.log('Customer created in memory storage:', newCustomer);
      
      return NextResponse.json(newCustomer, { status: 201 });
    }
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}