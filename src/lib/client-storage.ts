// Client-side localStorage helper for data persistence
class ClientStorage {
  private readonly STORAGE_KEY = 'businessData';

  // Load data from localStorage
  loadFromStorage() {
    if (typeof window === 'undefined') return null;
    
    try {
      const storedData = localStorage.getItem(this.STORAGE_KEY);
      if (storedData) {
        return JSON.parse(storedData);
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
    return null;
  }

  // Save data to localStorage
  saveToStorage(data: any) {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
    }
  }

  // Get specific data type
  getData(type: string) {
    const data = this.loadFromStorage();
    return data ? data[type] : null;
  }

  // Set specific data type
  setData(type: string, value: any) {
    const data = this.loadFromStorage() || {};
    data[type] = value;
    this.saveToStorage(data);
  }

  // Clear all data
  clearData() {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing data from localStorage:', error);
    }
  }

  // Initialize with sample data if empty
  initializeWithSampleData() {
    const existingData = this.loadFromStorage();
    if (existingData && existingData.teams && existingData.teams.length > 0) {
      return; // Data already exists
    }

    const sampleData = {
      teams: [
        {
          id: 'team1',
          name: 'ทีมการตลาด',
          description: 'ทีมรับผิดชอบด้านการตลาด',
          leader: 'คุณสมชาย',
          budget: 50000,
          color: 'blue',
          createdAt: '2025-10-16T00:00:00.000Z',
          updatedAt: '2025-10-16T00:00:00.000Z',
          members: [],
          transactions: []
        },
        {
          id: 'team2',
          name: 'ทีมขาย',
          description: 'ทีมรับผิดชอบด้านการขาย',
          leader: 'คุณสมศรี',
          budget: 75000,
          color: 'green',
          createdAt: '2025-10-16T00:00:00.000Z',
          updatedAt: '2025-10-16T00:00:00.000Z',
          members: [],
          transactions: []
        },
        {
          id: 'team3',
          name: 'ทีมบริการลูกค้า',
          description: 'ทีมรับผิดชอบด้านบริการลูกค้า',
          leader: 'คุณสมหญิง',
          budget: 30000,
          color: 'purple',
          createdAt: '2025-10-16T00:00:00.000Z',
          updatedAt: '2025-10-16T00:00:00.000Z',
          members: [],
          transactions: []
        }
      ],
      members: [
        {
          id: 'member_sample_1',
          name: 'สมชาย ใจดี',
          email: 'somchai@example.com',
          phone: '081-234-5678',
          bankName: 'ธนาคารไทยพาณิชย์',
          bankAccount: '1234567890',
          bankBranch: 'สาขาสุขุมวิท',
          role: 'Marketing Manager',
          position: 'Marketing Manager',
          department: 'การตลาด',
          salary: 25000,
          hireDate: '2024-01-01T00:00:00.000Z',
          status: 'active',
          teamId: 'team1',
          team: {
            id: 'team1',
            name: 'ทีมการตลาด'
          },
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        },
        {
          id: 'member_sample_2',
          name: 'สมศรี รักดี',
          email: 'somsri@example.com',
          phone: '082-345-6789',
          bankName: 'ธนาคารกรุงไทย',
          bankAccount: '0987654321',
          bankBranch: 'สาขาสีลม',
          role: 'Sales Executive',
          position: 'Sales Executive',
          department: 'การขาย',
          salary: 30000,
          hireDate: '2024-01-15T00:00:00.000Z',
          status: 'active',
          teamId: 'team2',
          team: {
            id: 'team2',
            name: 'ทีมขาย'
          },
          createdAt: '2024-01-15T00:00:00.000Z',
          updatedAt: '2024-01-15T00:00:00.000Z'
        }
      ],
      customers: [
        {
          id: 'customer_sample_1',
          name: 'บริษัท เอบีซี จำกัด',
          email: 'info@abccompany.com',
          phone: '02-123-4567',
          address: '123 ถนนสุขุมวิท กรุงเทพมหานคร',
          type: 'new',
          initialAmount: 50000,
          extensionAmount: 0,
          totalAmount: 50000,
          teamId: 'team1',
          memberId: 'member_sample_1',
          status: 'active',
          notes: 'ลูกค้ารายใหญ่',
          createdAt: '2025-10-16T00:00:00.000Z',
          updatedAt: '2025-10-16T00:00:00.000Z',
          team: {
            id: 'team1',
            name: 'ทีมการตลาด'
          },
          member: {
            id: 'member_sample_1',
            name: 'สมชาย ใจดี'
          },
          transactions: []
        }
      ],
      categories: [
        {
          id: 'category_sample_1',
          name: 'ค่าใช้จ่ายทั่วไป',
          type: 'expense',
          description: 'ค่าใช้จ่ายทั่วไปในการดำเนินงาน',
          color: '#ef4444',
          icon: 'shopping-cart',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z'
        },
        {
          id: 'category_sample_2',
          name: 'ค่าใช้จ่ายสำนักงาน',
          type: 'expense',
          description: 'ค่าใช้จ่ายเกี่ยวกับสำนักงาน',
          color: '#f59e0b',
          icon: 'building',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z'
        },
        {
          id: 'category_sample_3',
          name: 'รายได้จากการขาย',
          type: 'income',
          description: 'รายได้จากการขายสินค้าและบริการ',
          color: '#10b981',
          icon: 'trending-up',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z'
        },
        {
          id: 'category_sample_4',
          name: 'เงินเดือนพนักงาน',
          type: 'expense',
          description: 'ค่าจ้างและเงินเดือนพนักงาน',
          color: '#8b5cf6',
          icon: 'users',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z'
        }
      ],
      transactions: [
        {
          id: 'transaction_sample_1',
          categoryId: 'category_sample_1',
          amount: 5000,
          type: 'expense',
          description: 'ซื้อวัสดุสำนักงาน',
          date: '2025-01-15T00:00:00.000Z',
          createdAt: '2025-01-15T00:00:00.000Z',
          updatedAt: '2025-01-15T00:00:00.000Z',
          category: {
            id: 'category_sample_1',
            name: 'ค่าใช้จ่ายทั่วไป',
            type: 'expense',
            color: '#ef4444',
            icon: 'shopping-cart'
          }
        }
      ],
      salaries: [],
      bonuses: [],
      commissions: []
    };

    this.saveToStorage(sampleData);
  }
}

export const clientStorage = new ClientStorage();