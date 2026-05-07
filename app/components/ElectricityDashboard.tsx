'use client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Zap, TrendingDown, TrendingUp, DollarSign, Activity, Leaf, TreePine, Globe } from 'lucide-react'
import { format, parseISO, startOfMonth, subMonths, isSameMonth } from 'date-fns'

interface Bill {
  id: string
  name: string
  amount: number
  due_date: string
  status: string
  category?: string
  units_consumed?: number
}

export default function ElectricityDashboard({ bills }: { bills: Bill[] }) {
  const electricityBills = bills
    .filter(b => b.category === 'Electricity')
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())

  const latestBill = electricityBills[electricityBills.length - 1]
  const previousBill = electricityBills[electricityBills.length - 2]

  const consumptionTrend = latestBill && previousBill 
    ? ((latestBill.units_consumed || 0) - (previousBill.units_consumed || 0)) 
    : 0
    
  const trendPercent = previousBill && previousBill.units_consumed
    ? (consumptionTrend / previousBill.units_consumed) * 100
    : 0

  const co2Factor = 0.475 // kg CO2 per kWh

  const chartData = electricityBills.slice(-6).map(b => ({
    date: format(parseISO(b.due_date), 'MMM'),
    kWh: b.units_consumed || 0,
    cost: b.amount,
    co2: (b.units_consumed || 0) * co2Factor
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card text-foreground p-4 rounded-2xl shadow-2xl border border-border text-xs">
          <p className="mb-2 font-black uppercase tracking-widest text-muted">{label}</p>
          <div className="space-y-1">
            <p className="flex justify-between gap-4">
              <span className="text-muted">Usage:</span>
              <span className="font-bold text-accent">{payload[0].value} kWh</span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-muted">Impact:</span>
              <span className="font-bold text-green-500">{payload[2].value.toFixed(1)} kg CO₂</span>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-muted">Cost:</span>
              <span className="font-bold">${payload[1].value.toFixed(2)}</span>
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  const latestKwh = latestBill?.units_consumed || 0
  const latestEmissions = latestKwh * co2Factor
  const treesNeeded = latestEmissions / 1.75 // Average tree absorbs 1.75kg CO2/month

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="md:col-span-2 p-8 bg-accent text-background rounded-[40px] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
            <Zap size={120} />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={16} className="fill-current" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Current Consumption</span>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-6xl font-black tracking-tighter">
                {latestKwh}
              </h3>
              <span className="text-xl font-bold opacity-70">kWh</span>
            </div>
            <p className="mt-4 text-sm font-bold opacity-80 max-w-[200px]">
              Usage is {Math.abs(trendPercent).toFixed(1)}% {trendPercent > 0 ? 'higher' : 'lower'} than last month.
            </p>
          </div>
        </div>

        {/* Planet Impact Card */}
        <div className="p-8 bg-green-500 text-white rounded-[40px] shadow-2xl relative overflow-hidden group">
          <div className="absolute -bottom-4 -right-4 opacity-10 group-hover:scale-110 transition-transform">
            <Leaf size={100} />
          </div>
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Globe size={16} className="opacity-70" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Planet Impact</span>
              </div>
              <h3 className="text-3xl font-black tracking-tighter">
                {latestEmissions.toFixed(1)} <span className="text-sm font-bold opacity-70">kg CO₂</span>
              </h3>
            </div>
            <div className="mt-4 flex items-center gap-2 bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
              <TreePine size={18} />
              <p className="text-[10px] font-bold uppercase tracking-wider leading-tight">
                Requires {Math.ceil(treesNeeded)} trees to offset this month
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 bg-card border border-border rounded-[40px] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 text-muted">
              <DollarSign size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Avg. Unit Cost</span>
            </div>
            <h3 className="text-4xl font-black text-foreground">
              ${latestBill && latestBill.units_consumed ? (latestBill.amount / latestBill.units_consumed).toFixed(2) : '0.00'}
            </h3>
            <p className="text-[10px] font-black text-muted uppercase tracking-widest mt-2">Per kWh</p>
          </div>
          <div className={`mt-6 flex items-center gap-2 text-xs font-bold ${trendPercent > 0 ? 'text-red-500' : 'text-green-500'}`}>
            {trendPercent > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{Math.abs(trendPercent).toFixed(1)}% trend</span>
          </div>
        </div>

        <div className="p-8 bg-card border border-border rounded-[40px] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 text-muted">
              <Activity size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Efficiency Score</span>
            </div>
            <h3 className="text-4xl font-black text-foreground">
              {trendPercent < 0 ? 'A+' : trendPercent < 5 ? 'B' : 'C'}
            </h3>
            <p className="text-[10px] font-black text-muted uppercase tracking-widest mt-2">Based on usage trends</p>
          </div>
          <div className="mt-6 h-1.5 w-full bg-muted/10 rounded-full overflow-hidden">
            <div 
              className={`h-full bg-accent transition-all duration-1000`}
              style={{ width: `${100 - Math.min(100, Math.max(0, trendPercent + 50))}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Analysis Chart */}
      <div className="p-10 bg-card border border-border rounded-[40px] shadow-sm">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h3 className="text-2xl font-black text-foreground tracking-tight">Electricity Usage Analysis</h3>
            <p className="text-xs font-bold text-muted uppercase tracking-widest mt-1">Comparison of kWh vs Cost (Last 6 Months)</p>
          </div>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted">kWh Usage</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted">Carbon Footprint</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-muted/30"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-muted">Bill Cost ($)</span>
            </div>
          </div>
        </div>
        
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorKwh" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--card-border)" />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--muted)', fontSize: 10, fontWeight: 800 }} 
                dy={15}
              />
              <YAxis 
                yAxisId="left"
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--muted)', fontSize: 10, fontWeight: 800 }} 
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--muted)', fontSize: 10, fontWeight: 800 }} 
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="kWh" 
                stroke="var(--accent)" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorKwh)" 
              />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="co2" 
                stroke="#22c55e" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorCo2)" 
              />
              <Area 
                yAxisId="right"
                type="monotone" 
                dataKey="cost" 
                stroke="var(--muted)" 
                strokeWidth={2}
                strokeDasharray="5 5"
                fill="transparent"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
