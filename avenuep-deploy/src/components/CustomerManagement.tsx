'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserPlus, Users, DollarSign, TrendingUp, Edit, Trash2, Plus } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  type: 'new' | 'deposit' | 'extension';
  initialAmount: number;
  teamId?: string;
  memberId?: string;
  status: 'active' | 'inactive' | 'blacklist';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  team?: { id: string; name: string };
  member?: { id: string; name: string };
  transactions?: CustomerTransaction[];
}

interface CustomerTransaction {
  id: string;
  customerId: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'extension';
  description?: string;
  date: string;
  createdAt: string;
  customer?: Customer;
}

interface Team {
  id: string;
  name: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
}

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [transactions, setTransactions] = useState<CustomerTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    type: 'new' as 'new' | 'deposit' | 'extension',
    initialAmount: 0,
    teamId: '',
    memberId: '',
    status: 'active' as 'active' | 'inactive' | 'blacklist',
    notes: ''
  });

  const [transactionData, setTransactionData] = useState({
    customerId: '',
    amount: 0,
    type: 'deposit' as 'deposit' | 'withdrawal' | 'extension',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [customersRes, teamsRes, membersRes, transactionsRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/teams'),
        fetch('/api/members'),
        fetch('/api/customers/transactions')
      ]);

      if (customersRes.ok) {
        const customersData = await customersRes.json();
        setCustomers(customersData);
      }

      if (teamsRes.ok) {
        const teamsData = await teamsRes.json();
        setTeams(teamsData);
      }

      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(membersData);
      }

      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json();
        setTransactions(transactionsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCustomer ? `/api/customers/${editingCustomer.id}` : '/api/customers';
      const method = editingCustomer ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        await fetchData();
        setIsAddDialogOpen(false);
        setEditingCustomer(null);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving customer:', error);
    }
  };

  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/customers/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData)
      });

      if (response.ok) {
        await fetchData();
        setIsTransactionDialogOpen(false);
        setTransactionData({
          customerId: '',
          amount: 0,
          type: 'deposit',
          description: ''
        });
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      type: customer.type,
      initialAmount: customer.initialAmount,
      teamId: customer.teamId || '',
      memberId: customer.memberId || '',
      status: customer.status,
      notes: customer.notes || ''
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('คุณแน่ใจว่าต้องการลบลูกค้านี้?')) {
      try {
        const response = await fetch(`/api/customers/${id}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          await fetchData();
        }
      } catch (error) {
        console.error('Error deleting customer:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      type: 'new',
      initialAmount: 0,
      teamId: '',
      memberId: '',
      status: 'active',
      notes: ''
    });
  };

  const getCustomerTypeLabel = (type: string) => {
    switch (type) {
      case 'new': return 'ลูกค้าใหม่';
      case 'deposit': return 'ลูกค้าฝาก';
      case 'extension': return 'ต่อยอด';
      default: return type;
    }
  };

  const getCustomerTypeColor = (type: string) => {
    switch (type) {
      case 'new': return 'bg-green-100 text-green-800';
      case 'deposit': return 'bg-blue-100 text-blue-800';
      case 'extension': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'blacklist': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'deposit': return 'ฝาก';
      case 'withdrawal': return 'ถอน';
      case 'extension': return 'ต่อยอด';
      default: return type;
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'deposit': return 'bg-green-100 text-green-800';
      case 'withdrawal': return 'bg-red-100 text-red-800';
      case 'extension': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">กำลังโหลด...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">จัดการลูกค้า</h1>
          <p className="text-muted-foreground">จัดการข้อมูลลูกค้า ฝาก-ถอน และการต่อยอด</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <DollarSign className="w-4 h-4 mr-2" />
                เพิ่มรายการ
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>เพิ่มรายการฝาก-ถอน-ต่อยอด</DialogTitle>
                <DialogDescription>
                  บันทึกรายการใหม่สำหรับลูกค้า
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleTransactionSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="customer">ลูกค้า</Label>
                  <Select
                    value={transactionData.customerId}
                    onValueChange={(value) => setTransactionData(prev => ({ ...prev, customerId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกลูกค้า" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="transactionType">ประเภทรายการ</Label>
                  <Select
                    value={transactionData.type}
                    onValueChange={(value: any) => setTransactionData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deposit">ฝาก</SelectItem>
                      <SelectItem value="withdrawal">ถอน</SelectItem>
                      <SelectItem value="extension">ต่อยอด</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">จำนวนเงิน</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={transactionData.amount}
                    onChange={(e) => setTransactionData(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">รายละเอียด</Label>
                  <Textarea
                    id="description"
                    value={transactionData.description}
                    onChange={(e) => setTransactionData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsTransactionDialogOpen(false)}>
                    ยกเลิก
                  </Button>
                  <Button type="submit">บันทึก</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditingCustomer(null); resetForm(); }}>
                <UserPlus className="w-4 h-4 mr-2" />
                เพิ่มลูกค้า
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingCustomer ? 'แก้ไขข้อมูลลูกค้า' : 'เพิ่มลูกค้าใหม่'}</DialogTitle>
                <DialogDescription>
                  {editingCustomer ? 'แก้ไขข้อมูลลูกค้าที่เลือก' : 'เพิ่มลูกค้าใหม่เข้าสู่ระบบ'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">ชื่อลูกค้า *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">อีเมล</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="type">ประเภทลูกค้า</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">ลูกค้าใหม่</SelectItem>
                        <SelectItem value="deposit">ลูกค้าฝาก</SelectItem>
                        <SelectItem value="extension">ต่อยอด</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">ที่อยู่</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="initialAmount">จำนวนเงินเริ่มต้น</Label>
                    <Input
                      id="initialAmount"
                      type="number"
                      value={formData.initialAmount}
                      onChange={(e) => setFormData(prev => ({ ...prev, initialAmount: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="teamId">ทีม</Label>
                    <Select
                      value={formData.teamId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, teamId: value }))}
                    >
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
                  <div>
                    <Label htmlFor="memberId">พนักงานผู้ดูแล</Label>
                    <Select
                      value={formData.memberId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, memberId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกพนักงาน" />
                      </SelectTrigger>
                      <SelectContent>
                        {members.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">สถานะ</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">ใช้งาน</SelectItem>
                        <SelectItem value="inactive">ไม่ใช้งาน</SelectItem>
                        <SelectItem value="blacklist">ระงับ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">บันทึกช่วยจำ</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    ยกเลิก
                  </Button>
                  <Button type="submit">{editingCustomer ? 'อัพเดต' : 'เพิ่มลูกค้า'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="customers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="customers">รายชื่อลูกค้า</TabsTrigger>
          <TabsTrigger value="transactions">รายการฝาก-ถอน</TabsTrigger>
        </TabsList>

        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>รายชื่อลูกค้าทั้งหมด</CardTitle>
              <CardDescription>
                จัดการข้อมูลลูกค้าทั้งหมดในระบบ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ชื่อลูกค้า</TableHead>
                    <TableHead>ประเภท</TableHead>
                    <TableHead>เบอร์โทร</TableHead>
                    <TableHead>ทีม</TableHead>
                    <TableHead>พนักงานดูแล</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead>จำนวนเงิน</TableHead>
                    <TableHead>จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          {customer.email && (
                            <div className="text-sm text-muted-foreground">{customer.email}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getCustomerTypeColor(customer.type)}>
                          {getCustomerTypeLabel(customer.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>{customer.phone || '-'}</TableCell>
                      <TableCell>{customer.team?.name || '-'}</TableCell>
                      <TableCell>{customer.member?.name || '-'}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(customer.status)}>
                          {customer.status === 'active' ? 'ใช้งาน' : 
                           customer.status === 'inactive' ? 'ไม่ใช้งาน' : 'ระงับ'}
                        </Badge>
                      </TableCell>
                      <TableCell>฿{customer.initialAmount.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(customer)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(customer.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>รายการฝาก-ถอน-ต่อยอด</CardTitle>
              <CardDescription>
                ประวัติการทำรายการทั้งหมด
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>วันที่</TableHead>
                    <TableHead>ลูกค้า</TableHead>
                    <TableHead>ประเภทรายการ</TableHead>
                    <TableHead>จำนวนเงิน</TableHead>
                    <TableHead>รายละเอียด</TableHead>
                    <TableHead>ทีม</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {new Date(transaction.date).toLocaleDateString('th-TH')}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.customer?.name || 'ไม่ระบุ'}</div>
                          {transaction.customer?.team && (
                            <div className="text-sm text-muted-foreground">
                              {transaction.customer.team.name}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTransactionTypeColor(transaction.type)}>
                          {getTransactionTypeLabel(transaction.type)}
                        </Badge>
                      </TableCell>
                      <TableCell className={transaction.type === 'withdrawal' ? 'text-red-600' : 'text-green-600'}>
                        {transaction.type === 'withdrawal' ? '-' : '+'}
                        ฿{transaction.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>{transaction.description || '-'}</TableCell>
                      <TableCell>{transaction.customer?.team?.name || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}