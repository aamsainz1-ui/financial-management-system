'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Trash2, RefreshCw, AlertTriangle, CheckCircle, Database, HardDrive } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ResetResult {
  success: boolean
  message: string
  timestamp?: string
  verification?: any
  error?: string
}

export function SystemReset() {
  const [isResetting, setIsResetting] = useState(false)
  const [resetResult, setResetResult] = useState<ResetResult | null>(null)
  const { toast } = useToast()

  const handleSystemReset = async () => {
    setIsResetting(true)
    setResetResult(null)
    
    try {
      console.log('🚀 Initiating system reset...')
      
      const response = await fetch('/api/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const result: ResetResult = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Reset failed')
      }
      
      setResetResult(result)
      
      // Show success toast
      toast({
        title: "รีเซ็ตระบบสำเร็จ",
        description: result.message,
      })
      
      // Refresh the page to update all components
      setTimeout(() => {
        window.location.reload()
      }, 2000)
      
    } catch (error) {
      console.error('❌ System reset error:', error)
      
      const errorResult: ResetResult = {
        success: false,
        error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาด',
        message: 'ไม่สามารถรีเซ็ตระบบได้'
      }
      
      setResetResult(errorResult)
      
      // Show error toast
      toast({
        title: "รีเซ็ตระบบล้มเหลว",
        description: errorResult.error,
        variant: "destructive",
      })
    } finally {
      setIsResetting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">รีเซ็ตระบบ</h1>
        <p className="text-gray-600 mt-2">ล้างข้อมูลทั้งหมดในระบบและเริ่มต้นใหม่</p>
      </div>

      {/* Warning Card */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            คำเตือน: การดำเนินการนี้ไม่สามารถย้อนกลับได้
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-200 bg-red-100">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              <strong>ข้อมูลทั้งหมดจะถูกลบถาวร:</strong>
              <ul className="mt-2 ml-4 list-disc space-y-1">
                <li>รายรับและรายจ่ายทั้งหมด</li>
                <li>ข้อมูลทีมและสมาชิกทั้งหมด</li>
                <li>ข้อมูลลูกค้าทั้งหมด</li>
                <li>ข้อมูลเงินเดือน โบนัส ค่าคอมมิชชันทั้งหมด</li>
                <li>หมวดหมู่ทั้งหมด</li>
                <li>ธุรกรรมทั้งหมด</li>
              </ul>
              <p className="mt-3 font-semibold">
                กรุณาสำรองข้อมูลที่สำคัญก่อนดำเนินการ!
              </p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Reset Action */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            ดำเนินการรีเซ็ตระบบ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <Database className="h-8 w-8 text-gray-600" />
                <div>
                  <p className="font-medium">ฐานข้อมูลหลัก</p>
                  <p className="text-sm text-gray-500">ล้างข้อมูลในตารางทั้งหมด</p>
                </div>
              </div>
              <Badge variant="outline">จะถูกลบ</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <HardDrive className="h-8 w-8 text-gray-600" />
                <div>
                  <p className="font-medium">Memory Storage</p>
                  <p className="text-sm text-gray-500">ล้างข้อมูลในหน่วยความจำชั่วคราว</p>
                </div>
              </div>
              <Badge variant="outline">จะถูกลบ</Badge>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="lg" 
                  className="w-full"
                  disabled={isResetting}
                >
                  {isResetting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      กำลังรีเซ็ตระบบ...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      รีเซ็ตระบบทั้งหมด
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    ยืนยันการรีเซ็ตระบบ
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-700">
                    <p className="mb-3">
                      คุณกำลังจะลบข้อมูลทั้งหมดในระบบ การดำเนินการนี้<strong>ไม่สามารถย้อนกลับได้</strong>
                    </p>
                    <p className="font-semibold text-red-600">
                      กรุณายืนยันว่าคุณต้องการดำเนินการต่อหรือไม่?
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleSystemReset}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isResetting ? 'กำลังดำเนินการ...' : 'ยืนยันการรีเซ็ต'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Reset Result */}
      {resetResult && (
        <Card className={resetResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${resetResult.success ? 'text-green-700' : 'text-red-700'}`}>
              {resetResult.success ? (
                <>
                  <CheckCircle className="h-5 w-5" />
                  รีเซ็ตระบบสำเร็จ
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5" />
                  รีเซ็ตระบบล้มเหลว
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Alert className={resetResult.success ? 'border-green-200 bg-green-100' : 'border-red-200 bg-red-100'}>
                {resetResult.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                <AlertDescription className={resetResult.success ? 'text-green-800' : 'text-red-800'}>
                  {resetResult.message}
                </AlertDescription>
              </Alert>
              
              {resetResult.timestamp && (
                <div className="text-sm text-gray-600">
                  <strong>เวลาดำเนินการ:</strong> {new Date(resetResult.timestamp).toLocaleString('th-TH')}
                </div>
              )}
              
              {resetResult.verification && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">ข้อมูลการตรวจสอบ:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700">Database:</p>
                      <pre className="bg-white p-2 rounded border text-xs overflow-auto">
                        {JSON.stringify(resetResult.verification.database, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Memory Storage:</p>
                      <pre className="bg-white p-2 rounded border text-xs overflow-auto">
                        {JSON.stringify(resetResult.verification.memory, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
              
              {resetResult.success && (
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  กำลังรีเฟรชหน้าเว็บ...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}