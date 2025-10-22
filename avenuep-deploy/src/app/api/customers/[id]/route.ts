import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
    // First delete all related transactions
    await db.customerTransaction.deleteMany({
      where: { customerId: resolvedParams.id }
    });

    // Then delete the customer
    await db.customer.delete({
      where: { id: resolvedParams.id }
    });

    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}