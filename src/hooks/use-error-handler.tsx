'use client'

import { useEffect, useRef } from 'react'

export function useErrorHandler() {
  const errorHandlersRef = useRef<Set<(error: ErrorEvent) => void>>(new Set())

  useEffect(() => {
    // Handle console errors and unhandled promise rejections
    const handleError = (event: ErrorEvent) => {
      // Filter out common React 19 development errors
      if (event.message && 
          (event.message.includes('createConsoleError') ||
           event.message.includes('handleConsoleError') ||
           event.message.includes('TitleWarning') ||
           event.message.includes('DialogContent') ||
           event.message.includes('Portal'))) {
        // Silently handle known React 19 development warnings
        console.warn('React 19 Development Warning (Silenced):', event.message)
        return
      }

      // Log other errors normally
      console.error('Application Error:', event.error || event.message)
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled Promise Rejection:', event.reason)
    }

    // Add error listeners
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    // Override console.error to filter out specific React 19 warnings
    const originalConsoleError = console.error
    console.error = (...args: any[]) => {
      const message = args[0]
      
      if (typeof message === 'string' && 
          (message.includes('createConsoleError') ||
           message.includes('handleConsoleError') ||
           message.includes('TitleWarning') ||
           message.includes('DialogContent') ||
           message.includes('Portal'))) {
        // Redirect known React 19 warnings to console.warn
        console.warn('React 19 Development Warning:', ...args)
        return
      }
      
      // Call original console.error for other errors
      originalConsoleError.apply(console, args)
    }

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
      console.error = originalConsoleError
    }
  }, [])

  const addErrorHandler = (handler: (error: ErrorEvent) => void) => {
    errorHandlersRef.current.add(handler)
    return () => {
      errorHandlersRef.current.delete(handler)
    }
  }

  return { addErrorHandler }
}