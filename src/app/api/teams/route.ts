import { NextRequest, NextResponse } from 'next/server'
import { memoryStorage } from '@/lib/memory-storage'

export async function GET() {
  try {
    // Always use memory storage for consistency
    console.log('Getting teams from memory storage. Total:', memoryStorage.allTeams.length)
    
    // Populate members for each team
    const teamsWithMembers = memoryStorage.allTeams.map(team => {
      const teamMembers = memoryStorage.allMembers.filter(member => member.teamId === team.id)
      return {
        ...team,
        members: teamMembers
      }
    })
    
    return NextResponse.json(teamsWithMembers)
  } catch (error) {
    console.error('Error fetching teams:', error)
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  let body: any
  try {
    body = await request.json()
    const { name, description, leader, budget, color } = body

    if (!name) {
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 })
    }

    const newTeam = memoryStorage.createTeam({
      name,
      description: description || '',
      leader: leader || '',
      budget: parseInt(budget) || 0,
      color: color || 'blue',
      members: [],
      transactions: []
    })

    console.log('Team created in memory storage:', newTeam)
    console.log('Total teams after creation:', memoryStorage.allTeams.length)
    
    return NextResponse.json(newTeam, { status: 201 })
  } catch (error) {
    console.error('Error creating team:', error)
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 })
  }
}