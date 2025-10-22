import { db } from '@/lib/db'
import { UserRole } from '@/lib/auth-client'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Dynamic imports for client-side compatibility
let bcrypt: any = null
let jwt: any = null

async function getModules() {
  if (!bcrypt || !jwt) {
    const bcryptModule = await import('bcryptjs')
    const jwtModule = await import('jsonwebtoken')
    bcrypt = bcryptModule.default || bcryptModule
    jwt = jwtModule.default || jwtModule
  }
  return { bcrypt, jwt }
}

export interface AuthUser {
  id: string
  email: string
  username: string
  name: string
  role: UserRole
  isActive: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  username: string
  password: string
  name: string
  role?: UserRole
}

export async function hashPassword(password: string): Promise<string> {
  const { bcrypt } = await getModules()
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const { bcrypt } = await getModules()
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: AuthUser): string {
  // This is a synchronous function, so we need to handle jwt differently
  if (!jwt) {
    // For now, return a base64 encoded token as fallback
    return Buffer.from(JSON.stringify({ 
      id: user.id, 
      email: user.email, 
      role: user.role 
    })).toString('base64')
  }
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export async function verifyToken(token: string): Promise<any> {
  try {
    // Try to decode as base64 first (fallback)
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString())
      return decoded
    } catch {
      // If base64 fails, try JWT
      const { jwt } = await getModules()
      return jwt.verify(token, JWT_SECRET)
    }
  } catch (error) {
    return null
  }
}

export async function createUser(data: RegisterData): Promise<AuthUser> {
  const hashedPassword = await hashPassword(data.password)
  
  const user = await db.user.create({
    data: {
      ...data,
      password: hashedPassword,
    },
  })

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
  }
}

export async function authenticateUser(credentials: LoginCredentials): Promise<AuthUser | null> {
  const user = await db.user.findUnique({
    where: { email: credentials.email },
  })

  if (!user || !user.isActive) {
    return null
  }

  const isValid = await verifyPassword(credentials.password, user.password)
  if (!isValid) {
    return null
  }

  // Update last login
  await db.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  })

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
  const user = await db.user.findUnique({
    where: { id },
  })

  if (!user || !user.isActive) {
    return null
  }

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
  }
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
  return db.auditLog.create({
    data,
  })
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