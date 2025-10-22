import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { memoryStorage } from '@/lib/memory-storage';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const customer = await db.customer.findUnique({
      where: { id: resolvedParams.id },
      include: {
        team: true,
        member: true,
        transactions: {
          orderBy: { date: 'desc' }
        }
      }
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const data = await request.json();
    
    // Try database first
    try {
      const customer = await db.customer.update({
        where: { id: resolvedParams.id },
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          type: data.type,
          initialAmount: data.initialAmount,
          teamId: data.teamId,
          memberId: data.memberId,
          status: data.status,
          notes: data.notes,
        },
        include: {
          team: true,
          member: true
        }
      });

      return NextResponse.json(customer);
    } catch (dbError) {
      // Fallback to memory storage
      console.log('Database failed, using memory storage for customer update')
      
      const customerIndex = memoryStorage.customers.findIndex(c => c.id === resolvedParams.id)
      if (customerIndex === -1) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
      }

      // Find team and member if provided
      const team = data.teamId ? memoryStorage.allTeams.find(t => t.id === data.teamId) : memoryStorage.customers[customerIndex].team
      const member = data.memberId ? memoryStorage.members.find(m => m.id === data.memberId) : memoryStorage.customers[customerIndex].member

      const updatedCustomer = {
        ...memoryStorage.customers[customerIndex],
        name: data.name || memoryStorage.customers[customerIndex].name,
        email: data.email !== undefined ? data.email : memoryStorage.customers[customerIndex].email,
        phone: data.phone || memoryStorage.customers[customerIndex].phone,
        address: data.address !== undefined ? data.address : memoryStorage.customers[customerIndex].address,
        type: data.type || memoryStorage.customers[customerIndex].type,
        initialAmount: data.initialAmount !== undefined ? data.initialAmount : memoryStorage.customers[customerIndex].initialAmount,
        teamId: data.teamId !== undefined ? data.teamId : memoryStorage.customers[customerIndex].teamId,
        memberId: data.memberId !== undefined ? data.memberId : memoryStorage.customers[customerIndex].memberId,
        status: data.status !== undefined ? data.status : memoryStorage.customers[customerIndex].status,
        notes: data.notes !== undefined ? data.notes : memoryStorage.customers[customerIndex].notes,
        team,
        member,
        updatedAt: new Date().toISOString()
      }

      memoryStorage.customers[customerIndex] = updatedCustomer
      console.log('Customer updated in memory storage:', updatedCustomer)
      return NextResponse.json(updatedCustomer)
    }
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    
    // Try database first
    try {
      // First delete all related transactions
      await db.customerTransaction.deleteMany({
        where: { customerId: resolvedParams.id }
      });

      // Then delete the customer
      await db.customer.delete({
        where: { id: resolvedParams.id }
      });

      return NextResponse.json({ message: 'Customer deleted successfully' });
    } catch (dbError) {
      // Fallback to memory storage
      console.log('Database failed, using memory storage for customer deletion')
      
      const customerIndex = memoryStorage.customers.findIndex(c => c.id === resolvedParams.id)
      if (customerIndex === -1) {
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
      }

      // Remove customer from memory storage
      const currentCustomers = memoryStorage.allCustomers || [];
      const deletedCustomer = currentCustomers.splice(customerIndex, 1)[0];
      memoryStorage.setCustomers(currentCustomers);
      
      // Also remove related transactions from memory storage
      const currentTransactions = memoryStorage.allCustomerTransactions || [];
      const filteredTransactions = currentTransactions.filter(
        transaction => transaction.customerId !== resolvedParams.id
      );
      memoryStorage.setCustomerTransactions(filteredTransactions);
      
      console.log('Customer deleted from memory storage:', deletedCustomer)
      return NextResponse.json({ message: 'Customer deleted successfully' })
    }
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}