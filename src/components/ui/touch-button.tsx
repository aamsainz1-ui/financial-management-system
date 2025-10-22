'use client'

import React, { forwardRef } from 'react'
import { Button, ButtonProps } from '@/components/ui/button'
import { useLongPress } from '@/hooks/use-touch-gestures'
import { cn } from '@/lib/utils'

interface TouchButtonProps extends ButtonProps {
  onLongPress?: () => void
  longPressDelay?: number
  hapticFeedback?: boolean
}

export const TouchButton = forwardRef<HTMLButtonElement, TouchButtonProps>(
  ({ onLongPress, longPressDelay = 500, hapticFeedback = true, children, className, ...props }, ref) => {
    const { isLongPressing, ...longPressProps } = useLongPress(
      () => {
        if (onLongPress) {
          onLongPress()
          if (hapticFeedback && 'vibrate' in navigator) {
            navigator.vibrate(50)
          }
        }
      },
      { delay: longPressDelay }
    )

    return (
      <Button
        ref={ref}
        className={cn(
          'min-h-12 min-w-12 touch-manipulation',
          'active:scale-95 transition-transform duration-150',
          isLongPressing && 'scale-95',
          className
        )}
        {...longPressProps}
        {...props}
      >
        {children}
      </Button>
    )
  }
)

TouchButton.displayName = 'TouchButton'