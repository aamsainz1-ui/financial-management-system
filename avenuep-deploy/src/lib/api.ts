const API_BASE = '/api'

export const api = {
  // Transactions
  transactions: {
    getAll: () => fetch(`${API_BASE}/transactions`).then(res => res.json()),
    getById: (id: string) => fetch(`${API_BASE}/transactions/${id}`).then(res => res.json()),
    create: (data: any) => fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    update: (id: string, data: any) => fetch(`${API_BASE}/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    delete: (id: string) => fetch(`${API_BASE}/transactions/${id}`, {
      method: 'DELETE'
    }).then(res => res.json())
  },

  // Teams
  teams: {
    getAll: () => fetch(`${API_BASE}/teams`).then(res => res.json()),
    create: (data: any) => fetch(`${API_BASE}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json())
  },

  // Categories
  categories: {
    getAll: () => fetch(`${API_BASE}/categories`).then(res => res.json()),
    create: (data: any) => fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json())
  },

  // Members (Legacy - use employees instead)
  members: {
    getAll: () => fetch(`${API_BASE}/members`).then(res => res.json()),
    create: (data: any) => fetch(`${API_BASE}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json())
  },

  // Employees
  employees: {
    getAll: () => fetch(`${API_BASE}/employees`).then(res => res.json()),
    getById: (id: string) => fetch(`${API_BASE}/employees/${id}`).then(res => res.json()),
    create: (data: any) => fetch(`${API_BASE}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    update: (id: string, data: any) => fetch(`${API_BASE}/employees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    delete: (id: string) => fetch(`${API_BASE}/employees/${id}`, {
      method: 'DELETE'
    }).then(res => res.json())
  },

  // Salaries
  salaries: {
    getAll: () => fetch(`${API_BASE}/salaries`).then(res => res.json()),
    create: (data: any) => fetch(`${API_BASE}/salaries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    update: (id: string, data: any) => fetch(`${API_BASE}/salaries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    delete: (id: string) => fetch(`${API_BASE}/salaries/${id}`, {
      method: 'DELETE'
    }).then(res => res.json())
  },

  // Bonuses
  bonuses: {
    getAll: () => fetch(`${API_BASE}/bonuses`).then(res => res.json()),
    create: (data: any) => fetch(`${API_BASE}/bonuses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    update: (id: string, data: any) => fetch(`${API_BASE}/bonuses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    delete: (id: string) => fetch(`${API_BASE}/bonuses/${id}`, {
      method: 'DELETE'
    }).then(res => res.json())
  },

  // Commissions
  commissions: {
    getAll: () => fetch(`${API_BASE}/commissions`).then(res => res.json()),
    create: (data: any) => fetch(`${API_BASE}/commissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    update: (id: string, data: any) => fetch(`${API_BASE}/commissions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    delete: (id: string) => fetch(`${API_BASE}/commissions/${id}`, {
      method: 'DELETE'
    }).then(res => res.json())
  },

  // Dashboard
  dashboard: {
    getData: () => fetch(`${API_BASE}/dashboard`).then(res => res.json())
  }
}