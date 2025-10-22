import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { UserRole } from '@prisma/client'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface AuthUser {
  id: string
  email: string
  username: string
  name: string
  role: UserRole
  isActive: boolean
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  password: string
  name: string
  email?: string
  role?: UserRole
}

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

export async function createUser(data: RegisterData): Promise<AuthUser> {
  const hashedPassword = await hashPassword(data.password)
  
  const user = await db.user.create({
    data: {
      username: data.username,
      email: data.email || `${data.username}@local.user`, // Use provided email or generate placeholder
      password: hashedPassword,
      name: data.name,
      role: data.role,
    },
  })

  return {
    id: user.id,
    email: user.email || '',
    username: user.username,
    name: user.name,
    role: user.role as UserRole,
    isActive: user.isActive,
  }
}

export async function authenticateUser(credentials: LoginCredentials): Promise<AuthUser | null> {
  const user = await db.user.findUnique({
    where: { username: credentials.username },
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
    email: user.email || '',
    username: user.username,
    name: user.name,
    role: user.role as UserRole,
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
    email: user.email || '',
    username: user.username,
    name: user.name,
    role: user.role as UserRole,
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