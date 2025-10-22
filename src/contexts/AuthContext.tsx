'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { AuthUser, UserRole, getUserById, verifyToken } from '@/lib/auth-client'

interface AuthContextType {
  user: AuthUser | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
  hasRole: (role: UserRole) => boolean
  can: (action: 'view' | 'edit' | 'delete') => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        setLoading(false)
        return
      }

      // Quick client-side token verification
      const decoded = verifyToken(token)
      if (!decoded) {
        localStorage.removeItem('auth_token')
        setLoading(false)
        return
      }

      // Fetch user data from server
      const userData = await getUserById()
      if (userData) {
        setUser(userData)
      } else {
        localStorage.removeItem('auth_token')
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('auth_token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('auth_token', data.token)
        setUser(data.user)
        return true
      } else {
        return false
      }
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('auth_token')
    setUser(null)
  }

  const hasRole = (role: UserRole): boolean => {
    if (!user) return false
    const roleHierarchy = {
      [UserRole.VIEWER]: 1,
      [UserRole.EDITOR]: 2,
      [UserRole.ADMIN]: 3,
      [UserRole.OWNER]: 4,
    }
    return roleHierarchy[user.role] >= roleHierarchy[role]
  }

  const can = (action: 'view' | 'edit' | 'delete'): boolean => {
    if (!user) return false
    switch (action) {
      case 'view':
        return true
      case 'edit':
        return user.role === UserRole.EDITOR || user.role === UserRole.ADMIN || user.role === UserRole.OWNER
      case 'delete':
        return user.role === UserRole.ADMIN || user.role === UserRole.OWNER
      default:
        return false
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, hasRole, can }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}