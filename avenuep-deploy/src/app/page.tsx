'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/sidebar'
import { Dashboard } from '@/components/dashboard'
import { TransactionForm } from '@/components/transaction-form'
import { TransactionList } from '@/components/transaction-list'
import { TeamManagement } from '@/components/team-management'
import { CategoryManagement } from '@/components/category-management'
import { Reports } from '@/components/reports'
import { EmployeeManagement } from '@/components/employee-management'
import { PayrollManagement } from '@/components/payroll-management'
import { CustomerCounter } from '@/components/CustomerCounter'

type ActiveView = 'dashboard' | 'transactions' | 'add-transaction' | 'teams' | 'categories' | 'reports' | 'employees' | 'payroll' | 'customers'

export default function Home() {
  const [activeView, setActiveView] = useState<ActiveView>('customers')

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />
      case 'transactions':
        return <TransactionList />
      case 'add-transaction':
        return <TransactionForm />
      case 'teams':
        return <TeamManagement />
      case 'employees':
        return <EmployeeManagement />
      case 'payroll':
        return <PayrollManagement />
      case 'customers':
        return <CustomerCounter />
      case 'categories':
        return <CategoryManagement />
      case 'reports':
        return <Reports />
      default:
        return <CustomerCounter />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}