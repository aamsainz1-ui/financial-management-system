'use client'

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/lib/auth-client'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
  fallback?: React.ReactNode
  requiredAction?: 'view' | 'edit' | 'delete'
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  fallback = <div className="p-4 text-center text-red-600">Access Denied</div>,
  requiredAction = 'view'
}: ProtectedRouteProps) {
  const { user, loading, can, hasRole } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return fallback
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return fallback
  }

  if (!can(requiredAction)) {
    return fallback
  }

  return <>{children}</>
}

interface PermissionProps {
  children: React.ReactNode
  role?: UserRole
  action?: 'view' | 'edit' | 'delete'
  fallback?: React.ReactNode
}

export function Permission({ children, role, action = 'view', fallback = null }: PermissionProps) {
  const { user, hasRole, can } = useAuth()

  if (!user) {
    return <>{fallback}</>
  }

  if (role && !hasRole(role)) {
    return <>{fallback}</>
  }

  if (!can(action)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}