'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { useToast } from '@/hooks/use-toast'
import { api } from '@/lib/api'
import { 
  Database, 
  Trash2, 
  Download, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Building,
  Car,
  Zap,
  Utensils,
  Wrench,
  FileText,
  Megaphone,
  Banknote,
  Home,
  Percent,
  MoreHorizontal
} from 'lucide-react'

export function DataManagement() {
  const { toast } = useToast()
  const [isResetting, setIsResetting] = useState(false)
  const [isLoadingSample, setIsLoadingSample] = useState(false)
  const [lastAction, setLastAction] = useState<{ type: string; status: 'success' | 'error'; message: string } | null>(null)
  const [sampleDataPreview, setSampleDataPreview] = useState<any>(null)
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)

  const handleResetData = async () => {
    setIsResetting(true)
    setLastAction(null)
    
    try {
      const result = await api.system.reset()
      
      if (result.success) {
        setLastAction({
          type: 'reset',
          status: 'success',
          message: 'รีเซ็ตข้อมูลสำเร็จแล้ว'
        })
        toast({
          title: "สำเร็จ",
          description: "ล้างข้อมูลทั้งหมดเรียบร้อยแล้ว",
        })
        
        // รีเฟรชหน้าเพื่ออัพเดทข้อมูล
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        throw new Error(result.error || 'ไม่สามารถรีเซ็ตข้อมูลได้')
      }
    } catch (error) {
      console.error('Reset error:', error)
      setLastAction({
        type: 'reset',
        status: 'error',
        message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'
      })
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถล้างข้อมูลได้",
        variant: "destructive",
      })
    } finally {
      setIsResetting(false)
    }
  }

  const handleLoadSampleData = async () => {
    setIsLoadingSample(true)
    setLastAction(null)
    
    try {
      const result = await api.system.loadSampleData()
      
      if (result.success) {
        setLastAction({
          type: 'load-sample',
          status: 'success',
          message: `โหลดข้อมูลตัวอย่างสำเร็จ: ${result.data.teams} ทีม, ${result.data.members} สมาชิก, ${result.data.incomeCategories} หมวดหมู่รายได้, ${result.data.expenseCategories} หมวดหมู่รายจ่าย, ${result.data.incomeTransactions} รายการรายรับ, ${result.data.expenseTransactions} รายการรายจ่าย`
        })
        toast({
          title: "สำเร็จ",
          description: "โหลดข้อมูลตัวอย่างเรียบร้อยแล้ว",
        })
        
        // รีเฟรชหน้าเพื่ออัพเดทข้อมูล
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        throw new Error(result.error || 'ไม่สามารถโหลดข้อมูลตัวอย่างได้')
      }
    } catch (error) {
      console.error('Load sample data error:', error)
      setLastAction({
        type: 'load-sample',
        status: 'error',
        message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด'
      })
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลตัวอย่างได้",
        variant: "destructive",
      })
    } finally {
      setIsLoadingSample(false)
    }
  }

  const handlePreviewSampleData = async () => {
    setIsLoadingPreview(true)
    
    try {
      // Simulate preview data - in real implementation, this could be a separate API endpoint
      const previewData = {
        categories: {
          income: [
            { name: 'รายได้จากการขาย', description: 'รายได้จากการขายสินค้าและบริการ', icon: 'trending-up', color: '#10b981' },
            { name: 'ค่าคอมมิชชัน', description: 'ค่าคอมมิชชันจากยอดขาย', icon: 'percent', color: '#22c55e' },
            { name: 'ดอกเบี้ยธนาคาร', description: 'ดอกเบี้ยจากธนาคารและการลงทุน', icon: 'banknote', color: '#16a34a' },
            { name: 'รายได้จากเช่า', description: 'รายได้จากการให้เช่าสถานที่และอุปกรณ์', icon: 'home', color: '#15803d' },
            { name: 'รายได้อื่นๆ', description: 'รายได้อื่นๆ ที่ไม่ใช่หมวดหมู่ข้างต้น', icon: 'more-horizontal', color: '#166534' }
          ],
          expense: [
            { name: 'ค่าใช้จ่ายทั่วไป', description: 'ค่าใช้จ่ายทั่วไปในการดำเนินงาน', icon: 'shopping-cart', color: '#ef4444' },
            { name: 'ค่าใช้จ่ายสำนักงาน', description: 'ค่าใช้จ่ายเกี่ยวกับสำนักงาน', icon: 'building', color: '#f59e0b' },
            { name: 'เงินเดือนพนักงาน', description: 'ค่าจ้างและเงินเดือนพนักงาน', icon: 'users', color: '#8b5cf6' },
            { name: 'ค่าใช้จ่ายการตลาด', description: 'ค่าใช้จ่ายด้านการตลาดและโฆษณา', icon: 'megaphone', color: '#ec4899' },
            { name: 'ค่าใช้จ่ายยานพาหนะ', description: 'ค่าน้ำมัน ค่าซ่อมรถ ค่าพาหนะ', icon: 'car', color: '#f97316' },
            { name: 'ค่าไฟฟ้า-น้ำ', description: 'ค่าไฟฟ้า ค่าน้ำ ค่าโทรศัพท์', icon: 'zap', color: '#06b6d4' },
            { name: 'ค่าอาหารและเครื่องดื่ม', description: 'ค่าอาหารสำหรับลูกค้าและพนักงาน', icon: 'utensils', color: '#84cc16' },
            { name: 'ค่าซ่อมแซมและบำรุงรักษา', description: 'ค่าซ่อมแซมอุปกรณ์และสถานที่', icon: 'wrench', color: '#6366f1' },
            { name: 'ภาษีและค่าธรรมเนียม', description: 'ภาษีเงินได้ ภาษีบริษัท และค่าธรรมเนียมต่างๆ', icon: 'file-text', color: '#dc2626' },
            { name: 'ค่าใช้จ่ายอื่นๆ', description: 'ค่าใช้จ่ายอื่นๆ ที่ไม่ใช่หมวดหมู่ข้างต้น', icon: 'more-horizontal', color: '#64748b' }
          ]
        },
        transactions: {
          income: [
            { description: 'รายได้จากลูกค้าใหม่ - บริษัท เอบีซี', amount: 15000, category: 'รายได้จากการขาย' },
            { description: 'รายได้จากการขายสินค้า - บริษัท เอ็กซ์วายจี', amount: 25000, category: 'รายได้จากการขาย' },
            { description: 'ค่าคอมมิชชันจากยอดขายเดือนมกราคม', amount: 10000, category: 'ค่าคอมมิชชัน' },
            { description: 'ดอกเบี้ยธนาคารเดือนมกราคม', amount: 2500, category: 'ดอกเบี้ยธนาคาร' },
            { description: 'ค่าเช่าออฟฟิศเดือนมกราคม', amount: 8000, category: 'รายได้จากเช่า' },
            { description: 'รายได้จากลูกค้าเก่า - บริษัท แอลเอ็มเอ็น', amount: 18000, category: 'รายได้จากการขาย' },
            { description: 'ค่าคอมมิชชันจากยอดขายเดือนกุมภาพันธ์', amount: 12000, category: 'ค่าคอมมิชชัน' },
            { description: 'รายได้อื่นๆ - ค่าบริการเสริม', amount: 3000, category: 'รายได้อื่นๆ' }
          ],
          expense: [
            { description: 'ซื้อวัสดุสำนักงาน', amount: 5000, category: 'ค่าใช้จ่ายทั่วไป' },
            { description: 'ค่าเช่าสำนักงานเดือนมกราคม', amount: 12000, category: 'ค่าใช้จ่ายสำนักงาน' },
            { description: 'เงินเดือนพนักงานเดือนมกราคม', amount: 55000, category: 'เงินเดือนพนักงาน' },
            { description: 'ค่าโฆษณาออนไลน์เดือนมกราคม', amount: 8000, category: 'ค่าใช้จ่ายการตลาด' },
            { description: 'ค่าน้ำมันรถเดือนมกราคม', amount: 3500, category: 'ค่าใช้จ่ายยานพาหนะ' },
            { description: 'ค่าไฟฟ้า-น้ำเดือนมกราคม', amount: 4500, category: 'ค่าไฟฟ้า-น้ำ' },
            { description: 'ค่าอาหารรับรองลูกค้า', amount: 2200, category: 'ค่าอาหารและเครื่องดื่ม' },
            { description: 'ค่าซ่อมคอมพิวเตอร์', amount: 1500, category: 'ค่าซ่อมแซมและบำรุงรักษา' },
            { description: 'ภาษีเงินได้นิติบุคคลเดือนมกราคม', amount: 3500, category: 'ภาษีและค่าธรรมเนียม' },
            { description: 'ค่าเช่าสำนักงานเดือนกุมภาพันธ์', amount: 12000, category: 'ค่าใช้จ่ายสำนักงาน' }
          ]
        }
      }
      
      setSampleDataPreview(previewData)
    } catch (error) {
      console.error('Preview error:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลตัวอย่างได้",
        variant: "destructive",
      })
    } finally {
      setIsLoadingPreview(false)
    }
  }

  const getCategoryIcon = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      'trending-up': TrendingUp,
      'percent': Percent,
      'banknote': Banknote,
      'home': Home,
      'more-horizontal': MoreHorizontal,
      'shopping-cart': ShoppingCart,
      'building': Building,
      'users': Users,
      'megaphone': Megaphone,
      'car': Car,
      'zap': Zap,
      'utensils': Utensils,
      'wrench': Wrench,
      'file-text': FileText
    }
    const IconComponent = iconMap[iconName] || Database
    return <IconComponent className="h-4 w-4" />
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
      {/* Action Status */}
      {lastAction && (
        <Card className={`border-l-4 ${
          lastAction.status === 'success' 
            ? 'border-green-500 bg-green-50' 
            : 'border-red-500 bg-red-50'
        }`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              {lastAction.status === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <div>
                <p className={`font-medium ${
                  lastAction.status === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {lastAction.type === 'reset' ? 'การรีเซ็ตข้อมูล' : 'การโหลดข้อมูลตัวอย่าง'}
                </p>
                <p className={`text-sm ${
                  lastAction.status === 'success' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {lastAction.message}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reset Data */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              ล้างข้อมูลทั้งหมด
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-red-700">
              ลบข้อมูลทั้งหมดในระบบ (ทีม, สมาชิก, ธุรกรรม, เงินเดือน, โบนัส, ค่าคอมมิชชัน, หมวดหมู่)
            </p>
            <div className="space-y-2">
              <Badge variant="destructive" className="text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                การดำเนินการนี้ไม่สามารถย้อนกลับได้
              </Badge>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  disabled={isResetting || isLoadingSample}
                >
                  {isResetting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      กำลังล้างข้อมูล...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      ล้างข้อมูลทั้งหมด
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-red-800">
                    ⚠️ ยืนยันการล้างข้อมูลทั้งหมด
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-red-700">
                    คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลทั้งหมดในระบบ? 
                    การดำเนินการนี้จะลบ:
                    <ul className="mt-2 list-disc list-inside text-sm">
                      <li>ทีมทั้งหมด</li>
                      <li>สมาชิกทั้งหมด</li>
                      <li>ข้อมูลเงินเดือนทั้งหมด</li>
                      <li>ข้อมูลโบนัสทั้งหมด</li>
                      <li>ข้อมูลค่าคอมมิชชันทั้งหมด</li>
                      <li>ข้อมูลลูกค้าทั้งหมด</li>
                      <li>ข้อมูลธุรกรรมทั้งหมด</li>
                      <li>หมวดหมู่ทั้งหมด</li>
                    </ul>
                    <strong className="text-red-800">การดำเนินการนี้ไม่สามารถย้อนกลับได้!</strong>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleResetData}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    ยืนยันการล้างข้อมูล
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* Load Sample Data */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <Download className="h-5 w-5" />
              โหลดข้อมูลตัวอย่าง
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-green-700">
              โหลดข้อมูลตัวอย่างเพื่อทดสอบระบบ (ทีม, สมาชิก, ธุรกรรม, หมวดหมู่, ข้อมูลค่าตอบแทน)
            </p>
            <div className="space-y-2">
              <Badge variant="secondary" className="text-xs">
                <Database className="h-3 w-3 mr-1" />
                สร้างข้อมูลตัวอย่าง: 3 ทีม, 2 สมาชิก, 5 หมวดหมู่รายได้, 10 หมวดหมู่รายจ่าย, 8 รายการรายรับ, 10+ รายการรายจ่าย
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1 border-green-300 text-green-700 hover:bg-green-50"
                onClick={handleLoadSampleData}
                disabled={isResetting || isLoadingSample}
              >
                {isLoadingSample ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    กำลังโหลด...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    โหลดข้อมูล
                  </>
                )}
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handlePreviewSampleData}
                disabled={isLoadingPreview || isResetting || isLoadingSample}
              >
                {isLoadingPreview ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Database className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sample Data Preview */}
      {sampleDataPreview && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <Database className="h-5 w-5" />
              ตัวอย่างข้อมูลที่จะถูกสร้าง
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="categories" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="categories">หมวดหมู่</TabsTrigger>
                <TabsTrigger value="transactions">รายการธุรกรรม</TabsTrigger>
              </TabsList>
              
              <TabsContent value="categories" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Income Categories */}
                  <div>
                    <h4 className="font-medium text-green-700 mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      หมวดหมู่รายได้ ({sampleDataPreview.categories.income.length})
                    </h4>
                    <div className="space-y-2">
                      {sampleDataPreview.categories.income.map((category: any, index: number) => (
                        <div key={index} className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                            style={{ backgroundColor: category.color }}
                          >
                            {getCategoryIcon(category.icon)}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm text-green-800">{category.name}</p>
                            <p className="text-xs text-green-600">{category.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Expense Categories */}
                  <div>
                    <h4 className="font-medium text-red-700 mb-3 flex items-center gap-2">
                      <TrendingDown className="h-4 w-4" />
                      หมวดหมู่รายจ่าย ({sampleDataPreview.categories.expense.length})
                    </h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {sampleDataPreview.categories.expense.map((category: any, index: number) => (
                        <div key={index} className="flex items-center gap-3 p-2 bg-red-50 rounded-lg">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                            style={{ backgroundColor: category.color }}
                          >
                            {getCategoryIcon(category.icon)}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm text-red-800">{category.name}</p>
                            <p className="text-xs text-red-600">{category.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="transactions" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Income Transactions */}
                  <div>
                    <h4 className="font-medium text-green-700 mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      รายการรายรับ ({sampleDataPreview.transactions.income.length})
                    </h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {sampleDataPreview.transactions.income.map((transaction: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-sm text-green-800">{transaction.description}</p>
                            <p className="text-xs text-green-600">{transaction.category}</p>
                          </div>
                          <span className="font-bold text-green-700">
                            +฿{transaction.amount.toLocaleString()}
                          </span>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-green-200">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-green-700">รวมรายรับ</span>
                          <span className="font-bold text-green-700">
                            +฿{sampleDataPreview.transactions.income.reduce((sum: number, t: any) => sum + t.amount, 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expense Transactions */}
                  <div>
                    <h4 className="font-medium text-red-700 mb-3 flex items-center gap-2">
                      <TrendingDown className="h-4 w-4" />
                      รายการรายจ่าย ({sampleDataPreview.transactions.expense.length})
                    </h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {sampleDataPreview.transactions.expense.map((transaction: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-sm text-red-800">{transaction.description}</p>
                            <p className="text-xs text-red-600">{transaction.category}</p>
                          </div>
                          <span className="font-bold text-red-700">
                            -฿{transaction.amount.toLocaleString()}
                          </span>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-red-200">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-red-700">รวมรายจ่าย</span>
                          <span className="font-bold text-red-700">
                            -฿{sampleDataPreview.transactions.expense.reduce((sum: number, t: any) => sum + t.amount, 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Summary */}
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-blue-700">สรุปยอดเงินสุทธิ</span>
                    <span className="font-bold text-lg text-blue-800">
                      ฿{(sampleDataPreview.transactions.income.reduce((sum: number, t: any) => sum + t.amount, 0) - 
                          sampleDataPreview.transactions.expense.reduce((sum: number, t: any) => sum + t.amount, 0)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <Database className="h-5 w-5" />
            คำแนะนำการใช้งาน
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-blue-700 space-y-2">
            <p>
              <strong>การล้างข้อมูล:</strong> จะลบข้อมูลทั้งหมดและป้องกันไม่ให้ข้อมูลตัวอย่างโหลดโดยอัตโนมัติ
            </p>
            <p>
              <strong>การโหลดข้อมูลตัวอย่าง:</strong> จะสร้างข้อมูลตัวอย่างสำหรับการทดสอบระบบ ประกอบด้วย:
            </p>
            <ul className="ml-4 list-disc list-inside space-y-1 text-xs">
              <li>หมวดหมู่รายได้: 5 หมวดหมู่ (การขาย, ค่าคอมมิชชัน, ดอกเบี้ยธนาคาร, รายได้จากเช่า, อื่นๆ)</li>
              <li>หมวดหมู่รายจ่าย: 10 หมวดหมู่ (ค่าใช้จ่ายทั่วไป, สำนักงาน, เงินเดือน, การตลาด, ยานพาหนะ, ไฟฟ้า-น้ำ, อาหาร, ซ่อมแซม, ภาษี, อื่นๆ)</li>
              <li>รายการรายรับ: 8 รายการ รวมมูลค่า ฿93,500</li>
              <li>รายการรายจ่าย: 10+ รายการ รวมมูลค่า ฿109,200</li>
              <li>ข้อมูลทีม: 3 ทีม (การตลาด, ขาย, บริการลูกค้า)</li>
              <li>ข้อมูลสมาชิก: 2 สมาชิกพร้อมข้อมูลค่าตอบแทน</li>
            </ul>
            <p>
              <strong>การแก้ไขปัญหา:</strong> หากข้อมูลที่ลบกลับมาปรากฏอีก ให้ลองล้างข้อมูลแล้วโหลดข้อมูลตัวอย่างใหม่
            </p>
          </div>
        </CardContent>
      </Card>
      </div>
    </ErrorBoundary>
  )
}