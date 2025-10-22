import { Server } from 'socket.io';

// Real-time event types
export interface RealtimeEvent {
  type: 'transaction' | 'team' | 'member' | 'customer' | 'category' | 'dashboard' | 'payroll' | 'bonus' | 'commission';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: string;
}

export interface NotificationEvent {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  autoHide?: boolean;
}

export const setupSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Handle messages
    socket.on('message', (msg: { text: string; senderId: string }) => {
      socket.emit('message', {
        text: `Echo: ${msg.text}`,
        senderId: 'system',
        timestamp: new Date().toISOString(),
      });
    });

    // Handle real-time dashboard subscriptions
    socket.on('subscribe-dashboard', () => {
      console.log('Client subscribed to dashboard updates:', socket.id);
      socket.join('dashboard');
      socket.emit('subscribed', { type: 'dashboard', timestamp: new Date().toISOString() });
    });

    socket.on('subscribe-transactions', () => {
      console.log('Client subscribed to transaction updates:', socket.id);
      socket.join('transactions');
      socket.emit('subscribed', { type: 'transactions', timestamp: new Date().toISOString() });
    });

    socket.on('subscribe-teams', () => {
      console.log('Client subscribed to team updates:', socket.id);
      socket.join('teams');
      socket.emit('subscribed', { type: 'teams', timestamp: new Date().toISOString() });
    });

    socket.on('subscribe-members', () => {
      console.log('Client subscribed to member updates:', socket.id);
      socket.join('members');
      socket.emit('subscribed', { type: 'members', timestamp: new Date().toISOString() });
    });

    socket.on('subscribe-customers', () => {
      console.log('Client subscribed to customer updates:', socket.id);
      socket.join('customers');
      socket.emit('subscribed', { type: 'customers', timestamp: new Date().toISOString() });
    });

    // Handle unsubscribe events
    socket.on('unsubscribe', (data: { type: string }) => {
      console.log('Client unsubscribed from:', data.type, socket.id);
      socket.leave(data.type);
      socket.emit('unsubscribed', { type: data.type, timestamp: new Date().toISOString() });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    // Send welcome message
    socket.emit('message', {
      text: 'ยินดีต้อนรับสู่ Real-time Dashboard!',
      senderId: 'system',
      timestamp: new Date().toISOString(),
    });
  });
};

// Helper functions for broadcasting real-time updates
export const broadcastDashboardUpdate = (io: Server, data: any) => {
  io.to('dashboard').emit('dashboard-update', {
    type: 'dashboard',
    action: 'update',
    data,
    timestamp: new Date().toISOString()
  });
};

export const broadcastTransactionUpdate = (io: Server, action: 'create' | 'update' | 'delete', data: any) => {
  const event: RealtimeEvent = {
    type: 'transaction',
    action,
    data,
    timestamp: new Date().toISOString()
  };
  
  io.to('transactions').emit('transaction-update', event);
  io.to('dashboard').emit('dashboard-update', event);
};

export const broadcastTeamUpdate = (io: Server, action: 'create' | 'update' | 'delete', data: any) => {
  const event: RealtimeEvent = {
    type: 'team',
    action,
    data,
    timestamp: new Date().toISOString()
  };
  
  io.to('teams').emit('team-update', event);
  io.to('dashboard').emit('dashboard-update', event);
};

export const broadcastMemberUpdate = (io: Server, action: 'create' | 'update' | 'delete', data: any) => {
  const event: RealtimeEvent = {
    type: 'member',
    action,
    data,
    timestamp: new Date().toISOString()
  };
  
  io.to('members').emit('member-update', event);
  io.to('dashboard').emit('dashboard-update', event);
};

export const broadcastCustomerUpdate = (io: Server, action: 'create' | 'update' | 'delete', data: any) => {
  const event: RealtimeEvent = {
    type: 'customer',
    action,
    data,
    timestamp: new Date().toISOString()
  };
  
  io.to('customers').emit('customer-update', event);
  io.to('dashboard').emit('dashboard-update', event);
};

export const broadcastCategoryUpdate = (io: Server, action: 'create' | 'update' | 'delete', data: any) => {
  const event: RealtimeEvent = {
    type: 'category',
    action,
    data,
    timestamp: new Date().toISOString()
  };
  
  io.to('dashboard').emit('dashboard-update', event);
};

export const broadcastPayrollUpdate = (io: Server, action: 'create' | 'update' | 'delete', data: any) => {
  const event: RealtimeEvent = {
    type: 'payroll',
    action,
    data,
    timestamp: new Date().toISOString()
  };
  
  io.to('dashboard').emit('dashboard-update', event);
};

export const broadcastBonusUpdate = (io: Server, action: 'create' | 'update' | 'delete', data: any) => {
  const event: RealtimeEvent = {
    type: 'bonus',
    action,
    data,
    timestamp: new Date().toISOString()
  };
  
  io.to('dashboard').emit('dashboard-update', event);
};

export const broadcastCommissionUpdate = (io: Server, action: 'create' | 'update' | 'delete', data: any) => {
  const event: RealtimeEvent = {
    type: 'commission',
    action,
    data,
    timestamp: new Date().toISOString()
  };
  
  io.to('dashboard').emit('dashboard-update', event);
};

// Notification system
export const broadcastNotification = (io: Server, notification: Omit<NotificationEvent, 'id' | 'timestamp'>) => {
  const fullNotification: NotificationEvent = {
    id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    ...notification
  };
  
  io.emit('notification', fullNotification);
  return fullNotification;
};

// Broadcast multiple updates at once (for bulk operations)
export const broadcastBulkUpdate = (io: Server, updates: RealtimeEvent[]) => {
  io.to('dashboard').emit('bulk-update', {
    updates,
    timestamp: new Date().toISOString()
  });
};