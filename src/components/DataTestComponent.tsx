'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';

interface TestResult {
  function: string;
  status: 'success' | 'error' | 'pending';
  message: string;
  data?: any;
}

export default function DataTestComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [...prev, result]);
  };

  const resetAllData = async () => {
    try {
      const response = await fetch('/api/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        addTestResult({
          function: 'รีเซ็ตข้อมูล',
          status: 'success',
          message: 'รีเซ็ตข้อมูลทั้งหมดสำเร็จ'
        });
      } else {
        throw new Error('Failed to reset data');
      }
    } catch (error) {
      addTestResult({
        function: 'รีเซ็ตข้อมูล',
        status: 'error',
        message: 'ไม่สามารถรีเซ็ตข้อมูลได้'
      });
    }
  };

  const createTeams = async () => {
    try {
      const teams = [
        { name: 'ทีมขาย A', description: 'ทีมขายหลัก', leader: 'คุณสมชาย', budget: 50000, color: 'blue' },
        { name: 'ทีมขาย B', description: 'ทีมขายสนับสนุน', leader: 'คุณสมศรี', budget: 30000, color: 'green' },
        { name: 'ทีมการตลาด', description: 'ทีมส่งเสริมการขาย', leader: 'คุณสมหญิง', budget: 40000, color: 'purple' }
      ];

      for (const team of teams) {
        const response = await fetch('/api/teams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(team)
        });
        
        if (!response.ok) throw new Error(`Failed to create team: ${team.name}`);
      }

      addTestResult({
        function: 'สร้างทีม',
        status: 'success',
        message: 'สร้างทีมทั้งหมด 3 ทีมสำเร็จ',
        data: teams.length
      });
    } catch (error) {
      addTestResult({
        function: 'สร้างทีม',
        status: 'error',
        message: error instanceof Error ? error.message : 'ไม่สามารถสร้างทีมได้'
      });
    }
  };

  const createCategories = async () => {
    try {
      const categories = [
        { name: 'ค่าจ้าง', description: 'ค่าจ้างพนักงาน', type: 'expense', budget: 100000, color: 'red' },
        { name: 'ค่าเช่า', description: 'ค่าเช่าสำนักงาน', type: 'expense', budget: 20000, color: 'orange' },
        { name: 'ค่าสื่อสาร', description: 'ค่าโทรศัพท์และอินเทอร์เน็ต', type: 'expense', budget: 5000, color: 'yellow' },
        { name: 'ยอดขายสินค้า', description: 'รายได้จากการขายสินค้า', type: 'income', budget: 500000, color: 'green' },
        { name: 'ค่าบริการ', description: 'รายได้จากค่าบริการ', type: 'income', budget: 100000, color: 'blue' }
      ];

      for (const category of categories) {
        const response = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(category)
        });
        
        if (!response.ok) throw new Error(`Failed to create category: ${category.name}`);
      }

      addTestResult({
        function: 'สร้างหมวดหมู่',
        status: 'success',
        message: 'สร้างหมวดหมู่ทั้งหมด 5 หมวดหมู่สำเร็จ',
        data: categories.length
      });
    } catch (error) {
      addTestResult({
        function: 'สร้างหมวดหมู่',
        status: 'error',
        message: error instanceof Error ? error.message : 'ไม่สามารถสร้างหมวดหมู่ได้'
      });
    }
  };

  const createMembers = async () => {
    try {
      // Get teams first
      const teamsResponse = await fetch('/api/teams');
      const teams = await teamsResponse.json();
      
      const members = [
        { 
          name: 'สมชาย ใจดี', 
          email: 'somchai@example.com', 
          phone: '0812345678',
          bankName: 'ธนาคารไทยพาณิชย์',
          bankAccount: '1234567890',
          bankBranch: 'สาขาสยาม',
          role: 'หัวหน้าทีม', 
          position: 'Sales Manager', 
          department: 'Sales',
          salary: 30000,
          teamId: teams[0]?.id
        },
        { 
          name: 'สมศรี รักดี', 
          email: 'somsri@example.com', 
          phone: '0823456789',
          bankName: 'ธนาคารกรุงเทพ',
          bankAccount: '0987654321',
          bankBranch: 'สาขาเซ็นทรัล',
          role: 'พนักงานขาย', 
          position: 'Sales Staff', 
          department: 'Sales',
          salary: 20000,
          teamId: teams[1]?.id
        },
        { 
          name: 'สมหญิง งามดี', 
          email: 'somying@example.com', 
          phone: '0834567890',
          bankName: 'ธนาคารกสิกรไทย',
          bankAccount: '1122334455',
          bankBranch: 'สาขาเมกา',
          role: 'พนักงานการตลาด', 
          position: 'Marketing Staff', 
          department: 'Marketing',
          salary: 25000,
          teamId: teams[2]?.id
        }
      ];

      for (const member of members) {
        const response = await fetch('/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(member)
        });
        
        if (!response.ok) throw new Error(`Failed to create member: ${member.name}`);
      }

      addTestResult({
        function: 'สร้างสมาชิก',
        status: 'success',
        message: 'สร้างสมาชิกทั้งหมด 3 คนสำเร็จ',
        data: members.length
      });
    } catch (error) {
      addTestResult({
        function: 'สร้างสมาชิก',
        status: 'error',
        message: error instanceof Error ? error.message : 'ไม่สามารถสร้างสมาชิกได้'
      });
    }
  };

  const createTransactions = async () => {
    try {
      // Get categories and members
      const categoriesResponse = await fetch('/api/categories');
      const categories = await categoriesResponse.json();
      
      const membersResponse = await fetch('/api/members');
      const members = await membersResponse.json();

      const transactions = [
        {
          title: 'รายได้จากการขายสินค้า',
          description: 'ขายสินค้าประจำเดือนมกราคม',
          amount: 50000,
          type: 'income',
          categoryId: categories.find(c => c.type === 'income')?.id,
          memberId: members[0]?.id,
          bankName: 'ธนาคารไทยพาณิชย์',
          bankAccount: '1234567890',
          accountName: 'บริษัท เอบีซี จำกัด',
          date: new Date('2024-01-15').toISOString()
        },
        {
          title: 'จ่ายค่าเช่าสำนักงาน',
          description: 'ค่าเช่าเดือนมกราคม',
          amount: 20000,
          type: 'expense',
          categoryId: categories.find(c => c.name === 'ค่าเช่า')?.id,
          date: new Date('2024-01-05').toISOString()
        },
        {
          title: 'รายได้จากค่าบริการ',
          description: 'ค่าบริการติดตั้งและซ่อมแซม',
          amount: 15000,
          type: 'income',
          categoryId: categories.find(c => c.name === 'ค่าบริการ')?.id,
          memberId: members[1]?.id,
          bankName: 'ธนาคารกรุงเทพ',
          bankAccount: '0987654321',
          accountName: 'บริษัท เอบีซี จำกัด',
          date: new Date('2024-01-20').toISOString()
        }
      ];

      for (const transaction of transactions) {
        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transaction)
        });
        
        if (!response.ok) throw new Error(`Failed to create transaction: ${transaction.title}`);
      }

      addTestResult({
        function: 'สร้างรายการรับ-จ่าย',
        status: 'success',
        message: 'สร้างรายการรับ-จ่ายทั้งหมด 3 รายการสำเร็จ',
        data: transactions.length
      });
    } catch (error) {
      addTestResult({
        function: 'สร้างรายการรับ-จ่าย',
        status: 'error',
        message: error instanceof Error ? error.message : 'ไม่สามารถสร้างรายการรับ-จ่ายได้'
      });
    }
  };

  const createCustomers = async () => {
    try {
      const teamsResponse = await fetch('/api/teams');
      const teams = await teamsResponse.json();
      
      const membersResponse = await fetch('/api/members');
      const members = await membersResponse.json();

      const customers = [
        {
          name: 'บริษัท เอบีซี จำกัด',
          email: 'contact@abc.co.th',
          phone: '021234567',
          address: '123 ถนนสุขุมวิท กรุงเทพฯ',
          type: 'new',
          initialAmount: 100000,
          extensionAmount: 0,
          totalAmount: 100000,
          teamId: teams[0]?.id,
          memberId: members[0]?.id,
          status: 'active',
          notes: 'ลูกค้ารายใหญ่'
        },
        {
          name: 'บริษัท เอ็กซ์วายจี จำกัด',
          email: 'info@xyz.co.th',
          phone: '022345678',
          address: '456 ถนนสีลม กรุงเทพฯ',
          type: 'deposit',
          initialAmount: 50000,
          extensionAmount: 20000,
          totalAmount: 70000,
          teamId: teams[1]?.id,
          memberId: members[1]?.id,
          status: 'active',
          notes: 'ลูกค้าฝากเงิน'
        },
        {
          name: 'นายวิชัย รุ่งเรือง',
          email: 'wichai@email.com',
          phone: '0898765432',
          address: '789 ถนนลาดพร้าว กรุงเทพฯ',
          type: 'extension',
          initialAmount: 30000,
          extensionAmount: 15000,
          totalAmount: 45000,
          teamId: teams[2]?.id,
          memberId: members[2]?.id,
          status: 'active',
          notes: 'ลูกค้าต่อยอด'
        }
      ];

      for (const customer of customers) {
        const response = await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(customer)
        });
        
        if (!response.ok) throw new Error(`Failed to create customer: ${customer.name}`);
      }

      addTestResult({
        function: 'สร้างลูกค้า',
        status: 'success',
        message: 'สร้างลูกค้าทั้งหมด 3 รายสำเร็จ',
        data: customers.length
      });
    } catch (error) {
      addTestResult({
        function: 'สร้างลูกค้า',
        status: 'error',
        message: error instanceof Error ? error.message : 'ไม่สามารถสร้างลูกค้าได้'
      });
    }
  };

  const createSalaries = async () => {
    try {
      const membersResponse = await fetch('/api/members');
      const members = await membersResponse.json();

      const salaries = [
        {
          memberId: members[0]?.id,
          amount: 30000,
          payDate: new Date('2024-01-31').toISOString(),
          month: 1,
          year: 2024,
          status: 'paid',
          description: 'เงินเดือนเดือนมกราคม'
        },
        {
          memberId: members[1]?.id,
          amount: 20000,
          payDate: new Date('2024-01-31').toISOString(),
          month: 1,
          year: 2024,
          status: 'paid',
          description: 'เงินเดือนเดือนมกราคม'
        },
        {
          memberId: members[2]?.id,
          amount: 25000,
          payDate: new Date('2024-01-31').toISOString(),
          month: 1,
          year: 2024,
          status: 'pending',
          description: 'เงินเดือนเดือนมกราคม'
        }
      ];

      for (const salary of salaries) {
        const response = await fetch('/api/salaries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(salary)
        });
        
        if (!response.ok) throw new Error(`Failed to create salary record`);
      }

      addTestResult({
        function: 'สร้างบันทึกเงินเดือน',
        status: 'success',
        message: 'สร้างบันทึกเงินเดือนทั้งหมด 3 รายการสำเร็จ',
        data: salaries.length
      });
    } catch (error) {
      addTestResult({
        function: 'สร้างบันทึกเงินเดือน',
        status: 'error',
        message: error instanceof Error ? error.message : 'ไม่สามารถสร้างบันทึกเงินเดือนได้'
      });
    }
  };

  const createBonuses = async () => {
    try {
      const membersResponse = await fetch('/api/members');
      const members = await membersResponse.json();

      const bonuses = [
        {
          memberId: members[0]?.id,
          amount: 5000,
          reason: 'โบนัสยอดขายสูง',
          date: new Date('2024-01-25').toISOString(),
          status: 'paid'
        },
        {
          memberId: members[1]?.id,
          amount: 3000,
          reason: 'โบนัสพนักงานดีเด่น',
          date: new Date('2024-01-20').toISOString(),
          status: 'pending'
        }
      ];

      for (const bonus of bonuses) {
        const response = await fetch('/api/bonuses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bonus)
        });
        
        if (!response.ok) throw new Error(`Failed to create bonus record`);
      }

      addTestResult({
        function: 'สร้างโบนัส',
        status: 'success',
        message: 'สร้างโบนัสทั้งหมด 2 รายการสำเร็จ',
        data: bonuses.length
      });
    } catch (error) {
      addTestResult({
        function: 'สร้างโบนัส',
        status: 'error',
        message: error instanceof Error ? error.message : 'ไม่สามารถสร้างโบนัสได้'
      });
    }
  };

  const createCommissions = async () => {
    try {
      const membersResponse = await fetch('/api/members');
      const members = await membersResponse.json();

      const commissions = [
        {
          memberId: members[0]?.id,
          amount: 10000,
          percentage: 5.0,
          salesAmount: 200000,
          description: 'ค่าคอมมิชชันจากยอดขายเดือนมกราคม',
          date: new Date('2024-01-31').toISOString(),
          status: 'pending'
        },
        {
          memberId: members[1]?.id,
          amount: 7500,
          percentage: 3.0,
          salesAmount: 250000,
          description: 'ค่าคอมมิชชันจากยอดขายเดือนมกราคม',
          date: new Date('2024-01-31').toISOString(),
          status: 'pending'
        }
      ];

      for (const commission of commissions) {
        const response = await fetch('/api/commissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(commission)
        });
        
        if (!response.ok) throw new Error(`Failed to create commission record`);
      }

      addTestResult({
        function: 'สร้างค่าคอมมิชชัน',
        status: 'success',
        message: 'สร้างค่าคอมมิชชันทั้งหมด 2 รายการสำเร็จ',
        data: commissions.length
      });
    } catch (error) {
      addTestResult({
        function: 'สร้างค่าคอมมิชชัน',
        status: 'error',
        message: error instanceof Error ? error.message : 'ไม่สามารถสร้างค่าคอมมิชชันได้'
      });
    }
  };

  const createIncomeExpenseTransactions = async () => {
    try {
      // Get categories and members
      const categoriesResponse = await fetch('/api/categories');
      const categories = await categoriesResponse.json();
      
      const membersResponse = await fetch('/api/members');
      const members = await membersResponse.json();

      // 5 Income Transactions
      const incomeTransactions = [
        {
          title: 'รายได้จากการขายสินค้า A',
          description: 'ขายสินค้าชนิด A จำนวน 100 ชิ้น',
          amount: 75000,
          type: 'income',
          categoryId: categories.find(c => c.type === 'income')?.id || categories.find(c => c.name.includes('ยอดขาย'))?.id,
          memberId: members[0]?.id,
          bankName: 'ธนาคารไทยพาณิชย์',
          bankAccount: '1234567890',
          accountName: 'บริษัท เอบีซี จำกัด',
          date: new Date('2024-02-01').toISOString()
        },
        {
          title: 'รายได้จากบริการติดตั้ง',
          description: 'ค่าบริการติดตั้งระบบสำหรับลูกค้าใหม่',
          amount: 25000,
          type: 'income',
          categoryId: categories.find(c => c.type === 'income')?.id || categories.find(c => c.name.includes('บริการ'))?.id,
          memberId: members[1]?.id,
          bankName: 'ธนาคารกรุงเทพ',
          bankAccount: '0987654321',
          accountName: 'บริษัท เอบีซี จำกัด',
          date: new Date('2024-02-05').toISOString()
        },
        {
          title: 'รายได้จากการขายสินค้า B',
          description: 'ขายสินค้าชนิด B จำนวน 50 ชิ้น',
          amount: 45000,
          type: 'income',
          categoryId: categories.find(c => c.type === 'income')?.id || categories.find(c => c.name.includes('ยอดขาย'))?.id,
          memberId: members[2]?.id,
          bankName: 'ธนาคารกสิกรไทย',
          bankAccount: '1122334455',
          accountName: 'บริษัท เอบีซี จำกัด',
          date: new Date('2024-02-10').toISOString()
        },
        {
          title: 'รายได้จากค่าธรรมเนียม',
          description: 'ค่าธรรมเนียมการดำเนินการ',
          amount: 15000,
          type: 'income',
          categoryId: categories.find(c => c.type === 'income')?.id || categories.find(c => c.name.includes('บริการ'))?.id,
          memberId: members[0]?.id,
          bankName: 'ธนาคารไทยพาณิชย์',
          bankAccount: '1234567890',
          accountName: 'บริษัท เอบีซี จำกัด',
          date: new Date('2024-02-15').toISOString()
        },
        {
          title: 'รายได้จากการให้เช่า',
          description: 'ค่าเช่าอุปกรณ์เดือนกุมภาพันธ์',
          amount: 12000,
          type: 'income',
          categoryId: categories.find(c => c.type === 'income')?.id || categories.find(c => c.name.includes('ยอดขาย'))?.id,
          memberId: members[1]?.id,
          bankName: 'ธนาคารกรุงเทพ',
          bankAccount: '0987654321',
          accountName: 'บริษัท เอบีซี จำกัด',
          date: new Date('2024-02-20').toISOString()
        }
      ];

      // 5 Expense Transactions
      const expenseTransactions = [
        {
          title: 'ค่าจ้างพนักงาน',
          description: 'เงินเดือนพนักงานเดือนกุมภาพันธ์',
          amount: 85000,
          type: 'expense',
          categoryId: categories.find(c => c.name === 'ค่าจ้าง')?.id || categories.find(c => c.type === 'expense')?.id,
          date: new Date('2024-02-01').toISOString()
        },
        {
          title: 'ค่าเช่าสำนักงาน',
          description: 'ค่าเช่าสำนักงานเดือนกุมภาพันธ์',
          amount: 25000,
          type: 'expense',
          categoryId: categories.find(c => c.name === 'ค่าเช่า')?.id || categories.find(c => c.type === 'expense')?.id,
          date: new Date('2024-02-05').toISOString()
        },
        {
          title: 'ค่าสื่อสาร',
          description: 'ค่าโทรศัพท์และอินเทอร์เน็ตเดือนกุมภาพันธ์',
          amount: 8500,
          type: 'expense',
          categoryId: categories.find(c => c.name === 'ค่าสื่อสาร')?.id || categories.find(c => c.type === 'expense')?.id,
          date: new Date('2024-02-10').toISOString()
        },
        {
          title: 'ค่าไฟฟ้าและน้ำ',
          description: 'ค่าไฟฟ้าและน้ำประปาเดือนกุมภาพันธ์',
          amount: 12000,
          type: 'expense',
          categoryId: categories.find(c => c.name === 'ค่าสื่อสาร')?.id || categories.find(c => c.type === 'expense')?.id,
          date: new Date('2024-02-15').toISOString()
        },
        {
          title: 'ค่าอุปกรณ์สำนักงาน',
          description: 'ซื้ออุปกรณ์สำนักงานเพิ่มเติม',
          amount: 18000,
          type: 'expense',
          categoryId: categories.find(c => c.name === 'ค่าสื่อสาร')?.id || categories.find(c => c.type === 'expense')?.id,
          date: new Date('2024-02-20').toISOString()
        }
      ];

      // Create income transactions
      let incomeSuccess = 0;
      console.log('Starting to create income transactions...');
      console.log('Available categories:', categories);
      console.log('Available members:', members);
      
      for (const transaction of incomeTransactions) {
        try {
          console.log('Creating income transaction:', transaction);
          const response = await fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transaction)
          });
          
          if (response.ok) {
            incomeSuccess++;
            console.log(`Successfully created income transaction: ${transaction.title}`);
          } else {
            const errorData = await response.text();
            console.error(`Failed to create income transaction: ${transaction.title}`, errorData);
          }
        } catch (error) {
          console.error(`Error creating income transaction: ${transaction.title}`, error);
        }
      }

      // Create expense transactions
      let expenseSuccess = 0;
      console.log('Starting to create expense transactions...');
      
      for (const transaction of expenseTransactions) {
        try {
          console.log('Creating expense transaction:', transaction);
          const response = await fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transaction)
          });
          
          if (response.ok) {
            expenseSuccess++;
            console.log(`Successfully created expense transaction: ${transaction.title}`);
          } else {
            const errorData = await response.text();
            console.error(`Failed to create expense transaction: ${transaction.title}`, errorData);
          }
        } catch (error) {
          console.error(`Error creating expense transaction: ${transaction.title}`, error);
        }
      }

      const totalSuccess = incomeSuccess + expenseSuccess;
      const totalExpected = incomeTransactions.length + expenseTransactions.length;

      if (totalSuccess === totalExpected) {
        addTestResult({
          function: 'สร้างรายการรายรับ-รายจ่าย',
          status: 'success',
          message: `สร้างรายการรายรับ ${incomeSuccess} รายการ และรายจ่าย ${expenseSuccess} รายการสำเร็จ`,
          data: { income: incomeSuccess, expense: expenseSuccess, total: totalSuccess }
        });
      } else {
        addTestResult({
          function: 'สร้างรายการรายรับ-รายจ่าย',
          status: 'error',
          message: `สร้างรายการรายรับ ${incomeSuccess}/${incomeTransactions.length} รายการ และรายจ่าย ${expenseSuccess}/${expenseTransactions.length} รายการ (ไม่สำเร็จบางรายการ)`,
          data: { income: incomeSuccess, expense: expenseSuccess, total: totalSuccess }
        });
      }
    } catch (error) {
      addTestResult({
        function: 'สร้างรายการรายรับ-รายจ่าย',
        status: 'error',
        message: error instanceof Error ? error.message : 'ไม่สามารถสร้างรายการรายรับ-รายจ่ายได้'
      });
    }
  };

  const createCustomerCounts = async () => {
    try {
      const teamsResponse = await fetch('/api/teams');
      const teams = await teamsResponse.json();

      const customerCounts = [
        {
          newCustomers: 5,
          depositCustomers: 3,
          expenses: 150000,
          totalCustomers: 8,
          averageExpensePerCustomer: 18750,
          teamId: teams[0]?.id,
          date: new Date('2024-01-31').toISOString()
        },
        {
          newCustomers: 3,
          depositCustomers: 2,
          expenses: 100000,
          totalCustomers: 5,
          averageExpensePerCustomer: 20000,
          teamId: teams[1]?.id,
          date: new Date('2024-01-31').toISOString()
        },
        {
          newCustomers: 4,
          depositCustomers: 1,
          expenses: 120000,
          totalCustomers: 5,
          averageExpensePerCustomer: 24000,
          teamId: teams[2]?.id,
          date: new Date('2024-01-31').toISOString()
        }
      ];

      for (const customerCount of customerCounts) {
        const response = await fetch('/api/customer-counts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(customerCount)
        });
        
        if (!response.ok) throw new Error(`Failed to create customer count record`);
      }

      addTestResult({
        function: 'สร้างสถิติลูกค้า',
        status: 'success',
        message: 'สร้างสถิติลูกค้าทั้งหมด 3 รายการสำเร็จ',
        data: customerCounts.length
      });
    } catch (error) {
      addTestResult({
        function: 'สร้างสถิติลูกค้า',
        status: 'error',
        message: error instanceof Error ? error.message : 'ไม่สามารถสร้างสถิติลูกค้าได้'
      });
    }
  };

  const runAllTests = async () => {
    setIsLoading(true);
    setTestResults([]);

    try {
      // Reset data first
      await resetAllData();
      await new Promise(resolve => setTimeout(resolve, 500));

      // Create data in order of dependencies
      await createTeams();
      await new Promise(resolve => setTimeout(resolve, 500));

      await createCategories();
      await new Promise(resolve => setTimeout(resolve, 500));

      await createMembers();
      await new Promise(resolve => setTimeout(resolve, 500));

      await createCustomers();
      await new Promise(resolve => setTimeout(resolve, 500));

      await createTransactions();
      await new Promise(resolve => setTimeout(resolve, 500));

      await createIncomeExpenseTransactions();
      await new Promise(resolve => setTimeout(resolve, 500));

      await createSalaries();
      await new Promise(resolve => setTimeout(resolve, 500));

      await createBonuses();
      await new Promise(resolve => setTimeout(resolve, 500));

      await createCommissions();
      await new Promise(resolve => setTimeout(resolve, 500));

      await createCustomerCounts();

      toast({
        title: 'ทดสอบสำเร็จ',
        description: 'สร้างข้อมูลทดสอบทั้งหมดเรียบร้อยแล้ว',
      });

    } catch (error) {
      console.error('Test error:', error);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถทดสอบได้',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>เทสระบบและเพิ่มข้อมูลทดสอบ</CardTitle>
          <CardDescription>
            รีเซ็ตข้อมูลทั้งหมดและเพิ่มข้อมูลทดสอบสำหรับทุกฟังก์ชันในระบบ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={runAllTests} 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'กำลังทดสอบ...' : 'เริ่มทดสอบทั้งหมด'}
            </Button>
            <Button 
              onClick={createIncomeExpenseTransactions} 
              disabled={isLoading}
              variant="secondary"
            >
              {isLoading ? 'กำลังสร้าง...' : 'เพิ่มรายรับ-รายจ่าย (5+5)'}
            </Button>
            <Button 
              onClick={clearResults} 
              variant="outline"
              disabled={isLoading}
            >
              ล้างผลลัพธ์
            </Button>
          </div>

          <Separator />

          <div className="space-y-3">
            <h3 className="text-lg font-semibold">ผลการทดสอบ:</h3>
            {testResults.length === 0 ? (
              <p className="text-muted-foreground">ยังไม่มีผลการทดสอบ</p>
            ) : (
              <div className="space-y-2">
                {testResults.map((result, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Badge 
                        variant={result.status === 'success' ? 'default' : 
                                result.status === 'error' ? 'destructive' : 'secondary'}
                      >
                        {result.status === 'success' ? 'สำเร็จ' : 
                         result.status === 'error' ? 'ผิดพลาด' : 'รอดำเนินการ'}
                      </Badge>
                      <span className="font-medium">{result.function}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">{result.message}</p>
                      {result.data && (
                        <p className="text-xs text-muted-foreground">
                          จำนวน: 
                          {typeof result.data === 'object' && result.data !== null
                            ? `รายรับ ${result.data.income || 0}, รายจ่าย ${result.data.expense || 0}, รวม ${result.data.total || 0}`
                            : `${result.data} รายการ`
                          }
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {testResults.length > 0 && (
            <>
              <Separator />
              <div className="text-sm text-muted-foreground">
                <p>• ทดสอบฟังก์ชัน: ทีม, หมวดหมู่, สมาชิก, ลูกค้า, รายการรับ-จ่าย</p>
                <p>• ทดสอบฟังก์ชัน: เงินเดือน, โบนัส, ค่าคอมมิชชัน, สถิติลูกค้า</p>
                <p>• ทดสอบเพิ่มเติม: รายรับ 5 รายการ และรายจ่าย 5 รายการ</p>
                <p>• ข้อมูลทั้งหมดจะถูกสร้างขึ้นมาใหม่หลังจากรีเซ็ต</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}