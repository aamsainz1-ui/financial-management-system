'use client'

import * as React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ErrorBoundary } from '@/components/ui/error-boundary'

interface SafeDialogProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function SafeDialog({ children, open, onOpenChange }: SafeDialogProps) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <p className="text-sm text-red-600">Dialog component encountered an error</p>
        </div>
      }
    >
      <Dialog open={open} onOpenChange={onOpenChange}>
        {children}
      </Dialog>
    </ErrorBoundary>
  )
}

interface SafeDialogContentProps {
  children: React.ReactNode
  className?: string
  showCloseButton?: boolean
}

export function SafeDialogContent({ children, className, showCloseButton = true }: SafeDialogContentProps) {
  return (
    <ErrorBoundary>
      <DialogContent className={className} showCloseButton={showCloseButton}>
        {children}
      </DialogContent>
    </ErrorBoundary>
  )
}

interface SafeDialogHeaderProps {
  children: React.ReactNode
  className?: string
}

export function SafeDialogHeader({ children, className }: SafeDialogHeaderProps) {
  return (
    <ErrorBoundary>
      <DialogHeader className={className}>
        {children}
      </DialogHeader>
    </ErrorBoundary>
  )
}

interface SafeDialogTitleProps {
  children: React.ReactNode
  className?: string
}

export function SafeDialogTitle({ children, className }: SafeDialogTitleProps) {
  return (
    <ErrorBoundary>
      <DialogTitle className={className}>
        {children}
      </DialogTitle>
    </ErrorBoundary>
  )
}

interface SafeDialogTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

export function SafeDialogTrigger({ children, asChild }: SafeDialogTriggerProps) {
  return (
    <ErrorBoundary>
      <DialogTrigger asChild={asChild}>
        {children}
      </DialogTrigger>
    </ErrorBoundary>
  )
}