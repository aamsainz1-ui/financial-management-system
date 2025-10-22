'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface ExpenseData {
  name: string
  value: number
  color: string
}

interface ExpensePieChartProps {
  data: ExpenseData[]
}

const COLORS = {
  'ค่าอาหาร': '#10b981',
  'ค่าเช่า': '#3b82f6', 
  'สาธารณูปโภค': '#f59e0b',
  'บันเทิง': '#8b5cf6',
  'ค่าจ้าง': '#ef4444',
  'ค่าสื่อสาร': '#06b6d4',
  'ค่าไฟฟ้าและน้ำ': '#f97316',
  'อุปกรณ์สำนักงาน': '#84cc16',
  'อื่นๆ': '#6b7280'
}

export function ExpensePieChart({ data }: ExpensePieChartProps) {
  const formatCurrency = (value: number) => {
    return `฿${value.toLocaleString()}`
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      const total = payload.reduce((sum: number, entry: any) => sum + entry.value, 0)
      const percentage = ((data.value / total) * 100).toFixed(1)
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            จำนวน: {formatCurrency(data.value)}
          </p>
          <p className="text-sm text-gray-600">
            สัดส่วน: {percentage}%
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    if (percent < 0.05) return null // ไม่แสดง label ถ้าน้อยกว่า 5%

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  const processedData = data.map(item => ({
    ...item,
    color: COLORS[item.name as keyof typeof COLORS] || COLORS['อื่นๆ']
  }))

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={processedData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={CustomLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {processedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value: string) => (
              <span className="text-sm">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}