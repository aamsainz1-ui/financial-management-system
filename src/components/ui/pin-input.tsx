'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PinInputProps {
  value: string
  onChange: (value: string) => void
  length?: number
  label?: string
  disabled?: boolean
  autoFocus?: boolean
}

export function PinInput({ 
  value, 
  onChange, 
  length = 6, 
  label,
  disabled = false,
  autoFocus = false
}: PinInputProps) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [autoFocus])

  const handleInputChange = (index: number, val: string) => {
    // Only allow numbers
    const numValue = val.replace(/[^0-9]/g, '')
    
    if (numValue.length <= 1) {
      const newValue = value.split('')
      newValue[index] = numValue
      const pinValue = newValue.join('').slice(0, length)
      onChange(pinValue)

      // Auto-focus next input
      if (numValue && index < length - 1) {
        inputRefs.current[index + 1]?.focus()
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, length)
    onChange(pastedData)
    
    // Focus the next empty input or the last one
    const nextEmptyIndex = pastedData.length < length ? pastedData.length : length - 1
    inputRefs.current[nextEmptyIndex]?.focus()
  }

  const handleFocus = (index: number) => {
    setFocusedIndex(index)
  }

  const handleBlur = () => {
    setFocusedIndex(null)
  }

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="flex gap-2 justify-center">
        {Array.from({ length }, (_, index) => (
          <Input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={value[index] || ''}
            onChange={(e) => handleInputChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => handleFocus(index)}
            onBlur={handleBlur}
            disabled={disabled}
            className={`w-12 h-12 text-center text-lg font-semibold transition-all
              ${focusedIndex === index ? 'ring-2 ring-primary border-primary' : ''}
              ${value[index] ? 'bg-primary/5 border-primary/30' : ''}
            `}
          />
        ))}
      </div>
    </div>
  )
}