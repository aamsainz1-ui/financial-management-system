'use client'

import { useRef, useEffect, useState } from 'react'

interface TouchPoint {
  x: number
  y: number
  time: number
}

interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down'
  distance: number
  velocity: number
}

export function useTouchGestures(
  onSwipe?: (gesture: SwipeGesture) => void,
  onTap?: () => void,
  options?: {
    threshold?: number
    velocityThreshold?: number
    preventDefault?: boolean
  }
) {
  const touchStartRef = useRef<TouchPoint | null>(null)
  const touchEndRef = useRef<TouchPoint | null>(null)
  const [isTouching, setIsTouching] = useState(false)
  
  const threshold = options?.threshold || 50
  const velocityThreshold = options?.velocityThreshold || 0.3
  const preventDefault = options?.preventDefault || false

  const handleTouchStart = (e: TouchEvent) => {
    if (preventDefault) {
      e.preventDefault()
    }
    
    const touch = e.touches[0]
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    }
    setIsTouching(true)
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (preventDefault) {
      e.preventDefault()
    }
  }

  const handleTouchEnd = (e: TouchEvent) => {
    if (!touchStartRef.current) return
    
    const touch = e.changedTouches[0]
    touchEndRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    }
    
    const deltaX = touchEndRef.current.x - touchStartRef.current.x
    const deltaY = touchEndRef.current.y - touchStartRef.current.y
    const deltaTime = touchEndRef.current.time - touchStartRef.current.time
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const velocity = distance / deltaTime
    
    // Check for tap
    if (distance < 10 && deltaTime < 200) {
      onTap?.()
      setIsTouching(false)
      return
    }
    
    // Check for swipe
    if (distance > threshold && velocity > velocityThreshold) {
      let direction: SwipeGesture['direction']
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left'
      } else {
        direction = deltaY > 0 ? 'down' : 'up'
      }
      
      onSwipe?.({
        direction,
        distance,
        velocity
      })
    }
    
    setIsTouching(false)
  }

  useEffect(() => {
    const element = document.documentElement
    
    element.addEventListener('touchstart', handleTouchStart, { passive: !preventDefault })
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventDefault })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })
    
    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [onSwipe, onTap, threshold, velocityThreshold, preventDefault])

  return {
    isTouching,
    touchStart: touchStartRef.current,
    touchEnd: touchEndRef.current
  }
}

export function useLongPress(
  onLongPress: () => void,
  options?: {
    delay?: number
    preventDefault?: boolean
  }
) {
  const [isLongPressing, setIsLongPressing] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const delay = options?.delay || 500
  const preventDefault = options?.preventDefault || false

  const start = (e: React.TouchEvent | React.MouseEvent) => {
    if (preventDefault) {
      e.preventDefault()
    }
    
    setIsLongPressing(false)
    
    timeoutRef.current = setTimeout(() => {
      setIsLongPressing(true)
      onLongPress()
    }, delay)
  }

  const clear = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setIsLongPressing(false)
  }

  return {
    isLongPressing,
    onTouchStart: start,
    onTouchEnd: clear,
    onMouseDown: start,
    onMouseUp: clear,
    onMouseLeave: clear
  }
}