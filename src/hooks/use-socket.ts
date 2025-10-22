'use client'

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { RealtimeEvent, NotificationEvent } from '@/lib/socket'

interface UseSocketOptions {
  autoConnect?: boolean
  subscriptions?: string[]
}

interface UseSocketReturn {
  socket: Socket | null
  isConnected: boolean
  isSubscribed: boolean
  notifications: NotificationEvent[]
  lastEvent: RealtimeEvent | null
  connect: () => void
  disconnect: () => void
  subscribe: (type: string) => void
  unsubscribe: (type: string) => void
  clearNotifications: () => void
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
}

export function useSocket(options: UseSocketOptions = {}): UseSocketReturn {
  const { autoConnect = true, subscriptions = [] } = options
  
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [notifications, setNotifications] = useState<NotificationEvent[]>([])
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  
  const socketRef = useRef<Socket | null>(null)

  const connect = () => {
    if (socketRef.current?.connected) return
    
    setConnectionStatus('connecting')
    
    try {
      const newSocket = io('/', {
        transports: ['websocket', 'polling'],
        upgrade: true,
        rememberUpgrade: true,
        timeout: 5000,
        forceNew: true
      })

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id)
        setIsConnected(true)
        setConnectionStatus('connected')
        setSocket(newSocket)
        socketRef.current = newSocket

        // Auto-subscribe to provided subscriptions
        if (subscriptions.length > 0) {
          subscriptions.forEach(sub => {
            newSocket.emit(`subscribe-${sub}`)
          })
          setIsSubscribed(true)
        }
      })

      newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason)
        setIsConnected(false)
        setConnectionStatus('disconnected')
        setIsSubscribed(false)
      })

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error)
        setConnectionStatus('error')
        setIsConnected(false)
      })

      // Handle subscription confirmations
      newSocket.on('subscribed', (data) => {
        console.log('Subscribed to:', data.type)
        setIsSubscribed(true)
      })

      newSocket.on('unsubscribed', (data) => {
        console.log('Unsubscribed from:', data.type)
      })

      // Handle real-time events
      newSocket.on('dashboard-update', (event: RealtimeEvent) => {
        console.log('Dashboard update received:', event)
        setLastEvent(event)
      })

      newSocket.on('transaction-update', (event: RealtimeEvent) => {
        console.log('Transaction update received:', event)
        setLastEvent(event)
      })

      newSocket.on('team-update', (event: RealtimeEvent) => {
        console.log('Team update received:', event)
        setLastEvent(event)
      })

      newSocket.on('member-update', (event: RealtimeEvent) => {
        console.log('Member update received:', event)
        setLastEvent(event)
      })

      newSocket.on('customer-update', (event: RealtimeEvent) => {
        console.log('Customer update received:', event)
        setLastEvent(event)
      })

      // Handle notifications
      newSocket.on('notification', (notification: NotificationEvent) => {
        console.log('Notification received:', notification)
        setNotifications(prev => {
          const updated = [notification, ...prev]
          // Keep only last 50 notifications
          return updated.slice(0, 50)
        })

        // Auto-hide notification after 5 seconds if specified
        if (notification.autoHide !== false) {
          setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== notification.id))
          }, 5000)
        }
      })

      // Handle bulk updates
      newSocket.on('bulk-update', (data: { updates: RealtimeEvent[] }) => {
        console.log('Bulk update received:', data)
        data.updates.forEach(event => {
          setLastEvent(event)
        })
      })

      // Handle messages
      newSocket.on('message', (message) => {
        console.log('Message received:', message)
      })

      socketRef.current = newSocket

    } catch (error) {
      console.error('Failed to create socket connection:', error)
      setConnectionStatus('error')
    }
  }

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
      setSocket(null)
      setIsConnected(false)
      setIsSubscribed(false)
      setConnectionStatus('disconnected')
    }
  }

  const subscribe = (type: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(`subscribe-${type}`)
    }
  }

  const unsubscribe = (type: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('unsubscribe', { type })
    }
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  useEffect(() => {
    if (autoConnect) {
      connect()
    }

    return () => {
      disconnect()
    }
  }, [autoConnect])

  // Cleanup old notifications periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev => {
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000
        return prev.filter(n => new Date(n.timestamp).getTime() > fiveMinutesAgo)
      })
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  return {
    socket: socketRef.current,
    isConnected,
    isSubscribed,
    notifications,
    lastEvent,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    clearNotifications,
    connectionStatus
  }
}