import { PrismaClient } from '@prisma/client'
import { hashPassword } from './src/lib/auth-server'

const prisma = new PrismaClient()

async function main() {
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email)
      return
    }

    // Create admin user
    const hashedPassword = await hashPassword('admin123')
    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        username: 'admin',
        password: hashedPassword,
        name: 'System Administrator',
        role: 'ADMIN',
        isActive: true,
      },
    })

    console.log('Admin user created successfully:')
    console.log('Email: admin@example.com')
    console.log('Password: admin123')
    console.log('Username: admin')
    console.log('Role: ADMIN')

    // Create editor user
    const editorPassword = await hashPassword('editor123')
    const editor = await prisma.user.create({
      data: {
        email: 'editor@example.com',
        username: 'editor',
        password: editorPassword,
        name: 'Editor User',
        role: 'EDITOR',
        isActive: true,
      },
    })

    console.log('\nEditor user created successfully:')
    console.log('Email: editor@example.com')
    console.log('Password: editor123')
    console.log('Username: editor')
    console.log('Role: EDITOR')

    // Create viewer user
    const viewerPassword = await hashPassword('viewer123')
    const viewer = await prisma.user.create({
      data: {
        email: 'viewer@example.com',
        username: 'viewer',
        password: viewerPassword,
        name: 'Viewer User',
        role: 'VIEWER',
        isActive: true,
      },
    })

    console.log('\nViewer user created successfully:')
    console.log('Email: viewer@example.com')
    console.log('Password: viewer123')
    console.log('Username: viewer')
    console.log('Role: VIEWER')

  } catch (error) {
    console.error('Error creating seed users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()