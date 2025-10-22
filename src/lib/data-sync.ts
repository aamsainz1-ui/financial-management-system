// Global data synchronization system
class DataSyncManager {
  private listeners: Map<string, Set<() => void>> = new Map()
  private lastSyncTimes: Map<string, number> = new Map()
  private syncInterval: number = 5000 // 5 seconds
  private intervalId: NodeJS.Timeout | null = null

  constructor() {
    this.startAutoSync()
  }

  // Subscribe to data changes for a specific data type
  subscribe(dataType: string, callback: () => void) {
    if (!this.listeners.has(dataType)) {
      this.listeners.set(dataType, new Set())
    }
    this.listeners.get(dataType)!.add(callback)

    // Return unsubscribe function
    return () => {
      this.listeners.get(dataType)?.delete(callback)
    }
  }

  // Notify all listeners for a specific data type
  notify(dataType: string) {
    const callbacks = this.listeners.get(dataType)
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback()
        } catch (error) {
          console.error(`Error in data sync callback for ${dataType}:`, error)
        }
      })
    }
    this.lastSyncTimes.set(dataType, Date.now())
  }

  // Force refresh all data types
  refreshAll() {
    this.listeners.forEach((_, dataType) => {
      this.notify(dataType)
    })
  }

  // Start automatic synchronization
  private startAutoSync() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }

    this.intervalId = setInterval(() => {
      this.checkForUpdates()
    }, this.syncInterval)
  }

  // Check for updates and notify if needed
  private async checkForUpdates() {
    try {
      // Check if localStorage is available (client-side only)
      if (typeof window === 'undefined' || !window.localStorage) {
        return
      }
      
      // Simple check - compare localStorage timestamps
      const currentTimestamp = Date.now()
      const lastStoredTimestamp = localStorage.getItem('dataSyncTimestamp')
      
      if (lastStoredTimestamp && parseInt(lastStoredTimestamp) > this.getLastGlobalSync()) {
        this.refreshAll()
        this.setLastGlobalSync(currentTimestamp)
      }
    } catch (error) {
      console.error('Error checking for updates:', error)
    }
  }

  private getLastGlobalSync(): number {
    if (typeof window === 'undefined' || !window.localStorage) {
      return 0
    }
    const stored = localStorage.getItem('lastGlobalSync')
    return stored ? parseInt(stored) : 0
  }

  private setLastGlobalSync(timestamp: number) {
    if (typeof window === 'undefined' || !window.localStorage) {
      return
    }
    localStorage.setItem('lastGlobalSync', timestamp.toString())
  }

  // Mark data as changed (call this after any CRUD operation)
  markChanged(dataType: string) {
    this.notify(dataType)
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('dataSyncTimestamp', Date.now().toString())
    }
    this.setLastGlobalSync(Date.now())
    
    // Sync to server
    this.syncToServer()
  }

  // Sync current data to server
  private async syncToServer() {
    try {
      const businessData = localStorage.getItem('businessData')
      if (businessData) {
        const data = JSON.parse(businessData)
        
        await fetch('/api/sync-from-client', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        })
        
        console.log('Synced data to server')
      }
    } catch (error) {
      console.error('Error syncing to server:', error)
    }
  }

  // Cleanup
  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.listeners.clear()
  }
}

// Global instance
export const dataSyncManager = new DataSyncManager()

// Hook for React components
export function useDataSync(dataType: string, callback: () => void) {
  useEffect(() => {
    const unsubscribe = dataSyncManager.subscribe(dataType, callback)
    return unsubscribe
  }, [dataType, callback])
}