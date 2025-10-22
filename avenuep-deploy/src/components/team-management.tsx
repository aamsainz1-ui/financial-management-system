'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Users, Plus, Edit, Trash2, UserPlus, Settings } from 'lucide-react'

export function TeamManagement() {
  const [teams, setTeams] = useState([
    {
      id: 1,
      name: 'ทีมการตลาด',
      description: 'รับผิดชอบการทำการตลาดและโฆษณา',
      leader: 'สมชาย ใจดี',
      members: 3,
      budget: 50000,
      color: 'blue'
    },
    {
      id: 2,
      name: 'ทีมขาย',
      description: 'รับผิดชอบการขายสินค้าและบริการ',
      leader: 'สมศรี รักดี',
      members: 5,
      budget: 75000,
      color: 'green'
    },
    {
      id: 3,
      name: 'ทีม IT',
      description: 'รับผิดชอบระบบคอมพิวเตอร์และเทคโนโลยี',
      leader: 'วิทยา เทคโน',
      members: 2,
      budget: 30000,
      color: 'purple'
    }
  ])

  const [members, setMembers] = useState([
    {
      id: 1,
      name: 'สมชาย ใจดี',
      email: 'somchai@example.com',
      role: 'หัวหน้าทีม',
      team: 'ทีมการตลาด',
      status: 'active'
    },
    {
      id: 2,
      name: 'สมศรี รักดี',
      email: 'somsri@example.com',
      role: 'หัวหน้าทีม',
      team: 'ทีมขาย',
      status: 'active'
    },
    {
      id: 3,
      name: 'วิทยา เทคโน',
      email: 'vitya@example.com',
      role: 'หัวหน้าทีม',
      team: 'ทีม IT',
      status: 'active'
    },
    {
      id: 4,
      name: 'มานี มีใจ',
      email: 'manee@example.com',
      role: 'สมาชิก',
      team: 'ทีมการตลาด',
      status: 'active'
    },
    {
      id: 5,
      name: 'ประสิทธิ์ สุขใจ',
      email: 'prasit@example.com',
      role: 'สมาชิก',
      team: 'ทีมขาย',
      status: 'active'
    }
  ])

  const [newTeam, setNewTeam] = useState({
    name: '',
    description: '',
    leader: '',
    budget: ''
  })

  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: '',
    team: ''
  })

  const handleAddTeam = () => {
    if (newTeam.name && newTeam.description) {
      const team = {
        id: teams.length + 1,
        ...newTeam,
        members: 0,
        budget: parseInt(newTeam.budget) || 0,
        color: ['blue', 'green', 'purple', 'orange', 'red'][teams.length % 5]
      }
      setTeams([...teams, team])
      setNewTeam({ name: '', description: '', leader: '', budget: '' })
    }
  }

  const handleAddMember = () => {
    if (newMember.name && newMember.email && newMember.team) {
      const member = {
        id: members.length + 1,
        ...newMember,
        status: 'active'
      }
      setMembers([...members, member])
      setNewMember({ name: '', email: '', role: '', team: '' })
    }
  }

  const handleDeleteTeam = (id: number) => {
    setTeams(teams.filter(team => team.id !== id))
  }

  const handleDeleteMember = (id: number) => {
    setMembers(members.filter(member => member.id !== id))
  }

  const getTeamColor = (color: string) => {
    const colors: { [key: string]: string } = {
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      purple: 'bg-purple-100 text-purple-800',
      orange: 'bg-orange-100 text-orange-800',
      red: 'bg-red-100 text-red-800'
    }
    return colors[color] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">จัดการทีม</h1>
        <p className="text-gray-600 mt-2">จัดการทีมและสมาชิกในองค์กรของคุณ</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">ทีมทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">สมาชิกทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">งบประมาณรวม</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{teams.reduce((sum, team) => sum + team.budget, 0).toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">สมาชิกต่อทีม (เฉลี่ย)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams.length > 0 ? (members.length / teams.length).toFixed(1) : 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Teams Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            รายการทีม
          </CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                เพิ่มทีม
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>เพิ่มทีมใหม่</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="team-name">ชื่อทีม</Label>
                  <Input
                    id="team-name"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                    placeholder="เช่น ทีมการตลาด"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="team-description">คำอธิบาย</Label>
                  <Textarea
                    id="team-description"
                    value={newTeam.description}
                    onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                    placeholder="รายละเอียดเกี่ยวกับทีม..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="team-leader">หัวหน้าทีม</Label>
                  <Input
                    id="team-leader"
                    value={newTeam.leader}
                    onChange={(e) => setNewTeam({ ...newTeam, leader: e.target.value })}
                    placeholder="ชื่อหัวหน้าทีม"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="team-budget">งบประมาณ</Label>
                  <Input
                    id="team-budget"
                    type="number"
                    value={newTeam.budget}
                    onChange={(e) => setNewTeam({ ...newTeam, budget: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <Button onClick={handleAddTeam} className="w-full">
                  เพิ่มทีม
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teams.map((team) => (
              <div key={team.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${getTeamColor(team.color)}`}>
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{team.name}</h3>
                    <p className="text-sm text-gray-500">{team.description}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-gray-500">หัวหน้า: {team.leader}</span>
                      <span className="text-sm text-gray-500">สมาชิก: {team.members} คน</span>
                      <span className="text-sm text-gray-500">งบ: ฿{team.budget.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Members Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            สมาชิกทั้งหมด
          </CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                เพิ่มสมาชิก
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>เพิ่มสมาชิกใหม่</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="member-name">ชื่อ-นามสกุล</Label>
                  <Input
                    id="member-name"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    placeholder="ชื่อเต็ม"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="member-email">อีเมล</Label>
                  <Input
                    id="member-email"
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="member-role">ตำแหน่ง</Label>
                  <Select value={newMember.role} onValueChange={(value) => setNewMember({ ...newMember, role: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกตำแหน่ง" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="หัวหน้าทีม">หัวหน้าทีม</SelectItem>
                      <SelectItem value="รองหัวหน้าทีม">รองหัวหน้าทีม</SelectItem>
                      <SelectItem value="สมาชิก">สมาชิก</SelectItem>
                      <SelectItem value="พนักงานฝึกหัด">พนักงานฝึกหัด</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="member-team">ทีม</Label>
                  <Select value={newMember.team} onValueChange={(value) => setNewMember({ ...newMember, team: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกทีม" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.name}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddMember} className="w-full">
                  เพิ่มสมาชิก
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ชื่อ</TableHead>
                  <TableHead>อีเมล</TableHead>
                  <TableHead>ตำแหน่ง</TableHead>
                  <TableHead>ทีม</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.role}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{member.team}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                        {member.status === 'active' ? 'ใช้งาน' : 'ไม่ใช้งาน'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}