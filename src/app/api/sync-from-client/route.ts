import { NextRequest, NextResponse } from 'next/server'
import { memoryStorage } from '@/lib/memory-storage'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Update server memory storage with client data
    if (data.teams) {
      memoryStorage.setTeams(data.teams)
      console.log('Synced teams from client:', data.teams.length)
    }
    if (data.members) {
      memoryStorage.setMembers(data.members)
      console.log('Synced members from client:', data.members.length)
    }
    if (data.salaries) {
      memoryStorage.setSalaries(data.salaries)
      console.log('Synced salaries from client:', data.salaries.length)
    }
    if (data.bonuses) {
      memoryStorage.setBonuses(data.bonuses)
      console.log('Synced bonuses from client:', data.bonuses.length)
    }
    if (data.commissions) {
      memoryStorage.setCommissions(data.commissions)
      console.log('Synced commissions from client:', data.commissions.length)
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error syncing from client:', error)
    return NextResponse.json({ error: 'Failed to sync data' }, { status: 500 })
  }
}