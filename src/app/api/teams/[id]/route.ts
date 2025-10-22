import { NextRequest, NextResponse } from 'next/server'
import { memoryStorage } from '@/lib/memory-storage'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id
    const team = memoryStorage.allTeams.find(t => t.id === id)
    
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }
    
    return NextResponse.json(team)
  } catch (error) {
    console.error('Error fetching team:', error)
    return NextResponse.json({ error: 'Failed to fetch team' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let body: any
  try {
    const id = (await params).id
    body = await request.json()
    const { name, description, leader, budget, color } = body

    if (!name) {
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 })
    }

    const teamIndex = memoryStorage.allTeams.findIndex(t => t.id === id)
    
    if (teamIndex === -1) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    // Update team
    const updatedTeam = {
      ...memoryStorage.allTeams[teamIndex],
      name,
      description: description || memoryStorage.allTeams[teamIndex].description,
      leader: leader || memoryStorage.allTeams[teamIndex].leader,
      budget: parseInt(budget) || 0,
      color: color || memoryStorage.allTeams[teamIndex].color,
      updatedAt: new Date().toISOString()
    }

    const currentTeams = memoryStorage.allTeams || [];
    currentTeams[teamIndex] = updatedTeam;
    memoryStorage.setTeams(currentTeams);
    console.log('Team updated in memory storage:', updatedTeam)

    return NextResponse.json(updatedTeam)
  } catch (error) {
    console.error('Error updating team:', error)
    return NextResponse.json({ error: 'Failed to update team' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id
    const teamIndex = memoryStorage.allTeams.findIndex(t => t.id === id)
    
    if (teamIndex === -1) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    // Remove team
    const deletedTeam = memoryStorage.allTeams[teamIndex]
    const currentTeams = memoryStorage.allTeams || [];
    currentTeams.splice(teamIndex, 1);
    memoryStorage.setTeams(currentTeams);
    
    console.log('Team deleted from memory storage:', deletedTeam)
    console.log('Total teams after deletion:', memoryStorage.allTeams.length)

    return NextResponse.json({ message: 'Team deleted successfully' })
  } catch (error) {
    console.error('Error deleting team:', error)
    return NextResponse.json({ error: 'Failed to delete team' }, { status: 500 })
  }
}