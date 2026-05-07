'use client'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface Bill {
  id: string
  name: string
  amount: number
  due_date: string
  status: string
  category?: string
}

const COLORS = ['var(--accent)', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function CategoryBreakdown({ bills }: { bills: Bill[] }) {
  // Aggregate by category
  const dataMap: Record<string, number> = {}
  bills.forEach(bill => {
    const cat = bill.category || 'Other'
    dataMap[cat] = (dataMap[cat] || 0) + bill.amount
  })

  const data = Object.entries(dataMap).map(([name, value]) => ({ name, value }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card text-foreground p-3 rounded-xl shadow-2xl border border-border text-xs font-bold">
          <p className="mb-1 uppercase tracking-widest text-muted">{payload[0].name}</p>
          <p className="text-lg">${payload[0].value.toFixed(2)}</p>
        </div>
      )
    }
    return null
  }

  if (data.length === 0) {
    return <div className="h-full flex items-center justify-center text-muted italic">No data available</div>
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={8}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                stroke="var(--card-bg)" 
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            formatter={(value) => <span className="text-[10px] font-black text-muted uppercase tracking-[0.15em]">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
