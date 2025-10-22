'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, User, LogOut, Menu } from 'lucide-react'
import { Sidebar } from '@/components/sidebar'
import { Dashboard } from '@/components/dashboard'
import { TransactionForm } from '@/components/transaction-form'
import { IncomeForm } from '@/components/income-form'
import { TransactionList } from '@/components/transaction-list'
import { TeamManagement } from '@/components/team-management'
import { CategoryManagement } from '@/components/category-management'
import { Reports } from '@/components/reports'
import { PayrollManagement } from '@/components/payroll-management'
import { CustomerCounter } from '@/components/CustomerCounter'
import { SystemReset } from '@/components/system-reset'
import DataTestComponent from '@/components/DataTestComponent'
import { DataManagement } from '@/components/data-management'
import { OwnerManagement } from '@/components/owner-management'
import { EnhancedFileManager } from '@/components/file-manager-enhanced'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { cn } from '@/lib/utils'
import { useMobile } from '@/hooks/use-mobile'
import { useErrorHandler } from '@/hooks/use-error-handler'


type ActiveView = 'dashboard' | 'transactions' | 'add-transaction' | 'add-income' | 'teams' | 'categories' | 'reports' | 'payroll' | 'customers' | 'reset' | 'test' | 'admin' | 'owner' | 'files'

export default function Home() {
  const [activeView, setActiveView] = useState<ActiveView>('dashboard')
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const isMobile = useMobile()
  
  // Add error handling for React 19 console errors
  useErrorHandler()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Welcome</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-gray-600">
              Please login to access the financial management system
            </p>
            <div className="flex gap-4">
              <Button 
                className="flex-1 shadow-lg hover:shadow-xl transition-all duration-200" 
                onClick={() => router.push('/login')}
              >
                Login
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 border-2 hover:bg-accent hover:border-accent transition-all duration-200"
                onClick={() => router.push('/register')}
              >
                Register
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />
      case 'transactions':
        return <ProtectedRoute requiredAction="view"><TransactionList /></ProtectedRoute>
      case 'add-transaction':
        return <ProtectedRoute requiredAction="edit"><TransactionForm /></ProtectedRoute>
      case 'add-income':
        return <ProtectedRoute requiredAction="edit"><IncomeForm /></ProtectedRoute>
      case 'teams':
        return <ProtectedRoute requiredAction="view"><TeamManagement /></ProtectedRoute>
      case 'payroll':
        return <ProtectedRoute requiredAction="view"><PayrollManagement /></ProtectedRoute>
      case 'customers':
        return <ProtectedRoute requiredAction="view"><CustomerCounter /></ProtectedRoute>
      case 'categories':
        return <ProtectedRoute requiredAction="view"><CategoryManagement /></ProtectedRoute>
      case 'reports':
        return <Reports />
      case 'reset':
        return <ProtectedRoute requiredRole={UserRole.ADMIN}><SystemReset /></ProtectedRoute>
      case 'test':
        return <DataTestComponent />
      case 'admin':
        return <ProtectedRoute requiredRole={UserRole.ADMIN}>
          <div className="p-6">
            <Button 
              variant="success" 
              onClick={() => router.push('/admin')} 
              className="mb-4 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Go to Admin Panel
            </Button>
            <p className="text-gray-600">Click above to access the full admin management panel</p>
          </div>
        </ProtectedRoute>
      case 'owner':
        return <ProtectedRoute requiredRole={UserRole.OWNER}>
          <div className="p-6">
            <Card className="mb-6 border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="text-purple-800 flex items-center gap-2">
                  👑 แผงควบคุมเจ้าของระบบ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-purple-700 mb-4">
                  ยินดีต้อนรับเจ้าของเว็บไซต์! คุณมีสิทธิ์ควบคุมทุกอย่างในระบบ
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    variant="gradient"
                    onClick={() => router.push('/admin')} 
                    className="shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    📋 จัดการผู้ใช้ทั้งหมด
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-2 border-purple-300 text-purple-700 hover:bg-purple-100 hover:border-purple-400 transition-all duration-200"
                    onClick={() => router.push('/admin')}
                  >
                    ⚙️ ตั้งค่าระบบ
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="border border-purple-300 text-purple-700 hover:bg-purple-100 transition-all duration-200"
                  >
                    📊 รายงานสูงสุด
                  </Button>
                  <Button 
                    variant="secondary" 
                    className="border border-purple-300 text-purple-700 hover:bg-purple-100 transition-all duration-200"
                  >
                    🔐 ความปลอดภัย
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Owner Management Section */}
            <Card className="mb-6 border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="text-purple-800 flex items-center gap-2">
                  👑 จัดการ Owner ระบบ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-purple-700 mb-4">
                  จัดการผู้ที่มีสิทธิ์ควบคุมระบบสูงสุด - สามารถแต่งตั้งผู้ใช้คนอื่นเป็น Owner ได้
                </p>
                <OwnerManagement />
              </CardContent>
            </Card>
            
            {/* Data Management Section */}
            <Card className="mb-6 border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-800 flex items-center gap-2">
                  🗂️ จัดการข้อมูลระบบ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-orange-700 mb-4">
                  จัดการข้อมูลทั้งหมดในระบบ - คำเตือน: การดำเนินการเหล่านี้จะส่งผลกระทบต่อข้อมูลทั้งหมด!
                </p>
                <DataManagement />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>🎯 สิทธิ์พิเศษของ Owner</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    ✅ ควบคุมผู้ใช้ทุกระดับ (รวมถึง Admin)
                  </li>
                  <li className="flex items-center gap-2">
                    ✅ เข้าถึงข้อมูลทั้งหมดในระบบ
                  </li>
                  <li className="flex items-center gap-2">
                    ✅ ตั้งค่าและปรับแต่งระบบ
                  </li>
                  <li className="flex items-center gap-2">
                    ✅ ดูรายงานและสถิติทั้งหมด
                  </li>
                  <li className="flex items-center gap-2">
                    ✅ จัดการความปลอดภัยและการสำรองข้อมูล
                  </li>
                  <li className="flex items-center gap-2">
                    ✅ ล้างและโหลดข้อมูลตัวอย่าง
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </ProtectedRoute>
      case 'files':
        return <ProtectedRoute requiredAction="view">
          <EnhancedFileManager />
        </ProtectedRoute>
      default:
        return <CustomerCounter />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      {!isMobile && <Sidebar 
        activeView={activeView} 
        onViewChange={setActiveView} 
        userRole={user.role}
        isCollapsed={isCollapsed}
        onCollapsedChange={setIsCollapsed}
      />}
      
      {/* Main content area */}
      <main className={cn(
        "flex-1 overflow-y-auto transition-all duration-300",
        isMobile ? "ml-0" : isCollapsed ? "ml-16" : "ml-64"
      )}>
        {/* Mobile header */}
        {isMobile && (
          <div className="sticky top-0 z-40 bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-10 w-10 p-0 rounded-lg hover:bg-accent transition-all duration-200"
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-64">
                    <SheetHeader className="sr-only">
                      <SheetTitle>Navigation Menu</SheetTitle>
                    </SheetHeader>
                    <Sidebar 
                      activeView={activeView} 
                      onViewChange={(view) => {
                        setActiveView(view)
                      }} 
                      userRole={user.role}
                      isCollapsed={false}
                      onCollapsedChange={() => {}}
                    />
                  </SheetContent>
                </Sheet>
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <LayoutDashboard className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    {activeView === 'dashboard' && 'แดชบอร์ด'}
                    {activeView === 'transactions' && 'รายการธุรกรรม'}
                    {activeView === 'add-transaction' && 'เพิ่มรายการ'}
                    {activeView === 'add-income' && 'เพิ่มรายรับ'}
                    {activeView === 'teams' && 'จัดการทีม'}
                    {activeView === 'categories' && 'หมวดหมู่'}
                    {activeView === 'reports' && 'รายงาน'}
                    {activeView === 'payroll' && 'ค่าตอบแทน'}
                    {activeView === 'customers' && 'จำนวนลูกค้า'}
                    {activeView === 'files' && 'จัดการไฟล์'}
                    {activeView === 'admin' && 'จัดการผู้ใช้'}
                    {activeView === 'owner' && '👑 จัดการระบบ'}
                    {activeView === 'reset' && 'รีเซ็ตระบบ'}
                    {activeView === 'test' && 'ทดสอบระบบ'}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {user?.name} • {user.role}
                  </p>
                </div>
              </div>
              
              {/* Mobile user menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-10 w-10 p-0 rounded-lg hover:bg-accent transition-all duration-200 border border-border/50"
                  >
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {user?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <div>
                      <div className="font-medium">{user?.name}</div>
                      <div className="text-sm text-gray-500">{user?.role}</div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    ออกจากระบบ
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
        
        {/* Page content */}
        <div className={cn(
          "p-4 sm:p-6",
          isMobile && "pb-20" // Extra padding for mobile to avoid bottom navigation
        )}>
          <ErrorBoundary>
            {renderContent()}
          </ErrorBoundary>
        </div>
      </main>
    </div>
  )
}