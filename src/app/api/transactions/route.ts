import { NextRequest, NextResponse } from 'next/server'
import { memoryStorage } from '@/lib/memory-storage'
import { addTimestamps } from '@/lib/time-utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDateTime = searchParams.get('startDateTime')
    const endDateTime = searchParams.get('endDateTime')

    let transactions

    // Force use memory storage for now to ensure sample data works
    console.log('Using memory storage for transactions (forced)')
    transactions = memoryStorage.allTransactions || []
    
    // Apply date-time filter if provided
    if (startDateTime || endDateTime) {
      transactions = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date || transaction.createdAt)
        
        if (startDateTime) {
          const startDate = new Date(startDateTime)
          if (transactionDate < startDate) {
            return false
          }
        }
        
        if (endDateTime) {
          const endDate = new Date(endDateTime)
          if (transactionDate > endDate) {
            return false
          }
        }
        
        return true
      })
    }

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, amount, type, categoryId, teamId, memberId, date, bankName, bankAccount, accountName, cardNumber, cardHolderName } = body

    if (!title || !amount || !type || !categoryId) {
      return NextResponse.json({ error: 'Missing required fields: title, amount, type, categoryId' }, { status: 400 })
    }

    // Try database first
    try {
      // Verify category exists
      const category = await db.category.findUnique({
        where: { id: categoryId }
      })

      if (!category) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 })
      }

      // Verify team exists if provided
      if (teamId) {
        const team = await db.team.findUnique({
          where: { id: teamId }
        })
        if (!team) {
          return NextResponse.json({ error: 'Team not found' }, { status: 404 })
        }
      }

      // Verify member exists if provided
      if (memberId) {
        try {
          const member = await db.member.findUnique({
            where: { id: memberId }
          })
          if (!member) {
            // Try memory storage fallback
            const memoryMember = memoryStorage.members.find(m => m.id === memberId)
            if (!memoryMember) {
              return NextResponse.json({ error: 'Member not found' }, { status: 404 })
            }
          }
        } catch (memberError) {
          // Try memory storage fallback
          const memoryMember = memoryStorage.members.find(m => m.id === memberId)
          if (!memoryMember) {
            return NextResponse.json({ error: 'Member not found' }, { status: 404 })
          }
        }
      }

      const newTransaction = await db.transaction.create({
        data: {
          title,
          description: description || '',
          amount: parseInt(amount),
          type,
          categoryId,
          teamId: teamId || null,
          memberId: memberId || null,
          date: date ? new Date(date) : new Date(),
          bankName: bankName || null,
          bankAccount: bankAccount || null,
          accountName: accountName || null,
          cardNumber: cardNumber || null,
          cardHolderName: cardHolderName || null
        },
        include: {
          category: true,
          team: true,
          member: true
        }
      })

      console.log('Transaction created:', newTransaction)
      return NextResponse.json(newTransaction, { status: 201 })
    } catch (dbError) {
      // Fallback to memory storage
      console.log('Database failed, using memory storage for transaction creation')
      
      // Find category from memory storage
      const category = memoryStorage.categories.find(c => c.id === categoryId)
      if (!category) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 })
      }

      // Find team if provided
      const team = teamId ? memoryStorage.allTeams.find(t => t.id === teamId) : null
      
      // Find member if provided
      const member = memberId ? memoryStorage.members.find(m => m.id === memberId) : null

      const newTransaction = memoryStorage.createTransaction({
        title,
        description: description || '',
        amount: parseInt(amount),
        type,
        categoryId,
        teamId: teamId || null,
        memberId: memberId || null,
        date: date ? new Date(date) : new Date(),
        bankName: bankName || null,
        bankAccount: bankAccount || null,
        accountName: accountName || null,
        cardNumber: cardNumber || null,
        cardHolderName: cardHolderName || null,
        category,
        team,
        member
      })

      console.log('Transaction created in memory storage:', newTransaction)
      return NextResponse.json(newTransaction, { status: 201 })
    }
  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
  }
}