import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { memoryStorage } from '@/lib/memory-storage';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Try database first
    try {
      const whereClause = userId ? { userId } : {};
      
      const logs = await db.auditLog.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      });

      const total = await db.auditLog.count({
        where: whereClause
      });

      return NextResponse.json({
        logs,
        total,
        hasMore: offset + limit < total
      });
    } catch (dbError) {
      // Fallback to memory storage
      console.log('Database failed, using memory storage for activity logs');
      
      let logs = memoryStorage.allAuditLogs || [];
      
      if (userId) {
        logs = logs.filter(log => log.userId === userId);
      }
      
      // Sort by creation date (newest first)
      logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      // Apply pagination
      const paginatedLogs = logs.slice(offset, offset + limit);
      
      // Add user information
      const logsWithUsers = paginatedLogs.map(log => {
        const user = memoryStorage.allUsers?.find(u => u.id === log.userId);
        return {
          ...log,
          user: user ? {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          } : null
        };
      });

      return NextResponse.json({
        logs: logsWithUsers,
        total: logs.length,
        hasMore: offset + limit < logs.length
      });
    }
  } catch (error) {
    console.error('Error fetching activity logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity logs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { userId, action, resource, resourceId, oldValue, newValue, ipAddress, userAgent } = data;

    if (!userId || !action || !resource) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, action, resource' },
        { status: 400 }
      );
    }

    // Try database first
    try {
      const log = await db.auditLog.create({
        data: {
          userId,
          action,
          resource,
          resourceId,
          oldValue: oldValue ? JSON.stringify(oldValue) : null,
          newValue: newValue ? JSON.stringify(newValue) : null,
          ipAddress,
          userAgent
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true
            }
          }
        }
      });

      return NextResponse.json(log);
    } catch (dbError) {
      // Fallback to memory storage
      console.log('Database failed, using memory storage for audit log creation');
      
      const log = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        action,
        resource,
        resourceId,
        oldValue: oldValue ? JSON.stringify(oldValue) : null,
        newValue: newValue ? JSON.stringify(newValue) : null,
        ipAddress,
        userAgent,
        createdAt: new Date().toISOString()
      };

      // Initialize audit logs array if it doesn't exist
      if (!memoryStorage.allAuditLogs) {
        memoryStorage.setAuditLogs([]);
      }
      
      const currentLogs = memoryStorage.allAuditLogs || [];
      currentLogs.unshift(log);
      memoryStorage.setAuditLogs(currentLogs);
      
      // Add user information
      const user = memoryStorage.allUsers?.find(u => u.id === userId);
      const logWithUser = {
        ...log,
        user: user ? {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        } : null
      };

      return NextResponse.json(logWithUser);
    }
  } catch (error) {
    console.error('Error creating audit log:', error);
    return NextResponse.json(
      { error: 'Failed to create audit log' },
      { status: 500 }
    );
  }
}