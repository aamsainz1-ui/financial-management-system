'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  UserPlus, 
  Phone, 
  DollarSign, 
  Eye,
  Building2,
  Calendar,
  Target,
  TrendingUp
} from 'lucide-react'
import { api } from '@/lib/api'
import { dataSyncManager } from '@/lib/data-sync'

interface Member {
  id: string
  name: string
  phone: string
  bankName?: string
  bankAccount?: string
  bankBranch?: string
  salary: number
  teamId: string
  team?: {
    id: string
    name: string
  }
  createdAt: string
}

interface Team {
  id: string
  name: string
  description: string
  leader: string
  budget: number
  color: string
  createdAt: string
  updatedAt: string
  members: Member[]
  transactions: any[]
}

export function TeamManagement() {
  const { toast } = useToast()
  
  const [teams, setTeams] = useState<Team[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false)
  const [isTeamDetailDialogOpen, setIsTeamDetailDialogOpen] = useState(false)
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false)
  
  // Team form state
  const [teamForm, setTeamForm] = useState({
    name: '',
    description: '',
    leader: '',
    budget: '',
    color: 'blue'
  })
  
  // Member form state
  const [memberForm, setMemberForm] = useState({
    name: '',
    phone: '',
    bankName: '',
    bankAccount: '',
    bankBranch: '',
    salary: '',
    teamId: ''
  })
  
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null)
  const [deletingTeamId, setDeletingTeamId] = useState<string | null>(null)

  const colors = [
    { value: 'blue', label: 'น้ำเงิน', class: 'bg-blue-500' },
    { value: 'green', label: 'เขียว', class: 'bg-green-500' },
    { value: 'purple', label: 'ม่วง', class: 'bg-purple-500' },
    { value: 'red', label: 'แดง', class: 'bg-red-500' },
    { value: 'yellow', label: 'เหลือง', class: 'bg-yellow-500' },
    { value: 'pink', label: 'ชมพู', class: 'bg-pink-500' }
  ]

  useEffect(() => {
    fetchData()
    
    // Subscribe to data changes
    const unsubscribeTeams = dataSyncManager.subscribe('teams', fetchData)
    const unsubscribeMembers = dataSyncManager.subscribe('members', fetchData)
    
    // Add visibility change listener to refresh data when user returns to tab
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Team Management page became visible, refreshing data')
        fetchData()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      unsubscribeTeams()
      unsubscribeMembers()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const fetchData = async () => {
    try {
      console.log('Fetching teams and members data...')
      const [teamsData, membersData] = await Promise.all([
        api.teams.getAll(),
        api.members.getAll()
      ])
      
      console.log('Fetched teams:', teamsData.length)
      console.log('Fetched members:', membersData.length)
      
      setTeams(teamsData)
      setMembers(membersData)
      
      // Also update memory storage directly if needed
      if (teamsData.length > 0 || membersData.length > 0) {
        console.log('Data fetched successfully, updating local state')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลได้",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTeam = async () => {
    if (!teamForm.name) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบ",
        description: "ชื่อทีมเป็นข้อมูลที่จำเป็น",
        variant: "destructive",
      })
      return
    }

    try {
      const teamData = {
        ...teamForm,
        budget: parseInt(teamForm.budget) || 0
      }

      if (editingTeam) {
        await api.teams.update(editingTeam.id, teamData)
        toast({
          title: "แก้ไขทีมสำเร็จ",
          description: `อัพเดทข้อมูลทีม "${teamForm.name}" เรียบร้อยแล้ว`,
        })
      } else {
        await api.teams.create(teamData)
        toast({
          title: "สร้างทีมสำเร็จ",
          description: `สร้างทีม "${teamForm.name}" เรียบร้อยแล้ว`,
        })
      }
      
      // Force data refresh and notify other components
      await fetchData()
      dataSyncManager.markChanged('teams')
      setIsTeamDialogOpen(false)
      resetTeamForm()
    } catch (error) {
      console.error('Error saving team:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อมูลทีมได้",
        variant: "destructive",
      })
    }
  }

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team)
    setTeamForm({
      name: team.name,
      description: team.description,
      leader: team.leader,
      budget: team.budget.toString(),
      color: team.color
    })
    setIsTeamDialogOpen(true)
  }

  const handleDeleteTeam = async (id: string) => {
    // 乐观更新：立即从本地状态中移除团队
    const teamToDelete = teams.find(t => t.id === id)
    if (!teamToDelete) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่พบทีมที่ต้องการลบ",
        variant: "destructive",
      })
      return
    }

    // 立即更新UI
    setTeams(prevTeams => prevTeams.filter(team => team.id !== id))
    
    // 显示成功消息（乐观）
    toast({
      title: "ลบทีมสำเร็จ",
      description: `ลบทีม "${teamToDelete.name}" เรียบร้อยแล้ว`,
    })

    setDeletingTeamId(id)
    try {
      await api.teams.delete(id)
      
      // Notify other components of data change
      dataSyncManager.markChanged('teams')
      
      // 重新获取数据以确保同步
      await fetchData()
      
    } catch (error) {
      console.error('Error deleting team:', error)
      
      // 回滚：恢复团队到列表中
      setTeams(prevTeams => [...prevTeams, teamToDelete])
      
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบทีมได้ กำลัง恢复ข้อมูล",
        variant: "destructive",
      })
      
      // 重新获取数据以确保状态一致
      await fetchData()
    } finally {
      setDeletingTeamId(null)
    }
  }

  const handleViewTeamDetails = (team: Team) => {
    setSelectedTeam(team)
    setIsTeamDetailDialogOpen(true)
  }

  const handleCreateMember = async () => {
    if (!memberForm.name || !memberForm.phone || !memberForm.salary || !memberForm.teamId) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบ",
        description: "กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน",
        variant: "destructive",
      })
      return
    }

    try {
      const memberData = {
        ...memberForm,
        salary: parseInt(memberForm.salary) || 0
      }
      
      if (editingMember) {
        await api.members.update(editingMember.id, memberData)
        toast({
          title: "แก้ไขสมาชิกสำเร็จ",
          description: `อัพเดทข้อมูลสมาชิก "${memberForm.name}" เรียบร้อยแล้ว`,
        })
      } else {
        await api.members.create(memberData)
        toast({
          title: "เพิ่มสมาชิกสำเร็จ",
          description: `เพิ่มสมาชิก "${memberForm.name}" เรียบร้อยแล้ว`,
        })
      }
      
      // Force data refresh and notify other components
      await fetchData()
      dataSyncManager.markChanged('members')
      setIsMemberDialogOpen(false)
      resetMemberForm()
    } catch (error) {
      console.error('Error saving member:', error)
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกข้อมูลสมาชิกได้",
        variant: "destructive",
      })
    }
  }

  const handleEditMember = (member: Member) => {
    setEditingMember(member)
    setMemberForm({
      name: member.name,
      phone: member.phone,
      bankName: member.bankName || '',
      bankAccount: member.bankAccount || '',
      bankBranch: member.bankBranch || '',
      salary: member.salary.toString(),
      teamId: member.teamId
    })
    setIsMemberDialogOpen(true)
  }

  const handleDeleteMember = async (id: string) => {
    // 乐观更新：立即从本地状态中移除成员
    const memberToDelete = members.find(m => m.id === id)
    if (!memberToDelete) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่พบสมาชิกที่ต้องการลบ",
        variant: "destructive",
      })
      return
    }

    // 立即更新UI
    setMembers(prevMembers => prevMembers.filter(member => member.id !== id))
    
    // 显示成功消息（乐观）
    toast({
      title: "ลบสมาชิกสำเร็จ",
      description: `ลบสมาชิก "${memberToDelete.name}" เรียบร้อยแล้ว`,
    })

    setDeletingMemberId(id)
    try {
      console.log('Deleting member with ID:', id)
      const response = await api.members.delete(id)
      console.log('Delete response:', response)
      
      // Notify other components of data change
      dataSyncManager.markChanged('members')
      
      // 重新获取数据以确保同步
      await fetchData()
      
    } catch (error) {
      console.error('Error deleting member:', error)
      
      // 回滚：恢复成员到列表中
      setMembers(prevMembers => [...prevMembers, memberToDelete])
      
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบสมาชิกได้ กำลัง恢复ข้อมูล",
        variant: "destructive",
      })
      
      // 重新获取数据以确保状态一致
      await fetchData()
    } finally {
      setDeletingMemberId(null)
    }
  }

  const resetTeamForm = () => {
    setTeamForm({
      name: '',
      description: '',
      leader: '',
      budget: '',
      color: 'blue'
    })
    setEditingTeam(null)
  }

  const resetMemberForm = () => {
    setMemberForm({
      name: '',
      phone: '',
      bankName: '',
      bankAccount: '',
      bankBranch: '',
      salary: '',
      teamId: ''
    })
    setEditingMember(null)
  }

  const getTeamMembers = (teamId: string) => {
    return members.filter(member => member.teamId === teamId)
  }

  const getTeamColor = (color: string) => {
    const colorMap: { [key: string]: string } = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      red: 'bg-red-100 text-red-800 border-red-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      pink: 'bg-pink-100 text-pink-800 border-pink-200'
    }
    return colorMap[color] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">กำลังโหลด...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">จัดการทีม</h1>
          <p className="text-gray-600 mt-2">จัดการทีมและสมาชิกในองค์กรของคุณ</p>
        </div>
        <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetTeamForm(); }}>
              <Plus className="h-4 w-4 mr-2" />
              สร้างทีมใหม่
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTeam ? 'แก้ไขข้อมูลทีม' : 'สร้างทีมใหม่'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="team-name">ชื่อทีม *</Label>
                <Input
                  id="team-name"
                  value={teamForm.name}
                  onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                  placeholder="เช่น ทีมการตลาด"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="team-description">รายละเอียดทีม</Label>
                <Textarea
                  id="team-description"
                  value={teamForm.description}
                  onChange={(e) => setTeamForm({ ...teamForm, description: e.target.value })}
                  placeholder="อธิบายความรับผิดชอบของทีม"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="team-leader">หัวหน้าทีม</Label>
                <Input
                  id="team-leader"
                  value={teamForm.leader}
                  onChange={(e) => setTeamForm({ ...teamForm, leader: e.target.value })}
                  placeholder="ชื่อหัวหน้าทีม"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="team-budget">งบประมาณ</Label>
                <Input
                  id="team-budget"
                  type="number"
                  value={teamForm.budget}
                  onChange={(e) => setTeamForm({ ...teamForm, budget: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="team-color">สีทีม</Label>
                <Select value={teamForm.color} onValueChange={(value) => setTeamForm({ ...teamForm, color: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกสีทีม" />
                  </SelectTrigger>
                  <SelectContent>
                    {colors.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded ${color.class}`}></div>
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateTeam} className="w-full">
                {editingTeam ? 'บันทึกการแก้ไข' : 'สร้างทีม'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="teams" className="space-y-4">
        <TabsList>
          <TabsTrigger value="teams">จัดการทีม</TabsTrigger>
          <TabsTrigger value="members">จัดการสมาชิก</TabsTrigger>
        </TabsList>

        <TabsContent value="teams" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => {
              const teamMembers = getTeamMembers(team.id)
              return (
                <Card key={team.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          team.color === 'blue' ? 'bg-blue-500' :
                          team.color === 'green' ? 'bg-green-500' :
                          team.color === 'purple' ? 'bg-purple-500' :
                          team.color === 'red' ? 'bg-red-500' :
                          team.color === 'yellow' ? 'bg-yellow-500' :
                          'bg-pink-500'
                        }`}></div>
                        <CardTitle className="text-lg">{team.name}</CardTitle>
                      </div>
                      <Badge className={getTeamColor(team.color)}>
                        {teamMembers.length} คน
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {team.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{team.description}</p>
                    )}
                    
                    {team.leader && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-700">หัวหน้า: {team.leader}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-700">งบ: ฿{(team.budget || 0).toLocaleString()}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-500">
                        สร้าง: {new Date(team.createdAt).toLocaleDateString('th-TH')} {new Date(team.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleViewTeamDetails(team)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        ดูรายละเอียด
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTeam(team)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>ยืนยันการลบทีม</AlertDialogTitle>
                            <AlertDialogDescription>
                              คุณต้องการลบทีม "{team.name}" ใช่หรือไม่?
                              การดำเนินการนี้ไม่สามารถย้อนกลับได้
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                            <Button 
                              onClick={() => handleDeleteTeam(team.id)}
                              className="bg-red-600 hover:bg-red-700"
                              disabled={deletingTeamId === team.id}
                            >
                              {deletingTeamId === team.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  กำลังลบ...
                                </>
                              ) : (
                                'ลบทีม'
                              )}
                            </Button>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
            
            {teams.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">ยังไม่มีทีมในระบบ</p>
                <p className="text-sm text-gray-400 mt-2">คลิก "สร้างทีมใหม่" เพื่อเริ่มสร้างทีม</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">รายชื่อสมาชิกทั้งหมด ({members.length} คน)</h2>
            <Dialog open={isMemberDialogOpen} onOpenChange={setIsMemberDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={() => { resetMemberForm(); }}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  เพิ่มสมาชิก
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingMember ? 'แก้ไขข้อมูลสมาชิก' : 'เพิ่มสมาชิกใหม่'}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="member-name">ชื่อ-นามสกุล *</Label>
                    <Input
                      id="member-name"
                      value={memberForm.name}
                      onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                      placeholder="กรอกชื่อ-นามสกุล"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="member-phone">เบอร์โทรศัพท์ *</Label>
                    <Input
                      id="member-phone"
                      value={memberForm.phone}
                      onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                      placeholder="กรอกเบอร์โทรศัพท์"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="member-bank-name">ชื่อธนาคาร</Label>
                    <Input
                      id="member-bank-name"
                      value={memberForm.bankName}
                      onChange={(e) => setMemberForm({ ...memberForm, bankName: e.target.value })}
                      placeholder="เช่น ธนาคารไทยพาณิชย์"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="member-bank-account">เลขบัญชีธนาคาร</Label>
                    <Input
                      id="member-bank-account"
                      value={memberForm.bankAccount}
                      onChange={(e) => setMemberForm({ ...memberForm, bankAccount: e.target.value })}
                      placeholder="กรอกเลขบัญชีธนาคาร"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="member-bank-branch">สาขาธนาคาร</Label>
                    <Input
                      id="member-bank-branch"
                      value={memberForm.bankBranch}
                      onChange={(e) => setMemberForm({ ...memberForm, bankBranch: e.target.value })}
                      placeholder="เช่น สาขาสยาม"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="member-salary">เงินเดือน *</Label>
                    <Input
                      id="member-salary"
                      type="number"
                      value={memberForm.salary}
                      onChange={(e) => setMemberForm({ ...memberForm, salary: e.target.value })}
                      placeholder="กรอกเงินเดือน"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="member-team">ทีม *</Label>
                    <Select value={memberForm.teamId} onValueChange={(value) => setMemberForm({ ...memberForm, teamId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกทีม" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button onClick={handleCreateMember} className="w-full mt-4">
                  {editingMember ? 'บันทึกการแก้ไข' : 'เพิ่มสมาชิก'}
                </Button>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <Card key={member.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" />
                        <AvatarFallback>
                          {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Phone className="h-3 w-3" />
                          {member.phone}
                        </div>
                        {member.bankName && (
                          <div className="text-xs text-gray-500 mt-1">
                            🏦 {member.bankName} {member.bankAccount && `(${member.bankAccount})`}
                          </div>
                        )}
                        <Badge variant="outline" className="text-xs mt-1">
                          {member.team?.name || 'ไม่ระบุทีม'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                        <DollarSign className="h-3 w-3" />
                        {(member.salary || 0).toLocaleString()}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700"
                          onClick={() => handleEditMember(member)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>ยืนยันการลบสมาชิก</AlertDialogTitle>
                              <AlertDialogDescription>
                                คุณต้องการลบสมาชิก "{member.name}" ใช่หรือไม่?
                                การดำเนินการนี้ไม่สามารถย้อนกลับได้
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                              <Button 
                                onClick={() => handleDeleteMember(member.id)}
                                className="bg-red-600 hover:bg-red-700"
                                disabled={deletingMemberId === member.id}
                              >
                                {deletingMemberId === member.id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    กำลังลบ...
                                  </>
                                ) : (
                                  'ลบสมาชิก'
                                )}
                              </Button>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {members.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">ยังไม่มีสมาชิกในระบบ</p>
                <p className="text-sm text-gray-400 mt-2">คลิก "เพิ่มสมาชิก" เพื่อเริ่มเพิ่มสมาชิก</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Team Detail Dialog */}
      <Dialog open={isTeamDetailDialogOpen} onOpenChange={setIsTeamDetailDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              รายละเอียดทีม: {selectedTeam?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedTeam && (
            <div className="space-y-6">
              {/* Team Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">ข้อมูลทั่วไป</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-sm text-gray-500">ชื่อทีม</Label>
                      <p className="font-medium">{selectedTeam.name}</p>
                    </div>
                    {selectedTeam.description && (
                      <div>
                        <Label className="text-sm text-gray-500">รายละเอียด</Label>
                        <p className="text-sm">{selectedTeam.description}</p>
                      </div>
                    )}
                    {selectedTeam.leader && (
                      <div>
                        <Label className="text-sm text-gray-500">หัวหน้าทีม</Label>
                        <p className="font-medium">{selectedTeam.leader}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-sm text-gray-500">งบประมาณ</Label>
                      <p className="font-medium text-green-600">฿{(selectedTeam.budget || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">สีทีม</Label>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${
                          selectedTeam.color === 'blue' ? 'bg-blue-500' :
                          selectedTeam.color === 'green' ? 'bg-green-500' :
                          selectedTeam.color === 'purple' ? 'bg-purple-500' :
                          selectedTeam.color === 'red' ? 'bg-red-500' :
                          selectedTeam.color === 'yellow' ? 'bg-yellow-500' :
                          'bg-pink-500'
                        }`}></div>
                        <span className="text-sm">
                          {colors.find(c => c.value === selectedTeam.color)?.label}
                        </span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500">วันที่สร้าง</Label>
                      <p className="text-sm">{new Date(selectedTeam.createdAt).toLocaleDateString('th-TH')} {new Date(selectedTeam.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">สถิติทีม</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">จำนวนสมาชิก</span>
                      <Badge className={getTeamColor(selectedTeam.color)}>
                        {getTeamMembers(selectedTeam.id).length} คน
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">รวมเงินเดือน</span>
                      <span className="font-medium">
                        ฿{getTeamMembers(selectedTeam.id).reduce((sum, member) => sum + (member.salary || 0), 0).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">เงินเดือนเฉลี่ย</span>
                      <span className="font-medium">
                        ฿{getTeamMembers(selectedTeam.id).length > 0 
                          ? Math.round(getTeamMembers(selectedTeam.id).reduce((sum, member) => sum + (member.salary || 0), 0) / getTeamMembers(selectedTeam.id).length).toLocaleString()
                          : 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Team Members */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    สมาชิกในทีม ({getTeamMembers(selectedTeam.id).length} คน)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {getTeamMembers(selectedTeam.id).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {getTeamMembers(selectedTeam.id).map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src="" />
                              <AvatarFallback className="text-xs">
                                {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{member.name}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <Phone className="h-3 w-3" />
                                {member.phone}
                              </div>
                              {member.bankName && (
                                <div className="text-xs text-gray-500">
                                  🏦 {member.bankName}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                              <DollarSign className="h-3 w-3" />
                              {(member.salary || 0).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">ยังไม่มีสมาชิกในทีมนี้</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}