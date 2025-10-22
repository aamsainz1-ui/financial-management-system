// Re-export UserRole from Prisma to maintain consistency
export { UserRole } from '@prisma/client'

export interface AuthUser {
  id: string
  email: string
  username: string
  name: string
  role: UserRole
  isActive: boolean
}

export function verifyToken(token: string): any {
  try {
    // For client-side, we'll use a simple base64 decode approach
    // This is not secure for production but works for our current setup
    try {
      const parts = token.split('.')
      if (parts.length === 3) {
        // JWT format
        let payload
        if (typeof Buffer !== 'undefined') {
          payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
        } else {
          payload = JSON.parse(atob(parts[1]))
        }
        return payload
      } else {
        // Try base64 decode
        let decoded
        if (typeof Buffer !== 'undefined') {
          decoded = JSON.parse(Buffer.from(token, 'base64').toString())
        } else {
          decoded = JSON.parse(atob(token))
        }
        return decoded
      }
    } catch {
      return null
    }
  } catch (error) {
    return null
  }
}

export async function getUserById(): Promise<AuthUser | null> {
  try {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      return null
    }

    const response = await fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      return data.user
    } else if (response.status === 401) {
      // Token is invalid, remove it
      localStorage.removeItem('auth_token')
      return null
    }
    return null
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}

export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy = {
    [UserRole.VIEWER]: 1,
    [UserRole.EDITOR]: 2,
    [UserRole.ADMIN]: 3,
    [UserRole.OWNER]: 4,
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}

export function canAccess(userRole: UserRole, action: 'view' | 'edit' | 'delete'): boolean {
  switch (action) {
    case 'view':
      return true // All roles can view
    case 'edit':
      return userRole === UserRole.EDITOR || userRole === UserRole.ADMIN || userRole === UserRole.OWNER
    case 'delete':
      return userRole === UserRole.ADMIN || userRole === UserRole.OWNER
    default:
      return false
  }
}