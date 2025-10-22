import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { memoryStorage } from '@/lib/memory-storage'

export async function GET(request: NextRequest) {
  try {
    let members

    // Force use memory storage for testing
    console.log('Using memory storage for members')
    members = memoryStorage.allMembers || []
    console.log('Members from memory storage:', members.length)
    console.log('Member IDs:', members.map(m => m.id))

    return NextResponse.json(members)
  } catch (error) {
    console.error('Error fetching members:', error)
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  let body: any
  try {
    body = await request.json()
    const { name, phone, bankName, bankAccount, bankBranch, salary, teamId } = body

    if (!name || !phone || !salary || !teamId) {
      return NextResponse.json({ error: 'Name, phone, salary, and teamId are required' }, { status: 400 })
    }

    // Force use memory storage for testing
    console.log('Using memory storage for member creation')
    
    // Find team from memory storage
    const team = memoryStorage.allTeams.find(t => t.id === teamId)
    
    const newMember = memoryStorage.createMember({
      name,
      email: `${phone}@placeholder.com`, // Generate placeholder email
      phone,
      bankName: bankName || null,
      bankAccount: bankAccount || null,
      bankBranch: bankBranch || null,
      role: 'สมาชิก',
      position: null,
      department: null,
      salary: parseInt(salary) || 0,
      hireDate: new Date().toISOString(),
      status: 'active',
      teamId: teamId.toString(),
      team: team ? { id: team.id, name: team.name } : null
    })
    
    console.log('Member created in memory storage:', newMember)
    console.log('Total members after creation:', memoryStorage.allMembers.length)
    return NextResponse.json(newMember, { status: 201 })
  } catch (error) {
    console.error('Error creating member:', error)
    return NextResponse.json({ error: 'Failed to create member' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  let body: any
  try {
    body = await request.json()
    const { id, name, phone, bankName, bankAccount, bankBranch, salary, teamId } = body

    if (!id) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 })
    }

    // Try database first
    try {
      const member = await db.member.update({
        where: { id },
        data: {
          name: name || undefined,
          phone: phone || undefined,
          bankName: bankName !== undefined ? bankName : undefined,
          bankAccount: bankAccount !== undefined ? bankAccount : undefined,
          bankBranch: bankBranch !== undefined ? bankBranch : undefined,
          salary: salary !== undefined ? parseInt(salary) || 0 : undefined,
          teamId: teamId !== undefined ? teamId || null : undefined,
        },
        include: {
          team: true
        }
      })
      return NextResponse.json(member)
    } catch (dbError) {
      // Fallback to memory storage
      console.log('Database failed, using memory storage for member update')
      
      const memberIndex = memoryStorage.allMembers.findIndex(m => m.id === id)
      if (memberIndex === -1) {
        return NextResponse.json({ error: 'Member not found' }, { status: 404 })
      }
      
      // Find team if teamId is provided
      const team = teamId ? memoryStorage.allTeams.find(t => t.id === teamId) : memoryStorage.allMembers[memberIndex].team
      
      const updatedMember = memoryStorage.updateMember(id, {
        name: name || undefined,
        phone: phone || undefined,
        bankName: bankName !== undefined ? bankName : undefined,
        bankAccount: bankAccount !== undefined ? bankAccount : undefined,
        bankBranch: bankBranch !== undefined ? bankBranch : undefined,
        salary: salary !== undefined ? parseInt(salary) || 0 : undefined,
        teamId: teamId !== undefined ? teamId.toString() : undefined,
        team: team
      })
      
      if (!updatedMember) {
        return NextResponse.json({ error: 'Member not found' }, { status: 404 })
      }
      
      console.log('Member updated in memory storage:', updatedMember)
      return NextResponse.json(updatedMember)
    }
  } catch (error) {
    console.error('Error updating member:', error)
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Member ID is required' }, { status: 400 })
    }

    // Try database first
    try {
      // First try to delete related records, then the member
      await db.$transaction(async (tx) => {
        // Delete related records (optional: handle cascade properly)
        await tx.salary.deleteMany({ where: { memberId: id } })
        await tx.bonus.deleteMany({ where: { memberId: id } })
        await tx.commission.deleteMany({ where: { memberId: id } })
        await tx.transaction.deleteMany({ where: { memberId: id } })
        await tx.customer.deleteMany({ where: { memberId: id } })
        
        // Now delete the member
        await tx.member.delete({
          where: { id }
        })
      })
      return NextResponse.json({ success: true })
    } catch (dbError) {
      // Fallback to in-memory storage
      console.log('Database failed, using in-memory storage for member deletion')
      console.log('Members before deletion:', memoryStorage.allMembers.length)
      
      const deletedMember = memoryStorage.deleteMember(id)
      
      if (!deletedMember) {
        return NextResponse.json({ error: 'Member not found' }, { status: 404 })
      }
      
      console.log('Member deleted from memory:', id)
      console.log('Total members after deletion:', memoryStorage.allMembers.length)
      return NextResponse.json({ success: true })
    }
  } catch (error) {
    console.error('Error deleting member:', error)
    return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 })
  }
}