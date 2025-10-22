'use client'

import { useEffect, useState } from 'react'
import { clientStorage } from '@/lib/client-storage'

interface DataSyncOptions {
  autoSync?: boolean
  syncInterval?: number
}

export function useDataSync(options: DataSyncOptions = {}) {
  const { autoSync = true, syncInterval = 30000 } = options
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  // Initialize client storage with sample data if empty
  useEffect(() => {
    clientStorage.initializeWithSampleData()
  }, [])

  // Sync data from client storage to server memory storage
  const syncToServer = async () => {
    if (isSyncing) return
    
    setIsSyncing(true)
    try {
      const data = clientStorage.loadFromStorage()
      if (data) {
        const response = await fetch('/api/sync-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })
        
        if (response.ok) {
          setLastSync(new Date())
          console.log('Data synced to server successfully')
        } else {
          console.error('Failed to sync data to server')
        }
      }
    } catch (error) {
      console.error('Error syncing data to server:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  // Get data from server and update client storage
  const syncFromServer = async () => {
    try {
      const response = await fetch('/api/sync-data')
      if (response.ok) {
        const data = await response.json()
        clientStorage.saveToStorage(data)
        setLastSync(new Date())
        console.log('Data synced from server successfully')
        return data
      }
    } catch (error) {
      console.error('Error syncing data from server:', error)
    }
    return null
  }

  // Auto sync to server when data changes
  const updateData = (type: string, value: any) => {
    clientStorage.setData(type, value)
    
    if (autoSync) {
      // Debounce sync to avoid too frequent requests
      setTimeout(() => {
        syncToServer()
      }, 1000)
    }
  }

  // Get data from client storage
  const getData = (type: string) => {
    return clientStorage.getData(type)
  }

  // Auto sync on interval
  useEffect(() => {
    if (!autoSync) return

    const interval = setInterval(() => {
      syncToServer()
    }, syncInterval)

    return () => clearInterval(interval)
  }, [autoSync, syncInterval])

  // Initial sync from server on mount
  useEffect(() => {
    syncFromServer()
  }, [])

  return {
    isSyncing,
    lastSync,
    syncToServer,
    syncFromServer,
    updateData,
    getData,
  }
}