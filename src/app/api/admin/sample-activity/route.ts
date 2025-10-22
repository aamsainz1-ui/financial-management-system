import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get current user from token (simplified for demo)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Sample activities for testing
    const sampleActivities = [
      {
        userId: 'sample_user_1',
        action: 'LOGIN',
        resource: 'USER',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        userId: 'sample_user_1',
        action: 'CREATE',
        resource: 'TRANSACTION',
        resourceId: 'txn_sample_1',
        newValue: JSON.stringify({ title: 'รายรับจากลูกค้า', amount: 50000, type: 'income' }),
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        userId: 'sample_user_1',
        action: 'UPDATE',
        resource: 'USER',
        resourceId: 'user_sample_1',
        oldValue: JSON.stringify({ role: 'VIEWER' }),
        newValue: JSON.stringify({ role: 'EDITOR' }),
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        userId: 'sample_user_1',
        action: 'RESET_PIN',
        resource: 'USER',
        resourceId: 'user_sample_2',
        newValue: JSON.stringify({ newPin: '123456' }),
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        userId: 'sample_user_1',
        action: 'DELETE',
        resource: 'CUSTOMER',
        resourceId: 'customer_sample_1',
        oldValue: JSON.stringify({ name: 'ลูกค้าตัวอย่าง', email: 'test@example.com' }),
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    ];

    // Create each activity log
    const createdLogs = [];
    for (const activity of sampleActivities) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/activity-logs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader
          },
          body: JSON.stringify(activity)
        });
        
        if (response.ok) {
          const log = await response.json();
          createdLogs.push(log);
        }
      } catch (error) {
        console.error('Failed to create sample activity:', error);
      }
    }

    return NextResponse.json({
      message: 'Sample activities created successfully',
      count: createdLogs.length,
      logs: createdLogs
    });
  } catch (error) {
    console.error('Error creating sample activities:', error);
    return NextResponse.json(
      { error: 'Failed to create sample activities' },
      { status: 500 }
    );
  }
}