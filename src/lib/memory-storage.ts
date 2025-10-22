// Shared memory storage for fallback data
import { addTimestamps, getCurrentTimestamp } from './time-utils';

class MemoryStorage {
  private static instance: MemoryStorage | null = null;
  
  private teams: any[] = [];
  private members: any[] = [];
  private customers: any[] = [];
  private categories: any[] = [];
  private transactions: any[] = [];
  private salaries: any[] = [];
  private bonuses: any[] = [];
  private commissions: any[] = [];
  private users: any[] = [];
  private auditLogs: any[] = [];
  private customerTransactions: any[] = [];
  private customerCounts: any[] = [];
  private initialized = false;
  
  private constructor() {
    console.log('MemoryStorage constructor called');
    this.initialize();
  }
  
  // Singleton pattern with global fallback for server-side
  static getInstance(): MemoryStorage {
    if (!MemoryStorage.instance) {
      console.log('Creating new MemoryStorage instance');
      MemoryStorage.instance = new MemoryStorage();
      
      // On server-side, also store in global to persist across requests
      if (typeof window === 'undefined' && typeof global !== 'undefined') {
        if (!(global as any).memoryStorageInstance) {
          (global as any).memoryStorageInstance = MemoryStorage.instance;
          console.log('Stored MemoryStorage instance in global');
        }
      }
    } else {
      console.log('Using existing MemoryStorage instance');
    }
    
    // On server-side, try to get from global if available
    if (typeof window === 'undefined' && typeof global !== 'undefined') {
      const globalInstance = (global as any).memoryStorageInstance;
      if (globalInstance && globalInstance !== MemoryStorage.instance) {
        console.log('Using global MemoryStorage instance');
        MemoryStorage.instance = globalInstance;
      }
    }
    
    return MemoryStorage.instance;
  }
  
  private initialize() {
    // On server-side, try to load from global storage first
    if (typeof window === 'undefined' && typeof global !== 'undefined') {
      const globalData = (global as any).memoryStorageData;
      if (globalData) {
        this.teams = globalData.teams || [];
        this.members = globalData.members || [];
        this.customers = globalData.customers || [];
        this.categories = globalData.categories || [];
        this.transactions = globalData.transactions || [];
        this.salaries = globalData.salaries || [];
        this.bonuses = globalData.bonuses || [];
        this.commissions = globalData.commissions || [];
        this.users = globalData.users || [];
        this.auditLogs = globalData.auditLogs || [];
        this.customerTransactions = globalData.customerTransactions || [];
        this.customerCounts = globalData.customerCounts || [];
        console.log('Server-side: loaded data from global storage');
        this.initialized = true;
        return;
      }
      console.log('Server-side detected - initializing with empty data');
      this.initialized = true;
      return;
    }
    
    // Always try to load from localStorage first (client-side)
    this.loadFromStorage();
    
    // Check if user has explicitly reset data or this is first visit
    const hasInitialized = typeof window !== 'undefined' && 
                         localStorage.getItem('memoryStorageInitialized') === 'true'
    
    // Check if we have any data
    const hasData = this.teams.length > 0 || this.members.length > 0 || this.categories.length > 0 || 
                   this.customers.length > 0 || this.salaries.length > 0 || this.bonuses.length > 0 || 
                   this.commissions.length > 0;
    
    if (!hasData && !hasInitialized) {
      console.log('Storage is empty and not initialized - keeping empty to prevent unwanted data')
      // Mark as initialized to prevent future auto-initialization
      if (typeof window !== 'undefined') {
        localStorage.setItem('memoryStorageInitialized', 'true')
      }
    } else {
      console.log('Using existing data from storage:', {
        teams: this.teams.length,
        members: this.members.length,
        categories: this.categories.length,
        customers: this.customers.length,
        salaries: this.salaries.length,
        hasData,
        hasInitialized
      });
    }
    
    this.initialized = true;
  }
  
  loadFromStorage() {
    if (typeof window !== 'undefined') {
      try {
        const storedData = localStorage.getItem('businessData');
        if (storedData) {
          const data = JSON.parse(storedData);
          this.teams = data.teams || [];
          this.members = data.members || [];
          this.customers = data.customers || [];
          this.categories = data.categories || [];
          this.transactions = data.transactions || [];
          this.salaries = data.salaries || [];
          this.bonuses = data.bonuses || [];
          this.commissions = data.commissions || [];
          this.users = data.users || [];
          this.auditLogs = data.auditLogs || [];
          this.customerTransactions = data.customerTransactions || [];
          this.customerCounts = data.customerCounts || [];
          return;
        }
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
      }
    } else {
      // Server-side: try to load from global storage
      if (typeof global !== 'undefined') {
        const globalData = (global as any).memoryStorageData;
        if (globalData) {
          this.teams = globalData.teams || [];
          this.members = globalData.members || [];
          this.customers = globalData.customers || [];
          this.categories = globalData.categories || [];
          this.transactions = globalData.transactions || [];
          this.salaries = globalData.salaries || [];
          this.bonuses = globalData.bonuses || [];
          this.commissions = globalData.commissions || [];
          this.users = globalData.users || [];
          this.auditLogs = globalData.auditLogs || [];
          this.customerTransactions = globalData.customerTransactions || [];
          this.customerCounts = globalData.customerCounts || [];
          console.log('Data loaded from global storage (server-side)');
          return;
        }
      }
    }
    
    // Initialize empty arrays if no stored data
    this.teams = [];
    this.members = [];
    this.customers = [];
    this.categories = [];
    this.transactions = [];
    this.salaries = [];
    this.bonuses = [];
    this.commissions = [];
    this.users = [];
    this.auditLogs = [];
    this.customerTransactions = [];
    this.customerCounts = [];
  }
  
  saveToStorage() {
    if (typeof window !== 'undefined') {
      try {
        const data = {
          teams: this.teams,
          members: this.members,
          customers: this.customers,
          categories: this.categories,
          transactions: this.transactions,
          salaries: this.salaries,
          bonuses: this.bonuses,
          commissions: this.commissions,
          users: this.users,
          auditLogs: this.auditLogs,
          customerTransactions: this.customerTransactions,
          customerCounts: this.customerCounts
        };
        localStorage.setItem('businessData', JSON.stringify(data));
      } catch (error) {
        console.error('Error saving data to localStorage:', error);
      }
    } else {
      // Server-side: store in global to persist across requests
      if (typeof global !== 'undefined') {
        (global as any).memoryStorageData = {
          teams: this.teams,
          members: this.members,
          customers: this.customers,
          categories: this.categories,
          transactions: this.transactions,
          salaries: this.salaries,
          bonuses: this.bonuses,
          commissions: this.commissions,
          users: this.users,
          auditLogs: this.auditLogs,
          customerTransactions: this.customerTransactions,
          customerCounts: this.customerCounts
        };
        console.log('Data saved to global storage (server-side)');
      }
    }
  }
  
  // Getter methods
  get teamsList() { return this.teams; }
  get membersList() { return this.members; }
  get customersList() { return this.customers; }
  get categoriesList() { return this.categories; }
  get transactionsList() { return this.transactions; }
  get salariesList() { return this.salaries; }
  get bonusesList() { return this.bonuses; }
  get commissionsList() { return this.commissions; }
  get usersList() { return this.users; }
  get auditLogsList() { return this.auditLogs; }
  get customerTransactionsList() { return this.customerTransactions; }
  get customerCountsList() { return this.customerCounts; }
  
  // Direct access properties (for backward compatibility)
  get allMembers() { return this.members; }
  get allTeams() { return this.teams; }
  get allCustomers() { return this.customers; }
  get allCategories() { return this.categories; }
  get allTransactions() { return this.transactions; }
  get allSalaries() { return this.salaries; }
  get allBonuses() { return this.bonuses; }
  get allCommissions() { return this.commissions; }
  get allUsers() { return this.users; }
  get allAuditLogs() { return this.auditLogs; }
  get allCustomerTransactions() { return this.customerTransactions; }
  get allCustomerCounts() { return this.customerCounts; }
  
  // Setter methods
  setTeams(data: any[]) { this.teams = data; this.saveToStorage(); }
  setMembers(data: any[]) { this.members = data; this.saveToStorage(); }
  setCustomers(data: any[]) { this.customers = data; this.saveToStorage(); }
  setCategories(data: any[]) { this.categories = data; this.saveToStorage(); }
  setTransactions(data: any[]) { this.transactions = data; this.saveToStorage(); }
  setSalaries(data: any[]) { this.salaries = data; this.saveToStorage(); }
  setBonuses(data: any[]) { this.bonuses = data; this.saveToStorage(); }
  setCommissions(data: any[]) { this.commissions = data; this.saveToStorage(); }
  setUsers(data: any[]) { this.users = data; this.saveToStorage(); }
  setAuditLogs(data: any[]) { this.auditLogs = data; this.saveToStorage(); }
  setCustomerTransactions(data: any[]) { this.customerTransactions = data; this.saveToStorage(); }
  setCustomerCounts(data: any[]) { this.customerCounts = data; this.saveToStorage(); }
  
  // Customer count management methods
  createCustomerCount(data: any) {
    const customerCount = addTimestamps({
      id: `customer_count_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data
    });
    
    this.customerCounts.unshift(customerCount); // Add to beginning
    this.saveToStorage();
    
    console.log('Customer count created in memory storage:', customerCount);
    return customerCount;
  }
  
  // Reset all data and clear initialization flag
  resetAllData() {
    this.teams = [];
    this.members = [];
    this.customers = [];
    this.categories = [];
    this.transactions = [];
    this.salaries = [];
    this.bonuses = [];
    this.commissions = [];
    this.users = [];
    this.auditLogs = [];
    this.customerTransactions = [];
    this.customerCounts = [];
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('businessData');
      localStorage.removeItem('memoryStorageInitialized');
      localStorage.removeItem('dataSyncTimestamp');
      localStorage.removeItem('lastGlobalSync');
    }
    
    // Clear server-side global storage
    if (typeof global !== 'undefined') {
      delete (global as any).memoryStorageData;
      console.log('Global storage cleared (server-side)');
    }
    
    console.log('All data reset and initialization flag cleared');
  }

  // Method to manually load sample data (only when user explicitly requests)
  loadSampleDataManually() {
    console.log('User requested to load sample data')
    this.initializeSampleData()
    
    // Save to storage on both client-side and server-side
    this.saveToStorage()
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('memoryStorageInitialized', 'true')
    }
    
    console.log('Sample data loaded manually')
    console.log('Data summary:', {
      teams: this.teams.length,
      members: this.members.length,
      customers: this.customers.length,
      categories: this.categories.length,
      transactions: this.transactions.length,
      salaries: this.salaries.length,
      bonuses: this.bonuses.length,
      commissions: this.commissions.length,
      customerCounts: this.customerCounts.length
    })
  }
  
  initializeSampleData() {
    // Sample teams for fallback
    this.teams = [
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
    ];
    
    // Sample members for fallback
    this.members = [
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
    ];

    // Sample customers for fallback
    this.customers = [
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
      },
      {
        id: 'customer_sample_2',
        name: 'บริษัท เอ็กซ์วายจี จำกัด',
        email: 'contact@xygcompany.com',
        phone: '02-987-6543',
        address: '456 ถนนพระราม 4 กรุงเทพมหานคร',
        type: 'deposit',
        initialAmount: 30000,
        extensionAmount: 0,
        totalAmount: 30000,
        teamId: 'team2',
        memberId: 'member_sample_2',
        status: 'active',
        notes: 'ลูกค้าฝาก',
        createdAt: '2025-10-15T00:00:00.000Z',
        updatedAt: '2025-10-15T00:00:00.000Z',
        team: {
          id: 'team2',
          name: 'ทีมขาย'
        },
        member: {
          id: 'member_sample_2',
          name: 'สมศรี รักดี'
        },
        transactions: []
      }
    ];
    
    this.salaries = [
      {
        id: 'salary_sample_1',
        memberId: 'member_sample_1',
        amount: 25000,
        payDate: '2025-01-25T00:00:00.000Z',
        month: 1,
        year: 2025,
        status: 'paid',
        description: 'เงินเดือนมกราคม 2025',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
        member: {
          id: 'member_sample_1',
          name: 'สมชาย ใจดี',
          email: 'somchai@example.com',
          team: {
            id: '1',
            name: 'ทีมการตลาด'
          }
        }
      },
      {
        id: 'salary_sample_2',
        memberId: 'member_sample_2',
        amount: 30000,
        payDate: '2025-01-25T00:00:00.000Z',
        month: 1,
        year: 2025,
        status: 'paid',
        description: 'เงินเดือนมกราคม 2025',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
        member: {
          id: 'member_sample_2',
          name: 'สมศรี รักดี',
          email: 'somsri@example.com',
          team: {
            id: '2',
            name: 'ทีมขาย'
          }
        }
      },
      {
        id: 'salary_sample_3',
        memberId: 'member_sample_1',
        amount: 25000,
        payDate: '2025-02-25T00:00:00.000Z',
        month: 2,
        year: 2025,
        status: 'paid',
        description: 'เงินเดือนกุมภาพันธ์ 2025',
        createdAt: '2025-02-01T00:00:00.000Z',
        updatedAt: '2025-02-01T00:00:00.000Z',
        member: {
          id: 'member_sample_1',
          name: 'สมชาย ใจดี',
          email: 'somchai@example.com',
          team: {
            id: '1',
            name: 'ทีมการตลาด'
          }
        }
      },
      {
        id: 'salary_sample_4',
        memberId: 'member_sample_2',
        amount: 30000,
        payDate: '2025-02-25T00:00:00.000Z',
        month: 2,
        year: 2025,
        status: 'paid',
        description: 'เงินเดือนกุมภาพันธ์ 2025',
        createdAt: '2025-02-01T00:00:00.000Z',
        updatedAt: '2025-02-01T00:00:00.000Z',
        member: {
          id: 'member_sample_2',
          name: 'สมศรี รักดี',
          email: 'somsri@example.com',
          team: {
            id: '2',
            name: 'ทีมขาย'
          }
        }
      },
      {
        id: 'salary_sample_5',
        memberId: 'member_sample_1',
        amount: 26000,
        payDate: '2025-03-25T00:00:00.000Z',
        month: 3,
        year: 2025,
        status: 'pending',
        description: 'เงินเดือนมีนาคม 2025 (ปรับเพิ่ม)',
        createdAt: '2025-03-01T00:00:00.000Z',
        updatedAt: '2025-03-01T00:00:00.000Z',
        member: {
          id: 'member_sample_1',
          name: 'สมชาย ใจดี',
          email: 'somchai@example.com',
          team: {
            id: '1',
            name: 'ทีมการตลาด'
          }
        }
      }
    ];
    
    this.bonuses = [
      {
        id: 'bonus_sample_1',
        memberId: 'member_sample_1',
        amount: 5000,
        reason: 'โบนัสยอดขายสูง',
        date: '2025-01-15T00:00:00.000Z',
        status: 'paid',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
        member: {
          id: 'member_sample_1',
          name: 'สมชาย ใจดี',
          email: 'somchai@example.com',
          team: {
            id: '1',
            name: 'ทีมการตลาด'
          }
        }
      },
      {
        id: 'bonus_sample_2',
        memberId: 'member_sample_2',
        amount: 3000,
        reason: 'โบนัสพนักงานดีเด่น',
        date: '2025-01-10T00:00:00.000Z',
        status: 'paid',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
        member: {
          id: 'member_sample_2',
          name: 'สมศรี รักดี',
          email: 'somsri@example.com',
          team: {
            id: '2',
            name: 'ทีมขาย'
          }
        }
      },
      {
        id: 'bonus_sample_3',
        memberId: 'member_sample_1',
        amount: 7000,
        reason: 'โบนัสยอดขายเดือนกุมภาพันธ์',
        date: '2025-02-15T00:00:00.000Z',
        status: 'paid',
        createdAt: '2025-02-01T00:00:00.000Z',
        updatedAt: '2025-02-01T00:00:00.000Z',
        member: {
          id: 'member_sample_1',
          name: 'สมชาย ใจดี',
          email: 'somchai@example.com',
          team: {
            id: '1',
            name: 'ทีมการตลาด'
          }
        }
      },
      {
        id: 'bonus_sample_4',
        memberId: 'member_sample_2',
        amount: 5500,
        reason: 'โบนัสยอดขายเดือนกุมภาพันธ์',
        date: '2025-02-15T00:00:00.000Z',
        status: 'paid',
        createdAt: '2025-02-01T00:00:00.000Z',
        updatedAt: '2025-02-01T00:00:00.000Z',
        member: {
          id: 'member_sample_2',
          name: 'สมศรี รักดี',
          email: 'somsri@example.com',
          team: {
            id: '2',
            name: 'ทีมขาย'
          }
        }
      },
      {
        id: 'bonus_sample_5',
        memberId: 'member_sample_1',
        amount: 9000,
        reason: 'โบนัสยอดขายเดือนมีนาคม',
        date: '2025-03-15T00:00:00.000Z',
        status: 'pending',
        createdAt: '2025-03-01T00:00:00.000Z',
        updatedAt: '2025-03-01T00:00:00.000Z',
        member: {
          id: 'member_sample_1',
          name: 'สมชาย ใจดี',
          email: 'somchai@example.com',
          team: {
            id: '1',
            name: 'ทีมการตลาด'
          }
        }
      }
    ];
    
    this.commissions = [
      {
        id: 'commission_sample_1',
        memberId: 'member_sample_1',
        amount: 10000,
        percentage: 5.0,
        salesAmount: 200000,
        description: 'ค่าคอมมิชชันจากยอดขายเดือนมกราคม',
        date: '2025-01-31T00:00:00.000Z',
        status: 'paid',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
        member: {
          id: 'member_sample_1',
          name: 'สมชาย ใจดี',
          email: 'somchai@example.com',
          team: {
            id: '1',
            name: 'ทีมการตลาด'
          }
        }
      },
      {
        id: 'commission_sample_2',
        memberId: 'member_sample_2',
        amount: 7500,
        percentage: 3.0,
        salesAmount: 250000,
        description: 'ค่าคอมมิชชันจากยอดขายเดือนมกราคม',
        date: '2025-01-31T00:00:00.000Z',
        status: 'paid',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
        member: {
          id: 'member_sample_2',
          name: 'สมศรี รักดี',
          email: 'somsri@example.com',
          team: {
            id: '2',
            name: 'ทีมขาย'
          }
        }
      },
      {
        id: 'commission_sample_3',
        memberId: 'member_sample_1',
        amount: 12000,
        percentage: 5.0,
        salesAmount: 240000,
        description: 'ค่าคอมมิชชันยอดขายเดือนกุมภาพันธ์',
        date: '2025-02-28T00:00:00.000Z',
        status: 'paid',
        createdAt: '2025-02-01T00:00:00.000Z',
        updatedAt: '2025-02-01T00:00:00.000Z',
        member: {
          id: 'member_sample_1',
          name: 'สมชาย ใจดี',
          email: 'somchai@example.com',
          team: {
            id: '1',
            name: 'ทีมการตลาด'
          }
        }
      },
      {
        id: 'commission_sample_4',
        memberId: 'member_sample_2',
        amount: 8000,
        percentage: 3.0,
        salesAmount: 266667,
        description: 'ค่าคอมมิชชันยอดขายเดือนกุมภาพันธ์',
        date: '2025-02-28T00:00:00.000Z',
        status: 'paid',
        createdAt: '2025-02-01T00:00:00.000Z',
        updatedAt: '2025-02-01T00:00:00.000Z',
        member: {
          id: 'member_sample_2',
          name: 'สมศรี รักดี',
          email: 'somsri@example.com',
          team: {
            id: '2',
            name: 'ทีมขาย'
          }
        }
      },
      {
        id: 'commission_sample_5',
        memberId: 'member_sample_1',
        amount: 15000,
        percentage: 6.0,
        salesAmount: 250000,
        description: 'ค่าคอมมิชชันยอดขายเดือนมีนาคม',
        date: '2025-03-31T00:00:00.000Z',
        status: 'pending',
        createdAt: '2025-03-01T00:00:00.000Z',
        updatedAt: '2025-03-01T00:00:00.000Z',
        member: {
          id: 'member_sample_1',
          name: 'สมชาย ใจดี',
          email: 'somchai@example.com',
          team: {
            id: '1',
            name: 'ทีมการตลาด'
          }
        }
      }
    ];
    
    // Customer counts for fallback
    this.customerCounts = [
      {
        id: 'customer_count_sample_1',
        recordDate: '2025-01-01T00:00:00.000Z',
        newCustomers: 5,
        depositCustomers: 3,
        extensionCustomers: 2,
        totalCustomers: 10,
        teamId: 'team1',
        memberId: 'member_sample_1',
        notes: 'ข้อมูลวันที่ 1 มกราคม',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
        team: {
          id: 'team1',
          name: 'ทีมการตลาด'
        },
        member: {
          id: 'member_sample_1',
          name: 'สมชาย ใจดี'
        }
      },
      {
        id: 'customer_count_sample_2',
        recordDate: '2025-01-02T00:00:00.000Z',
        newCustomers: 3,
        depositCustomers: 4,
        extensionCustomers: 1,
        totalCustomers: 8,
        teamId: 'team2',
        memberId: 'member_sample_2',
        notes: 'ข้อมูลวันที่ 2 มกราคม',
        createdAt: '2025-01-02T00:00:00.000Z',
        updatedAt: '2025-01-02T00:00:00.000Z',
        team: {
          id: 'team2',
          name: 'ทีมขาย'
        },
        member: {
          id: 'member_sample_2',
          name: 'สมศรี รักดี'
        }
      },
      {
        id: 'customer_count_sample_3',
        recordDate: '2025-01-03T00:00:00.000Z',
        newCustomers: 7,
        depositCustomers: 2,
        extensionCustomers: 3,
        totalCustomers: 12,
        teamId: 'team1',
        memberId: 'member_sample_1',
        notes: 'ข้อมูลวันที่ 3 มกราคม',
        createdAt: '2025-01-03T00:00:00.000Z',
        updatedAt: '2025-01-03T00:00:00.000Z',
        team: {
          id: 'team1',
          name: 'ทีมการตลาด'
        },
        member: {
          id: 'member_sample_1',
          name: 'สมชาย ใจดี'
        }
      }
    ];
    
    // Categories for fallback
    this.categories = [
      // รายได้ (Income Categories)
      {
        id: 'category_income_1',
        name: 'รายได้จากการขาย',
        type: 'income',
        description: 'รายได้จากการขายสินค้าและบริการ',
        color: '#10b981',
        icon: 'trending-up',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z'
      },
      {
        id: 'category_income_2',
        name: 'ค่าคอมมิชชัน',
        type: 'income',
        description: 'ค่าคอมมิชชันจากยอดขาย',
        color: '#22c55e',
        icon: 'percent',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z'
      },
      {
        id: 'category_income_3',
        name: 'ดอกเบี้ยธนาคาร',
        type: 'income',
        description: 'ดอกเบี้ยจากธนาคารและการลงทุน',
        color: '#16a34a',
        icon: 'banknote',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z'
      },
      {
        id: 'category_income_4',
        name: 'รายได้จากเช่า',
        type: 'income',
        description: 'รายได้จากการให้เช่าสถานที่และอุปกรณ์',
        color: '#15803d',
        icon: 'home',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z'
      },
      {
        id: 'category_income_5',
        name: 'รายได้อื่นๆ',
        type: 'income',
        description: 'รายได้อื่นๆ ที่ไม่ใช่หมวดหมู่ข้างต้น',
        color: '#166534',
        icon: 'more-horizontal',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z'
      },
      // รายจ่าย (Expense Categories)
      {
        id: 'category_expense_1',
        name: 'ค่าใช้จ่ายทั่วไป',
        type: 'expense',
        description: 'ค่าใช้จ่ายทั่วไปในการดำเนินงาน',
        color: '#ef4444',
        icon: 'shopping-cart',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z'
      },
      {
        id: 'category_expense_2',
        name: 'ค่าใช้จ่ายสำนักงาน',
        type: 'expense',
        description: 'ค่าใช้จ่ายเกี่ยวกับสำนักงาน',
        color: '#f59e0b',
        icon: 'building',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z'
      },
      {
        id: 'category_expense_3',
        name: 'เงินเดือนพนักงาน',
        type: 'expense',
        description: 'ค่าจ้างและเงินเดือนพนักงาน',
        color: '#8b5cf6',
        icon: 'users',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z'
      },
      {
        id: 'category_expense_4',
        name: 'ค่าใช้จ่ายการตลาด',
        type: 'expense',
        description: 'ค่าใช้จ่ายด้านการตลาดและโฆษณา',
        color: '#ec4899',
        icon: 'megaphone',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z'
      },
      {
        id: 'category_expense_5',
        name: 'ค่าใช้จ่ายยานพาหนะ',
        type: 'expense',
        description: 'ค่าน้ำมัน ค่าซ่อมรถ ค่าพาหนะ',
        color: '#f97316',
        icon: 'car',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z'
      },
      {
        id: 'category_expense_6',
        name: 'ค่าไฟฟ้า-น้ำ',
        type: 'expense',
        description: 'ค่าไฟฟ้า ค่าน้ำ ค่าโทรศัพท์',
        color: '#06b6d4',
        icon: 'zap',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z'
      },
      {
        id: 'category_expense_7',
        name: 'ค่าอาหารและเครื่องดื่ม',
        type: 'expense',
        description: 'ค่าอาหารสำหรับลูกค้าและพนักงาน',
        color: '#84cc16',
        icon: 'utensils',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z'
      },
      {
        id: 'category_expense_8',
        name: 'ค่าซ่อมแซมและบำรุงรักษา',
        type: 'expense',
        description: 'ค่าซ่อมแซมอุปกรณ์และสถานที่',
        color: '#6366f1',
        icon: 'wrench',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z'
      },
      {
        id: 'category_expense_9',
        name: 'ภาษีและค่าธรรมเนียม',
        type: 'expense',
        description: 'ภาษีเงินได้ ภาษีบริษัท และค่าธรรมเนียมต่างๆ',
        color: '#dc2626',
        icon: 'file-text',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z'
      },
      {
        id: 'category_expense_10',
        name: 'ค่าใช้จ่ายอื่นๆ',
        type: 'expense',
        description: 'ค่าใช้จ่ายอื่นๆ ที่ไม่ใช่หมวดหมู่ข้างต้น',
        color: '#64748b',
        icon: 'more-horizontal',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z'
      }
    ];
    
    // Transactions for fallback
    this.transactions = [
      // รายได้ (Income Transactions)
      {
        id: 'transaction_income_1',
        categoryId: 'category_income_1',
        amount: 15000,
        type: 'income',
        description: 'รายได้จากลูกค้าใหม่ - บริษัท เอบีซี',
        date: '2025-01-20T00:00:00.000Z',
        createdAt: '2025-01-20T00:00:00.000Z',
        updatedAt: '2025-01-20T00:00:00.000Z',
        category: {
          id: 'category_income_1',
          name: 'รายได้จากการขาย',
          type: 'income',
          color: '#10b981',
          icon: 'trending-up'
        }
      },
      {
        id: 'transaction_income_2',
        categoryId: 'category_income_1',
        amount: 25000,
        type: 'income',
        description: 'รายได้จากการขายสินค้า - บริษัท เอ็กซ์วายจี',
        date: '2025-01-25T00:00:00.000Z',
        createdAt: '2025-01-25T00:00:00.000Z',
        updatedAt: '2025-01-25T00:00:00.000Z',
        category: {
          id: 'category_income_1',
          name: 'รายได้จากการขาย',
          type: 'income',
          color: '#10b981',
          icon: 'trending-up'
        }
      },
      {
        id: 'transaction_income_3',
        categoryId: 'category_income_2',
        amount: 10000,
        type: 'income',
        description: 'ค่าคอมมิชชันจากยอดขายเดือนมกราคม',
        date: '2025-01-31T00:00:00.000Z',
        createdAt: '2025-01-31T00:00:00.000Z',
        updatedAt: '2025-01-31T00:00:00.000Z',
        category: {
          id: 'category_income_2',
          name: 'ค่าคอมมิชชัน',
          type: 'income',
          color: '#22c55e',
          icon: 'percent'
        }
      },
      {
        id: 'transaction_income_4',
        categoryId: 'category_income_3',
        amount: 2500,
        type: 'income',
        description: 'ดอกเบี้ยธนาคารเดือนมกราคม',
        date: '2025-01-31T00:00:00.000Z',
        createdAt: '2025-01-31T00:00:00.000Z',
        updatedAt: '2025-01-31T00:00:00.000Z',
        category: {
          id: 'category_income_3',
          name: 'ดอกเบี้ยธนาคาร',
          type: 'income',
          color: '#16a34a',
          icon: 'banknote'
        }
      },
      {
        id: 'transaction_income_5',
        categoryId: 'category_income_4',
        amount: 8000,
        type: 'income',
        description: 'ค่าเช่าออฟฟิศเดือนมกราคม',
        date: '2025-01-05T00:00:00.000Z',
        createdAt: '2025-01-05T00:00:00.000Z',
        updatedAt: '2025-01-05T00:00:00.000Z',
        category: {
          id: 'category_income_4',
          name: 'รายได้จากเช่า',
          type: 'income',
          color: '#15803d',
          icon: 'home'
        }
      },
      {
        id: 'transaction_income_6',
        categoryId: 'category_income_1',
        amount: 18000,
        type: 'income',
        description: 'รายได้จากลูกค้าเก่า - บริษัท แอลเอ็มเอ็น',
        date: '2025-02-10T00:00:00.000Z',
        createdAt: '2025-02-10T00:00:00.000Z',
        updatedAt: '2025-02-10T00:00:00.000Z',
        category: {
          id: 'category_income_1',
          name: 'รายได้จากการขาย',
          type: 'income',
          color: '#10b981',
          icon: 'trending-up'
        }
      },
      {
        id: 'transaction_income_7',
        categoryId: 'category_income_2',
        amount: 12000,
        type: 'income',
        description: 'ค่าคอมมิชชันจากยอดขายเดือนกุมภาพันธ์',
        date: '2025-02-28T00:00:00.000Z',
        createdAt: '2025-02-28T00:00:00.000Z',
        updatedAt: '2025-02-28T00:00:00.000Z',
        category: {
          id: 'category_income_2',
          name: 'ค่าคอมมิชชัน',
          type: 'income',
          color: '#22c55e',
          icon: 'percent'
        }
      },
      {
        id: 'transaction_income_8',
        categoryId: 'category_income_5',
        amount: 3000,
        type: 'income',
        description: 'รายได้อื่นๆ - ค่าบริการเสริม',
        date: '2025-02-15T00:00:00.000Z',
        createdAt: '2025-02-15T00:00:00.000Z',
        updatedAt: '2025-02-15T00:00:00.000Z',
        category: {
          id: 'category_income_5',
          name: 'รายได้อื่นๆ',
          type: 'income',
          color: '#166534',
          icon: 'more-horizontal'
        }
      },
      
      // รายจ่าย (Expense Transactions)
      {
        id: 'transaction_expense_1',
        categoryId: 'category_expense_1',
        amount: 5000,
        type: 'expense',
        description: 'ซื้อวัสดุสำนักงาน',
        date: '2025-01-15T00:00:00.000Z',
        createdAt: '2025-01-15T00:00:00.000Z',
        updatedAt: '2025-01-15T00:00:00.000Z',
        category: {
          id: 'category_expense_1',
          name: 'ค่าใช้จ่ายทั่วไป',
          type: 'expense',
          color: '#ef4444',
          icon: 'shopping-cart'
        }
      },
      {
        id: 'transaction_expense_2',
        categoryId: 'category_expense_2',
        amount: 12000,
        type: 'expense',
        description: 'ค่าเช่าสำนักงานเดือนมกราคม',
        date: '2025-01-01T00:00:00.000Z',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
        category: {
          id: 'category_expense_2',
          name: 'ค่าใช้จ่ายสำนักงาน',
          type: 'expense',
          color: '#f59e0b',
          icon: 'building'
        }
      },
      {
        id: 'transaction_expense_3',
        categoryId: 'category_expense_3',
        amount: 55000,
        type: 'expense',
        description: 'เงินเดือนพนักงานเดือนมกราคม',
        date: '2025-01-25T00:00:00.000Z',
        createdAt: '2025-01-25T00:00:00.000Z',
        updatedAt: '2025-01-25T00:00:00.000Z',
        category: {
          id: 'category_expense_3',
          name: 'เงินเดือนพนักงาน',
          type: 'expense',
          color: '#8b5cf6',
          icon: 'users'
        }
      },
      {
        id: 'transaction_expense_4',
        categoryId: 'category_expense_4',
        amount: 8000,
        type: 'expense',
        description: 'ค่าโฆษณาออนไลน์เดือนมกราคม',
        date: '2025-01-10T00:00:00.000Z',
        createdAt: '2025-01-10T00:00:00.000Z',
        updatedAt: '2025-01-10T00:00:00.000Z',
        category: {
          id: 'category_expense_4',
          name: 'ค่าใช้จ่ายการตลาด',
          type: 'expense',
          color: '#ec4899',
          icon: 'megaphone'
        }
      },
      {
        id: 'transaction_expense_5',
        categoryId: 'category_expense_5',
        amount: 3500,
        type: 'expense',
        description: 'ค่าน้ำมันรถเดือนมกราคม',
        date: '2025-01-30T00:00:00.000Z',
        createdAt: '2025-01-30T00:00:00.000Z',
        updatedAt: '2025-01-30T00:00:00.000Z',
        category: {
          id: 'category_expense_5',
          name: 'ค่าใช้จ่ายยานพาหนะ',
          type: 'expense',
          color: '#f97316',
          icon: 'car'
        }
      },
      {
        id: 'transaction_expense_6',
        categoryId: 'category_expense_6',
        amount: 4500,
        type: 'expense',
        description: 'ค่าไฟฟ้า-น้ำเดือนมกราคม',
        date: '2025-01-05T00:00:00.000Z',
        createdAt: '2025-01-05T00:00:00.000Z',
        updatedAt: '2025-01-05T00:00:00.000Z',
        category: {
          id: 'category_expense_6',
          name: 'ค่าไฟฟ้า-น้ำ',
          type: 'expense',
          color: '#06b6d4',
          icon: 'zap'
        }
      },
      {
        id: 'transaction_expense_7',
        categoryId: 'category_expense_7',
        amount: 2200,
        type: 'expense',
        description: 'ค่าอาหารรับรองลูกค้า',
        date: '2025-01-18T00:00:00.000Z',
        createdAt: '2025-01-18T00:00:00.000Z',
        updatedAt: '2025-01-18T00:00:00.000Z',
        category: {
          id: 'category_expense_7',
          name: 'ค่าอาหารและเครื่องดื่ม',
          type: 'expense',
          color: '#84cc16',
          icon: 'utensils'
        }
      },
      {
        id: 'transaction_expense_8',
        categoryId: 'category_expense_8',
        amount: 1500,
        type: 'expense',
        description: 'ค่าซ่อมคอมพิวเตอร์',
        date: '2025-01-22T00:00:00.000Z',
        createdAt: '2025-01-22T00:00:00.000Z',
        updatedAt: '2025-01-22T00:00:00.000Z',
        category: {
          id: 'category_expense_8',
          name: 'ค่าซ่อมแซมและบำรุงรักษา',
          type: 'expense',
          color: '#6366f1',
          icon: 'wrench'
        }
      },
      {
        id: 'transaction_expense_9',
        categoryId: 'category_expense_9',
        amount: 3500,
        type: 'expense',
        description: 'ภาษีเงินได้นิติบุคคลเดือนมกราคม',
        date: '2025-01-31T00:00:00.000Z',
        createdAt: '2025-01-31T00:00:00.000Z',
        updatedAt: '2025-01-31T00:00:00.000Z',
        category: {
          id: 'category_expense_9',
          name: 'ภาษีและค่าธรรมเนียม',
          type: 'expense',
          color: '#dc2626',
          icon: 'file-text'
        }
      },
      {
        id: 'transaction_expense_10',
        categoryId: 'category_expense_2',
        amount: 12000,
        type: 'expense',
        description: 'ค่าเช่าสำนักงานเดือนกุมภาพันธ์',
        date: '2025-02-01T00:00:00.000Z',
        createdAt: '2025-02-01T00:00:00.000Z',
        updatedAt: '2025-02-01T00:00:00.000Z',
        category: {
          id: 'category_expense_2',
          name: 'ค่าใช้จ่ายสำนักงาน',
          type: 'expense',
          color: '#f59e0b',
          icon: 'building'
        }
      },
      {
        id: 'transaction_expense_11',
        categoryId: 'category_expense_3',
        amount: 58000,
        type: 'expense',
        description: 'เงินเดือนพนักงานเดือนกุมภาพันธ์',
        date: '2025-02-25T00:00:00.000Z',
        createdAt: '2025-02-25T00:00:00.000Z',
        updatedAt: '2025-02-25T00:00:00.000Z',
        category: {
          id: 'category_expense_3',
          name: 'เงินเดือนพนักงาน',
          type: 'expense',
          color: '#8b5cf6',
          icon: 'users'
        }
      },
      {
        id: 'transaction_expense_12',
        categoryId: 'category_expense_10',
        amount: 1800,
        type: 'expense',
        description: 'ค่าใช้จ่ายอื่นๆ - ค่าธรรมเนียมธนาคาร',
        date: '2025-02-15T00:00:00.000Z',
        createdAt: '2025-02-15T00:00:00.000Z',
        updatedAt: '2025-02-15T00:00:00.000Z',
        category: {
          id: 'category_expense_10',
          name: 'ค่าใช้จ่ายอื่นๆ',
          type: 'expense',
          color: '#64748b',
          icon: 'more-horizontal'
        }
      }
    ];
    
    // Save initial data to localStorage
    this.saveToStorage();
  }
  
  // Reset method to clear all data
  reset() {
    console.log('🔄 Resetting memory storage...');
    
    // Clear all arrays
    this.teams = [];
    this.members = [];
    this.customers = [];
    this.categories = [];
    this.transactions = [];
    this.salaries = [];
    this.bonuses = [];
    this.commissions = [];
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('businessData');
        console.log('✅ LocalStorage cleared');
      } catch (error) {
        console.error('Error clearing localStorage:', error);
      }
    }
    
    // Reset initialization flag
    this.initialized = false;
    
    console.log('✅ Memory storage reset completed');
  }

  // Salary management methods
  getSalaries() {
    return this.salaries;
  }

  createSalary(data: any) {
    const salary = addTimestamps({
      id: `salary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data
    });
    
    this.salaries.push(salary);
    this.saveToStorage();
    
    console.log('Salary created in memory storage:', salary);
    return salary;
  }

  updateSalary(id: string, data: any) {
    const index = this.salaries.findIndex(s => s.id === id);
    if (index !== -1) {
      this.salaries[index] = addTimestamps({
        ...this.salaries[index],
        ...data
      }, true);
      this.saveToStorage();
      return this.salaries[index];
    }
    return null;
  }

  deleteSalary(id: string) {
    const index = this.salaries.findIndex(s => s.id === id);
    if (index !== -1) {
      const deleted = this.salaries.splice(index, 1)[0];
      this.saveToStorage();
      return deleted;
    }
    return null;
  }

  // Team management methods with timestamps
  createTeam(data: any) {
    const team = addTimestamps({
      id: `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data
    });
    
    this.teams.push(team);
    this.saveToStorage();
    
    console.log('Team created in memory storage:', team);
    return team;
  }

  updateTeam(id: string, data: any) {
    const index = this.teams.findIndex(t => t.id === id);
    if (index !== -1) {
      this.teams[index] = addTimestamps({
        ...this.teams[index],
        ...data
      }, true);
      this.saveToStorage();
      return this.teams[index];
    }
    return null;
  }

  deleteTeam(id: string) {
    const index = this.teams.findIndex(t => t.id === id);
    if (index !== -1) {
      const deleted = this.teams.splice(index, 1)[0];
      this.saveToStorage();
      return deleted;
    }
    return null;
  }

  // Member management methods with timestamps
  createMember(data: any) {
    const member = addTimestamps({
      id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data
    });
    
    this.members.push(member);
    this.saveToStorage();
    
    console.log('Member created in memory storage:', member);
    return member;
  }

  updateMember(id: string, data: any) {
    const index = this.members.findIndex(m => m.id === id);
    if (index !== -1) {
      this.members[index] = addTimestamps({
        ...this.members[index],
        ...data
      }, true);
      this.saveToStorage();
      return this.members[index];
    }
    return null;
  }

  deleteMember(id: string) {
    const index = this.members.findIndex(m => m.id === id);
    if (index !== -1) {
      const deleted = this.members.splice(index, 1)[0];
      this.saveToStorage();
      return deleted;
    }
    return null;
  }

  // Customer management methods with timestamps
  createCustomer(data: any) {
    const customer = addTimestamps({
      id: `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data
    });
    
    this.customers.push(customer);
    this.saveToStorage();
    
    console.log('Customer created in memory storage:', customer);
    return customer;
  }

  updateCustomer(id: string, data: any) {
    const index = this.customers.findIndex(c => c.id === id);
    if (index !== -1) {
      this.customers[index] = addTimestamps({
        ...this.customers[index],
        ...data
      }, true);
      this.saveToStorage();
      return this.customers[index];
    }
    return null;
  }

  deleteCustomer(id: string) {
    const index = this.customers.findIndex(c => c.id === id);
    if (index !== -1) {
      const deleted = this.customers.splice(index, 1)[0];
      this.saveToStorage();
      return deleted;
    }
    return null;
  }

  // Category management methods with timestamps
  createCategory(data: any) {
    const category = addTimestamps({
      id: `category_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data
    });
    
    this.categories.push(category);
    this.saveToStorage();
    
    console.log('Category created in memory storage:', category);
    return category;
  }

  updateCategory(id: string, data: any) {
    const index = this.categories.findIndex(c => c.id === id);
    if (index !== -1) {
      this.categories[index] = addTimestamps({
        ...this.categories[index],
        ...data
      }, true);
      this.saveToStorage();
      return this.categories[index];
    }
    return null;
  }

  deleteCategory(id: string) {
    const index = this.categories.findIndex(c => c.id === id);
    if (index !== -1) {
      const deleted = this.categories.splice(index, 1)[0];
      this.saveToStorage();
      return deleted;
    }
    return null;
  }

  // Transaction management methods with timestamps
  createTransaction(data: any) {
    const transaction = addTimestamps({
      id: `transaction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data
    });
    
    this.transactions.push(transaction);
    this.saveToStorage();
    
    console.log('Transaction created in memory storage:', transaction);
    return transaction;
  }

  updateTransaction(id: string, data: any) {
    const index = this.transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      this.transactions[index] = addTimestamps({
        ...this.transactions[index],
        ...data
      }, true);
      this.saveToStorage();
      return this.transactions[index];
    }
    return null;
  }

  deleteTransaction(id: string) {
    const index = this.transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      const deleted = this.transactions.splice(index, 1)[0];
      this.saveToStorage();
      return deleted;
    }
    return null;
  }

  // Bonus management methods with timestamps
  createBonus(data: any) {
    const bonus = addTimestamps({
      id: `bonus_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data
    });
    
    this.bonuses.push(bonus);
    this.saveToStorage();
    
    console.log('Bonus created in memory storage:', bonus);
    return bonus;
  }

  updateBonus(id: string, data: any) {
    const index = this.bonuses.findIndex(b => b.id === id);
    if (index !== -1) {
      this.bonuses[index] = addTimestamps({
        ...this.bonuses[index],
        ...data
      }, true);
      this.saveToStorage();
      return this.bonuses[index];
    }
    return null;
  }

  deleteBonus(id: string) {
    const index = this.bonuses.findIndex(b => b.id === id);
    if (index !== -1) {
      const deleted = this.bonuses.splice(index, 1)[0];
      this.saveToStorage();
      return deleted;
    }
    return null;
  }

  // Commission management methods with timestamps
  createCommission(data: any) {
    const commission = addTimestamps({
      id: `commission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data
    });
    
    this.commissions.push(commission);
    this.saveToStorage();
    
    console.log('Commission created in memory storage:', commission);
    return commission;
  }

  updateCommission(id: string, data: any) {
    const index = this.commissions.findIndex(c => c.id === id);
    if (index !== -1) {
      this.commissions[index] = addTimestamps({
        ...this.commissions[index],
        ...data
      }, true);
      this.saveToStorage();
      return this.commissions[index];
    }
    return null;
  }

  deleteCommission(id: string) {
    const index = this.commissions.findIndex(c => c.id === id);
    if (index !== -1) {
      const deleted = this.commissions.splice(index, 1)[0];
      this.saveToStorage();
      return deleted;
    }
    return null;
  }
}

// Singleton instance with global state
let memoryStorageInstance: MemoryStorage | null = null;

export const memoryStorage = (() => {
  if (!memoryStorageInstance) {
    memoryStorageInstance = MemoryStorage.getInstance();
    
    // Ensure global persistence on server-side
    if (typeof window === 'undefined' && typeof global !== 'undefined') {
      if (!(global as any).memoryStorageInstance) {
        (global as any).memoryStorageInstance = memoryStorageInstance;
        console.log('Stored memoryStorage in global');
      } else {
        memoryStorageInstance = (global as any).memoryStorageInstance;
        console.log('Using global memoryStorage');
      }
    }
  }
  return memoryStorageInstance;
})();

// Make sure it's the same instance across imports
if (typeof global !== 'undefined') {
  (global as any).memoryStorage = memoryStorage;
}