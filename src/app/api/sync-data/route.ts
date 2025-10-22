import { NextRequest, NextResponse } from 'next/server'
import { memoryStorage } from '@/lib/memory-storage'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Update memory storage with client data
    if (data.teams) memoryStorage.setTeams(data.teams)
    if (data.members) memoryStorage.members = data.members
    if (data.customers) memoryStorage.customers = data.customers
    if (data.categories) memoryStorage.categories = data.categories
    if (data.transactions) memoryStorage.transactions = data.transactions
    if (data.salaries) memoryStorage.setSalaries(data.salaries)
    if (data.bonuses) memoryStorage.setBonuses(data.bonuses)
    if (data.commissions) memoryStorage.setCommissions(data.commissions)
    
    console.log('Data synchronized from client to server memory storage')
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error syncing data:', error)
    return NextResponse.json({ error: 'Failed to sync data' }, { status: 500 })
  }
}

export async function GET() {
  try {
    return NextResponse.json({
      teams: memoryStorage.allTeams,
      members: memoryStorage.members,
      customers: memoryStorage.customers,
      categories: memoryStorage.categories,
      transactions: memoryStorage.transactions,
      salaries: memoryStorage.allSalaries,
      bonuses: memoryStorage.allBonuses,
      commissions: memoryStorage.allCommissions
    })
  } catch (error) {
    console.error('Error getting sync data:', error)
    return NextResponse.json({ error: 'Failed to get sync data' }, { status: 500 })
  }
}