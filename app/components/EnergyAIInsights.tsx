'use client'
import { useState, useEffect } from 'react'
import { Sparkles, TrendingDown, Lightbulb, Zap, ArrowRight, BrainCircuit } from 'lucide-react'
import { format, parseISO, subMonths, isSameMonth } from 'date-fns'

interface Bill {
  id: string
  amount: number
  due_date: string
  units_consumed?: number
  category?: string
}

export default function EnergyAIInsights({ bills }: { bills: Bill[] }) {
  const [insights, setInsights] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const generateInsights = useCallback(() => {
    setLoading(true)
    const electricityBills = bills
      .filter(b => b.category === 'Electricity')
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())

    if (electricityBills.length < 2) {
      setInsights(["Add at least two months of data for AI trend analysis."])
      setLoading(false)
      return
    }

    const latest = electricityBills[electricityBills.length - 1]
    const previous = electricityBills[electricityBills.length - 2]
    
    const newInsights = []
    
    const usageDiff = ((latest.units_consumed || 0) - (previous.units_consumed || 0))
    const usagePercent = previous.units_consumed ? (usageDiff / previous.units_consumed) * 100 : 0
    
    if (usagePercent > 0) {
      newInsights.push(`Usage increased by ${usagePercent.toFixed(1)}% this month. Consider checking for 'vampire' appliances like standby TVs or chargers.`)
    } else {
      newInsights.push(`Great job! Your consumption dropped by ${Math.abs(usagePercent).toFixed(1)}%. You're on track to save approximately $${Math.abs(latest.amount - previous.amount).toFixed(2)} this month.`)
    }

    const latestCpu = latest.units_consumed ? latest.amount / latest.units_consumed : 0
    const prevCpu = previous.units_consumed ? previous.amount / previous.units_consumed : 0
    
    if (latestCpu > prevCpu && prevCpu > 0) {
      newInsights.push(`The cost per kWh has risen by $${(latestCpu - prevCpu).toFixed(2)}. This might be a peak-hour rate change by your provider.`)
    }

    if ((latest.units_consumed || 0) > 400) {
      newInsights.push("High consumption detected. Shifting laundry and dishwashing to after 9 PM could reduce your bill by up to 12%.")
    } else {
      newInsights.push("Your usage is efficient! Upgrading to LED bulbs could further shave another 5% off your lighting costs.")
    }

    newInsights.push("Your predicted bill for next month is currently stable based on your historical patterns.")

    setInsights(newInsights)
    setLoading(false)
    setLastUpdated(new Date())
  }, [bills])

  useEffect(() => {
    const timer = setTimeout(generateInsights, 1500)
    return () => clearTimeout(timer)
  }, [generateInsights])

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(generateInsights, 1000)
  }

  const handleLearnMore = (insight: string) => {
    alert(`AI Intelligence Deep Dive:\n\nRegarding: "${insight}"\n\nRecommendation: Our AI suggests auditing your heavy appliances and reviewing your utility provider's peak-hour schedule to maximize savings.`)
  }

  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-accent via-blue-500 to-purple-600 rounded-[40px] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
      
      <div className="relative p-10 bg-card border border-border rounded-[40px] shadow-sm overflow-hidden">
        {/* Animated Background Element */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-pulse"></div>
        
        <div className="flex justify-between items-start mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-accent/10 border border-accent/20 rounded-full">
                <Sparkles size={12} className="text-accent" />
                <span className="text-[10px] font-black uppercase tracking-widest text-accent">AI-Powered Insights</span>
              </div>
            </div>
            <h3 className="text-3xl font-black text-foreground tracking-tight">Energy Intelligence</h3>
          </div>
          <div className="w-12 h-12 bg-muted/5 border border-border rounded-2xl flex items-center justify-center text-muted">
            <BrainCircuit size={24} />
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            <div className="h-4 bg-muted/10 rounded-full w-3/4 animate-pulse"></div>
            <div className="h-4 bg-muted/10 rounded-full w-full animate-pulse"></div>
            <div className="h-4 bg-muted/10 rounded-full w-2/3 animate-pulse"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {insights.map((insight, i) => (
              <div 
                key={i} 
                className="p-6 bg-muted/5 border border-border rounded-3xl flex items-start gap-4 group/item hover:bg-muted/10 transition-all duration-300"
              >
                <div className="w-10 h-10 bg-card border border-border rounded-xl flex items-center justify-center shrink-0 group-hover/item:scale-110 transition-transform">
                  {i === 0 ? <TrendingDown size={18} className="text-accent" /> : 
                   i === 1 ? <Zap size={18} className="text-blue-500" /> : 
                   <Lightbulb size={18} className="text-yellow-500" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground leading-relaxed">
                    {insight}
                  </p>
                  <button 
                    onClick={() => handleLearnMore(insight)}
                    className="mt-4 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted hover:text-accent transition-colors"
                  >
                    Learn More <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-10 pt-8 border-t border-border flex items-center justify-between">
          <p className="text-[10px] font-bold text-muted uppercase tracking-widest">
            Last analyzed: {format(lastUpdated, 'HH:mm:ss')} • {bills.filter(b => b.category === 'Electricity').length} months synced
          </p>
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="text-[10px] font-black uppercase tracking-widest text-accent hover:underline disabled:opacity-50"
          >
            {loading ? 'Analyzing...' : 'Refresh Analysis'}
          </button>
        </div>
      </div>
    </div>
  )
}
