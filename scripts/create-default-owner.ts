import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createDefaultOwner() {
  try {
    // Check if owner user already exists
    const existingOwner = await prisma.user.findFirst({
      where: { role: 'OWNER' }
    })

    if (existingOwner) {
      console.log('Owner user already exists:')
      console.log(`Username: ${existingOwner.username}`)
      console.log(`Name: ${existingOwner.name}`)
      console.log(`Role: ${existingOwner.role}`)
      return
    }

    // Create default owner user
    const hashedPassword = await bcrypt.hash('123456', 12)
    
    const owner = await prisma.user.create({
      data: {
        username: 'owner',
        email: 'owner@system.local',
        password: hashedPassword,
        name: 'System Owner',
        role: 'OWNER',
        isActive: true,
      },
    })

    console.log('Default owner user created successfully:')
    console.log(`Username: owner`)
    console.log(`Password: 123456`)
    console.log(`Name: ${owner.name}`)
    console.log(`Role: ${owner.role}`)
    console.log('')
    console.log('⚠️  Please change the password after first login!')

  } catch (error) {
    console.error('Error creating default owner:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createDefaultOwner()