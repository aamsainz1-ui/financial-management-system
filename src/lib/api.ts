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
    getById: (id: string) => fetch(`${API_BASE}/teams/${id}`).then(res => res.json()),
    create: (data: any) => fetch(`${API_BASE}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    update: (id: string, data: any) => fetch(`${API_BASE}/teams/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    delete: (id: string) => fetch(`${API_BASE}/teams/${id}`, {
      method: 'DELETE'
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

  // Members (Legacy)
  members: {
    getAll: () => fetch(`${API_BASE}/members`).then(res => res.json()),
    create: (data: any) => fetch(`${API_BASE}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    update: (id: string, data: any) => fetch(`${API_BASE}/members`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, id })
    }).then(res => res.json()),
    delete: (id: string) => fetch(`${API_BASE}/members?id=${id}`, {
      method: 'DELETE'
    }).then(res => res.json())
  },

  // Salaries
  salaries: {
    getAll: () => fetch(`${API_BASE}/salaries`).then(res => {
      if (!res.ok) throw new Error('Failed to fetch salaries')
      return res.json()
    }),
    create: (data: any) => fetch(`${API_BASE}/salaries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => {
      if (!res.ok) {
        return res.json().then(err => {
          throw new Error(err.error || 'Failed to create salary')
        })
      }
      return res.json()
    }),
    update: (id: string, data: any) => fetch(`${API_BASE}/salaries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => {
      if (!res.ok) {
        return res.json().then(err => {
          throw new Error(err.error || 'Failed to update salary')
        })
      }
      return res.json()
    }),
    delete: (id: string) => fetch(`${API_BASE}/salaries/${id}`, {
      method: 'DELETE'
    }).then(res => {
      if (!res.ok) {
        return res.json().then(err => {
          throw new Error(err.error || 'Failed to delete salary')
        })
      }
      return res.json()
    })
  },

  // Bonuses
  bonuses: {
    getAll: () => fetch(`${API_BASE}/bonuses`).then(res => {
      if (!res.ok) throw new Error('Failed to fetch bonuses')
      return res.json()
    }),
    create: (data: any) => fetch(`${API_BASE}/bonuses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => {
      if (!res.ok) {
        return res.json().then(err => {
          throw new Error(err.error || 'Failed to create bonus')
        })
      }
      return res.json()
    }),
    update: (id: string, data: any) => fetch(`${API_BASE}/bonuses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => {
      if (!res.ok) {
        return res.json().then(err => {
          throw new Error(err.error || 'Failed to update bonus')
        })
      }
      return res.json()
    }),
    delete: (id: string) => fetch(`${API_BASE}/bonuses/${id}`, {
      method: 'DELETE'
    }).then(res => {
      if (!res.ok) {
        return res.json().then(err => {
          throw new Error(err.error || 'Failed to delete bonus')
        })
      }
      return res.json()
    })
  },

  // Commissions
  commissions: {
    getAll: () => fetch(`${API_BASE}/commissions`).then(res => {
      if (!res.ok) throw new Error('Failed to fetch commissions')
      return res.json()
    }),
    create: (data: any) => fetch(`${API_BASE}/commissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => {
      if (!res.ok) {
        return res.json().then(err => {
          throw new Error(err.error || 'Failed to create commission')
        })
      }
      return res.json()
    }),
    update: (id: string, data: any) => fetch(`${API_BASE}/commissions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => {
      if (!res.ok) {
        return res.json().then(err => {
          throw new Error(err.error || 'Failed to update commission')
        })
      }
      return res.json()
    }),
    delete: (id: string) => fetch(`${API_BASE}/commissions/${id}`, {
      method: 'DELETE'
    }).then(res => {
      if (!res.ok) {
        return res.json().then(err => {
          throw new Error(err.error || 'Failed to delete commission')
        })
      }
      return res.json()
    })
  },

  // Dashboard
  dashboard: {
    getData: () => fetch(`${API_BASE}/dashboard`).then(res => res.json())
  },

  // System Management
  system: {
    reset: () => fetch(`${API_BASE}/reset`, {
      method: 'POST'
    }).then(res => res.json()),
    loadSampleData: () => fetch(`${API_BASE}/load-sample-data`, {
      method: 'POST'
    }).then(res => res.json())
  }
}