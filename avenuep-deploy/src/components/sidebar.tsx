'use client'

import { useState } from 'react'
import { 
  LayoutDashboard, 
  Receipt, 
  PlusCircle, 
  Users, 
  Tags, 
  FileText,
  UserCheck,
  DollarSign,
  UserPlus,
  Menu,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type ActiveView = 'dashboard' | 'transactions' | 'add-transaction' | 'teams' | 'categories' | 'reports' | 'employees' | 'payroll' | 'customers'

interface SidebarProps {
  activeView: ActiveView
  onViewChange: (view: ActiveView) => void
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    {
      id: 'dashboard' as ActiveView,
      label: 'แดชบอร์ด',
      icon: LayoutDashboard,
    },
    {
      id: 'transactions' as ActiveView,
      label: 'รายการธุรกรรม',
      icon: Receipt,
    },
    {
      id: 'add-transaction' as ActiveView,
      label: 'เพิ่มรายการ',
      icon: PlusCircle,
    },
    {
      id: 'teams' as ActiveView,
      label: 'จัดการทีม',
      icon: Users,
    },
    {
      id: 'employees' as ActiveView,
      label: 'จัดการพนักงาน',
      icon: UserCheck,
    },
    {
      id: 'payroll' as ActiveView,
      label: 'ค่าตอบแทน',
      icon: DollarSign,
    },
    {
      id: 'customers' as ActiveView,
      label: 'จำนวนลูกค้า',
      icon: UserPlus,
    },
    {
      id: 'categories' as ActiveView,
      label: 'หมวดหมู่',
      icon: Tags,
    },
    {
      id: 'reports' as ActiveView,
      label: 'รายงาน',
      icon: FileText,
    },
  ]

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-gray-800">
              บัญชีการตลาด
            </h1>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 p-0"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.id}>
                <Button
                  variant={activeView === item.id ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3",
                    isCollapsed && "justify-center px-2"
                  )}
                  onClick={() => onViewChange(item.id)}
                >
                  <Icon className="h-5 w-5" />
                  {!isCollapsed && (
                    <span className="truncate">{item.label}</span>
                  )}
                </Button>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        {!isCollapsed && (
          <div className="text-sm text-gray-500 text-center">
            เวอร์ชัน 1.0.0
          </div>
        )}
      </div>
    </div>
  )
}