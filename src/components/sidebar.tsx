'use client'

import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  Receipt, 
  PlusCircle, 
  Users, 
  Tags, 
  FileText,
  DollarSign,
  UserPlus,
  Menu,
  X,
  TrendingUp,
  TestTube,
  RefreshCw,
  Shield,
  LogOut,
  HardDrive
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/lib/auth-client'
import { useMobile } from '@/hooks/use-mobile'

type ActiveView = 'dashboard' | 'transactions' | 'add-transaction' | 'add-income' | 'teams' | 'categories' | 'reports' | 'payroll' | 'customers' | 'reset' | 'test' | 'admin' | 'owner' | 'files'

interface SidebarProps {
  activeView: ActiveView
  onViewChange: (view: ActiveView) => void
  userRole: UserRole
  isCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

export function Sidebar({ activeView, onViewChange, userRole, isCollapsed: propIsCollapsed, onCollapsedChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(propIsCollapsed || false)
  const { user, logout } = useAuth()
  const isMobile = useMobile()

  // Sync with prop if provided
  useEffect(() => {
    if (propIsCollapsed !== undefined) {
      setIsCollapsed(propIsCollapsed)
    }
  }, [propIsCollapsed])

  const handleCollapsedChange = (collapsed: boolean) => {
    setIsCollapsed(collapsed)
    if (onCollapsedChange) {
      onCollapsedChange(collapsed)
    }
  }

  // Reset collapsed state on mobile
  useEffect(() => {
    if (isMobile) {
      handleCollapsedChange(false)
    }
  }, [isMobile])

  const getFilteredMenuItems = () => {
    const allItems = [
      {
        id: 'dashboard' as ActiveView,
        label: 'แดชบอร์ด',
        icon: LayoutDashboard,
        requiredRole: undefined,
        requiredAction: 'view' as const,
      },
      {
        id: 'transactions' as ActiveView,
        label: 'รายการธุรกรรม',
        icon: Receipt,
        requiredRole: undefined,
        requiredAction: 'view' as const,
      },
      {
        id: 'add-income' as ActiveView,
        label: 'เพิ่มรายรับ',
        icon: TrendingUp,
        requiredRole: undefined,
        requiredAction: 'edit' as const,
      },
      {
        id: 'add-transaction' as ActiveView,
        label: 'เพิ่มรายการ',
        icon: PlusCircle,
        requiredRole: undefined,
        requiredAction: 'edit' as const,
      },
      {
        id: 'teams' as ActiveView,
        label: 'จัดการทีม',
        icon: Users,
        requiredRole: undefined,
        requiredAction: 'view' as const,
      },
      {
        id: 'payroll' as ActiveView,
        label: 'ค่าตอบแทน',
        icon: DollarSign,
        requiredRole: undefined,
        requiredAction: 'view' as const,
      },
      {
        id: 'customers' as ActiveView,
        label: 'จำนวนลูกค้า',
        icon: UserPlus,
        requiredRole: undefined,
        requiredAction: 'view' as const,
      },
      {
        id: 'categories' as ActiveView,
        label: 'หมวดหมู่',
        icon: Tags,
        requiredRole: undefined,
        requiredAction: 'view' as const,
      },
      {
        id: 'reports' as ActiveView,
        label: 'รายงาน',
        icon: FileText,
        requiredRole: undefined,
        requiredAction: 'view' as const,
      },
      {
        id: 'files' as ActiveView,
        label: 'จัดการไฟล์',
        icon: HardDrive,
        requiredRole: undefined,
        requiredAction: 'view' as const,
      },
      {
        id: 'admin' as ActiveView,
        label: 'จัดการผู้ใช้',
        icon: Shield,
        requiredRole: UserRole.ADMIN,
        requiredAction: 'view' as const,
      },
      {
        id: 'owner' as ActiveView,
        label: '👑 จัดการระบบ',
        icon: Shield,
        requiredRole: UserRole.OWNER,
        requiredAction: 'delete' as const,
        className: 'text-purple-600 hover:text-purple-700 hover:bg-purple-50',
      },
      {
        id: 'reset' as ActiveView,
        label: 'รีเซ็ตระบบ',
        icon: RefreshCw,
        requiredRole: UserRole.ADMIN,
        requiredAction: 'delete' as const,
        className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
      },
      {
        id: 'test' as ActiveView,
        label: 'ทดสอบระบบ',
        icon: TestTube,
        requiredRole: undefined,
        requiredAction: 'view' as const,
      },
    ]

    return allItems.filter(item => {
      if (item.requiredRole && userRole !== item.requiredRole) {
        return false
      }
      if (item.requiredAction === 'edit' && userRole === UserRole.VIEWER) {
        return false
      }
      if (item.requiredAction === 'delete' && userRole !== UserRole.ADMIN && userRole !== UserRole.OWNER) {
        return false
      }
      return true
    })
  }

  const menuItems = getFilteredMenuItems()

  const handleLogout = () => {
    logout()
  }

  const handleMenuItemClick = (view: ActiveView) => {
    onViewChange(view)
  }

  const SidebarContent = () => (
    <div className={cn(
      "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col h-full",
      !isMobile && (isCollapsed ? "w-16" : "w-64"),
      isMobile && "w-64"
    )}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {(!isCollapsed || isMobile) && (
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                บัญชีการตลาด
              </h1>
              <div className="text-xs text-gray-500 mt-1">
                {user?.name} ({userRole})
              </div>
            </div>
          )}
          {!isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCollapsedChange(!isCollapsed)}
              className="h-8 w-8 p-0 rounded-lg hover:bg-accent transition-all duration-200"
            >
              {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.id}>
                <Button
                  variant={activeView === item.id ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-12 rounded-lg transition-all duration-200",
                    isCollapsed && !isMobile && "justify-center px-2",
                    activeView === item.id && "shadow-lg hover:shadow-xl",
                    item.className
                  )}
                  onClick={() => handleMenuItemClick(item.id)}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {(!isCollapsed || isMobile) && (
                    <span className="truncate">{item.label}</span>
                  )}
                </Button>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200 space-y-2">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 h-12 rounded-lg transition-all duration-200",
            isCollapsed && !isMobile && "justify-center px-2"
          )}
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {(!isCollapsed || isMobile) && (
            <span className="truncate">ออกจากระบบ</span>
          )}
        </Button>
        {(!isCollapsed || isMobile) && (
          <div className="text-sm text-gray-500 text-center">
            เวอร์ชัน 1.0.0
          </div>
        )}
      </div>
    </div>
  )

  // Mobile sidebar - just return content without Sheet wrapper
  // (Sheet is handled in the parent component)
  if (isMobile) {
    return <SidebarContent />
  }

  // Desktop sidebar
  return <SidebarContent />
}