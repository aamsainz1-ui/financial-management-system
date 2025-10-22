'use client'

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts'

interface SalaryData {
  month: string
  salary: number
  bonus: number
  commission: number
  total: number
}

interface SalaryBonusCommissionChartProps {
  data: SalaryData[]
}

export function SalaryBonusCommissionChart({ data }: SalaryBonusCommissionChartProps) {
  const formatCurrency = (value: number) => {
    return `฿${value.toLocaleString()}`
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-900">
              รวมทั้งหมด: {formatCurrency(payload.reduce((sum: number, entry: any) => sum + entry.value, 0))}
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            bottom: 20,
            left: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="month" 
            tick={{ fill: '#666', fontSize: 12 }}
            tickLine={{ stroke: '#e0e0e0' }}
          />
          <YAxis 
            tick={{ fill: '#666', fontSize: 12 }}
            tickLine={{ stroke: '#e0e0e0' }}
            tickFormatter={formatCurrency}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{
              paddingTop: '20px',
              fontSize: '14px'
            }}
          />
          <Bar
            dataKey="salary"
            fill="#3b82f6"
            name="เงินเดือน"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="bonus"
            fill="#10b981"
            name="โบนัส"
            radius={[4, 4, 0, 0]}
          />
          <Line
            type="monotone"
            dataKey="commission"
            stroke="#f59e0b"
            strokeWidth={3}
            dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
            name="ค่าคอมมิชชัน"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}