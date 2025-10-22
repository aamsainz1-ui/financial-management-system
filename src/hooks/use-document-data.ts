import { useState, useEffect } from 'react'

interface DocumentData {
  incomeSources: Array<{
    name: string
    amount: number
    source: string
  }>
  expenseCategories: Array<{
    name: string
    amount: number
    details: string
  }>
  monthlyBreakdown: Array<{
    month: string
    income: number
    expenses: number
    netProfit: number
    details: string
  }>
  systemMetrics: {
    totalFiles: number
    totalSize: string
    avgFileSize: string
    largestFile: string
    systemHealth: string
    uptime: string
  }
  documentInfo: {
    path: string
    lastModified: string
    totalFolders: number
    totalFiles: number
    permissions: string
    systemType: string
  }
  summary: {
    totalIncome: number
    totalExpenses: number
    totalNetProfit: number
    profitMargin: string
    avgMonthlyIncome: number
    avgMonthlyExpenses: number
    bestMonth: any
    worstMonth: any
  }
  extractedAt: string
  dataSource: string
}

export function useDocumentData() {
  const [data, setData] = useState<DocumentData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDocumentData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/document-data')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error('Error fetching document data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch document data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDocumentData()
  }, [])

  return {
    data,
    isLoading,
    error,
    refetch: fetchDocumentData
  }
}