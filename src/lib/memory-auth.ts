import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export enum UserRole {
  VIEWER = 'VIEWER',
  EDITOR = 'EDITOR',
  ADMIN = 'ADMIN',
  OWNER = 'OWNER'
}

export interface MemoryUser {
  id: string
  email: string
  username: string
  name: string
  role: UserRole
  password: string
  isActive: boolean
  lastLoginAt?: Date
  createdAt: Date
}

export interface AuthUser {
  id: string
  email: string
  username: string
  name: string
  role: UserRole
  isActive: boolean
}

// In-memory user storage
const memoryUsers: Map<string, MemoryUser> = new Map()

// Initialize with default users
async function initializeDefaultUsers() {
  const defaultUsers = [
    {
      id: 'user_owner',
      username: 'owner',
      email: 'owner@system.local',
      name: 'System Owner',
      role: UserRole.OWNER,
      password: '123456'
    },
    {
      id: 'user_admin',
      username: 'admin',
      email: 'admin@system.local',
      name: 'System Administrator',
      role: UserRole.ADMIN,
      password: '123456'
    },
    {
      id: 'user_editor',
      username: 'editor',
      email: 'editor@system.local',
      name: 'Editor User',
      role: UserRole.EDITOR,
      password: '123456'
    },
    {
      id: 'user_viewer',
      username: 'viewer',
      email: 'viewer@system.local',
      name: 'Viewer User',
      role: UserRole.VIEWER,
      password: '123456'
    }
  ]

  for (const userData of defaultUsers) {
    if (!memoryUsers.has(userData.username)) {
      const hashedPassword = await bcrypt.hash(userData.password, 12)
      memoryUsers.set(userData.username, {
        ...userData,
        password: hashedPassword,
        isActive: true,
        createdAt: new Date()
      })
    }
  }

  console.log(`✅ Initialized ${memoryUsers.size} default users in memory`)
}

// Initialize users when module is loaded
initializeDefaultUsers()

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email || '',
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export async function authenticateUser(credentials: { username: string; password: string }): Promise<AuthUser | null> {
  const user = memoryUsers.get(credentials.username)

  if (!user || !user.isActive) {
    console.log(`❌ Authentication failed: User ${credentials.username} not found or inactive`)
    return null
  }

  const isValid = await verifyPassword(credentials.password, user.password)
  if (!isValid) {
    console.log(`❌ Authentication failed: Invalid password for ${credentials.username}`)
    return null
  }

  // Update last login
  user.lastLoginAt = new Date()

  console.log(`✅ Authentication successful: ${user.username} (${user.role})`)

  return {
    id: user.id,
    email: user.email || '',
    username: user.username,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
  }
}

export async function createUser(data: {
  username: string
  password: string
  name: string
  email?: string
  role?: UserRole
}): Promise<AuthUser> {
  const hashedPassword = await hashPassword(data.password)

  const user: MemoryUser = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    username: data.username,
    email: data.email || `${data.username}@local.user`,
    password: hashedPassword,
    name: data.name,
    role: data.role || UserRole.VIEWER,
    isActive: true,
    createdAt: new Date()
  }

  memoryUsers.set(user.username, user)

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
  }
}

export async function getUserById(id: string): Promise<AuthUser | null> {
  for (const user of memoryUsers.values()) {
    if (user.id === id && user.isActive) {
      return {
        id: user.id,
        email: user.email || '',
        username: user.username,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
      }
    }
  }
  return null
}

export async function createAuditLog(data: {
  userId: string
  action: string
  resource: string
  resourceId?: string
  oldValue?: string
  newValue?: string
  ipAddress?: string
  userAgent?: string
}) {
  // For now, just log to console since we're using memory storage
  console.log('📝 Audit Log:', {
    timestamp: new Date().toISOString(),
    ...data
  })
  return { id: `audit_${Date.now()}`, ...data }
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

export function getAllUsers(): AuthUser[] {
  return Array.from(memoryUsers.values()).map(user => ({
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
  }))
}
