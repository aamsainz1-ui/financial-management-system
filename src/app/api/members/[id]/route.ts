import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { memoryStorage } from '@/lib/memory-storage'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Try database first
    try {
      const member = await db.member.findUnique({
        where: { id },
        include: {
          team: true
        }
      })
      
      if (!member) {
        return NextResponse.json({ error: 'Member not found' }, { status: 404 })
      }
      
      return NextResponse.json(member)
    } catch (dbError) {
      // Fallback to memory storage
      console.log('Database failed, using memory storage for member retrieval')
      
      const member = memoryStorage.members.find(m => m.id === id)
      
      if (!member) {
        return NextResponse.json({ error: 'Member not found' }, { status: 404 })
      }
      
      return NextResponse.json(member)
    }
  } catch (error) {
    console.error('Error getting member:', error)
    return NextResponse.json({ error: 'Failed to get member' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { name, phone, bankName, bankAccount, bankBranch, salary, teamId, position, department, role, status } = body

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
          position: position !== undefined ? position : undefined,
          department: department !== undefined ? department : undefined,
          role: role !== undefined ? role : undefined,
          status: status !== undefined ? status : undefined,
        },
        include: {
          team: true
        }
      })
      return NextResponse.json(member)
    } catch (dbError) {
      // Fallback to memory storage
      console.log('Database failed, using memory storage for member update')
      
      const memberIndex = memoryStorage.members.findIndex(m => m.id === id)
      if (memberIndex === -1) {
        return NextResponse.json({ error: 'Member not found' }, { status: 404 })
      }
      
      // Find team if teamId is provided
      const team = teamId ? memoryStorage.allTeams.find(t => t.id === teamId) : memoryStorage.members[memberIndex].team
      
      const updatedMember = {
        ...memoryStorage.members[memberIndex],
        name: name || memoryStorage.members[memberIndex].name,
        phone: phone || memoryStorage.members[memberIndex].phone,
        bankName: bankName !== undefined ? bankName : memoryStorage.members[memberIndex].bankName,
        bankAccount: bankAccount !== undefined ? bankAccount : memoryStorage.members[memberIndex].bankAccount,
        bankBranch: bankBranch !== undefined ? bankBranch : memoryStorage.members[memberIndex].bankBranch,
        salary: salary !== undefined ? parseInt(salary) || 0 : memoryStorage.members[memberIndex].salary,
        teamId: teamId !== undefined ? teamId.toString() : memoryStorage.members[memberIndex].teamId,
        position: position !== undefined ? position : memoryStorage.members[memberIndex].position,
        department: department !== undefined ? department : memoryStorage.members[memberIndex].department,
        role: role !== undefined ? role : memoryStorage.members[memberIndex].role,
        status: status !== undefined ? status : memoryStorage.members[memberIndex].status,
        team: team,
        updatedAt: new Date().toISOString()
      }
      
      memoryStorage.members[memberIndex] = updatedMember
      console.log('Member updated in memory storage:', updatedMember)
      return NextResponse.json(updatedMember)
    }
  } catch (error) {
    console.error('Error updating member:', error)
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Try database first
    try {
      await db.member.delete({
        where: { id }
      })
      return NextResponse.json({ success: true })
    } catch (dbError) {
      // Fallback to memory storage
      console.log('Database failed, using memory storage for member deletion')
      
      const memberIndex = memoryStorage.members.findIndex(m => m.id === id)
      if (memberIndex === -1) {
        return NextResponse.json({ error: 'Member not found' }, { status: 404 })
      }
      
      const currentMembers = memoryStorage.allMembers || [];
      currentMembers.splice(memberIndex, 1);
      memoryStorage.setMembers(currentMembers);
      console.log('Member deleted from memory storage:', id)
      return NextResponse.json({ success: true })
    }
  } catch (error) {
    console.error('Error deleting member:', error)
    return NextResponse.json({ error: 'Failed to delete member' }, { status: 500 })
  }
}