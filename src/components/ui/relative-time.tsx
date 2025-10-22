'use client'

import { useState, useEffect } from 'react'
import { formatTimestamp, getTimeAgo } from '@/lib/time-utils'

interface RelativeTimeProps {
  timestamp: string | Date
  className?: string
  showFullDate?: boolean
  updateInterval?: number
}

export function RelativeTime({ 
  timestamp, 
  className = '', 
  showFullDate = false,
  updateInterval = 60000 // Update every minute by default
}: RelativeTimeProps) {
  const [relativeTime, setRelativeTime] = useState<string>('')
  const [fullDate, setFullDate] = useState<string>('')

  useEffect(() => {
    const updateTime = () => {
      const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
      setRelativeTime(getTimeAgo(date))
      setFullDate(formatTimestamp(date, { includeTime: true }))
    }

    updateTime()
    
    if (updateInterval > 0) {
      const interval = setInterval(updateTime, updateInterval)
      return () => clearInterval(interval)
    }
  }, [timestamp, updateInterval])

  if (showFullDate) {
    return (
      <div className={className}>
        <div className="font-medium">{relativeTime}</div>
        <div className="text-xs text-gray-500">{fullDate}</div>
      </div>
    )
  }

  return (
    <span className={className} title={fullDate}>
      {relativeTime}
    </span>
  )
}

interface LastUpdatedProps {
  timestamp: string | Date
  label?: string
  className?: string
  showIcon?: boolean
}

export function LastUpdated({ 
  timestamp, 
  label = 'อัพเดทล่าสุด', 
  className = '',
  showIcon = true
}: LastUpdatedProps) {
  return (
    <div className={`flex items-center gap-2 text-sm text-gray-500 ${className}`}>
      {showIcon && (
        <svg 
          className="w-4 h-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
      )}
      <span>{label}:</span>
      <RelativeTime timestamp={timestamp} />
    </div>
  )
}

interface CreatedAtProps {
  timestamp: string | Date
  label?: string
  className?: string
  showIcon?: boolean
}

export function CreatedAt({ 
  timestamp, 
  label = 'สร้างเมื่อ', 
  className = '',
  showIcon = true
}: CreatedAtProps) {
  return (
    <div className={`flex items-center gap-2 text-sm text-gray-500 ${className}`}>
      {showIcon && (
        <svg 
          className="w-4 h-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 4v16m8-8H4" 
          />
        </svg>
      )}
      <span>{label}:</span>
      <RelativeTime timestamp={timestamp} />
    </div>
  )
}

interface TimeInfoProps {
  createdAt: string | Date
  updatedAt?: string | Date
  className?: string
  showBoth?: boolean
}

export function TimeInfo({ 
  createdAt, 
  updatedAt, 
  className = '',
  showBoth = true
}: TimeInfoProps) {
  if (!showBoth || !updatedAt) {
    return <CreatedAt timestamp={createdAt} className={className} />
  }

  const isRecentlyUpdated = 
    new Date(updatedAt).getTime() - new Date(createdAt).getTime() > 60000 // Updated more than 1 minute after creation

  return (
    <div className={`space-y-1 ${className}`}>
      <CreatedAt timestamp={createdAt} showIcon={false} />
      {isRecentlyUpdated && (
        <LastUpdated timestamp={updatedAt} showIcon={false} />
      )}
    </div>
  )
}