'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { format, parseISO, startOfMonth, subMonths, isSameMonth } from 'date-fns'

interface Bill {
  id: string
  name: string
  amount: number
  due_date: string
  status: string
}

export default function SpendingChart({ bills }: { bills: Bill[] }) {
  // Generate last 6 months
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), i)
    return {
      month: format(date, 'MMM'),
      fullDate: startOfMonth(date),
      total: 0
    }
  }).reverse()

  // Aggregate bill amounts into months
  bills.forEach(bill => {
    const billDate = parseISO(bill.due_date)
    const monthData = last6Months.find(m => isSameMonth(m.fullDate, billDate))
    if (monthData) {
      monthData.total += bill.amount
    }
  })

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card text-foreground p-3 rounded-xl shadow-2xl border border-border text-xs font-bold">
          <p className="mb-1 uppercase tracking-widest text-muted">{label}</p>
          <p className="text-lg">${payload[0].value.toFixed(2)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={last6Months} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--card-border)" />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'var(--muted)', fontSize: 10, fontWeight: 800 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: 'var(--muted)', fontSize: 10, fontWeight: 800 }} 
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.1 }} />
          <Bar 
            dataKey="total" 
            radius={[10, 10, 0, 0]} 
            barSize={40}
          >
            {last6Months.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={index === last6Months.length - 1 ? 'var(--accent)' : 'var(--muted)'} 
                className="transition-all duration-300 hover:opacity-80"
                fillOpacity={index === last6Months.length - 1 ? 1 : 0.2}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
