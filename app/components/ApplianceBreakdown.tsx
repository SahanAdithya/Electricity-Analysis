'use client'
import { useState, useMemo } from 'react'
import { Monitor, Refrigerator, Wind, Tv, Lightbulb, Microwave, Plus, Trash2, Info } from 'lucide-react'

interface Appliance {
  id: string
  name: string
  icon: any
  watts: number
  hoursPerDay: number
}

const PRESETS = [
  { id: '1', name: 'Refrigerator', icon: Refrigerator, watts: 150, hoursPerDay: 24 },
  { id: '2', name: 'Air Conditioner', icon: Wind, watts: 1500, hoursPerDay: 6 },
  { id: '3', name: 'Smart TV', icon: Tv, watts: 100, hoursPerDay: 4 },
  { id: '4', name: 'LED Lights (x10)', icon: Lightbulb, watts: 90, hoursPerDay: 5 },
  { id: '5', name: 'Microwave', icon: Microwave, watts: 1200, hoursPerDay: 0.5 },
]

export default function ApplianceBreakdown({ totalKwh }: { totalKwh: number }) {
  const [selected, setSelected] = useState<Appliance[]>(PRESETS.slice(0, 3))
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleUpdate = (id: string, field: 'watts' | 'hoursPerDay', value: number) => {
    setSelected(selected.map(s => s.id === id ? { ...s, [field]: value } : s))
  }

  const breakdown = useMemo(() => {
    const items = selected.map(app => {
      const dailyKwh = (app.watts * app.hoursPerDay) / 1000
      const monthlyKwh = dailyKwh * 30
      return { ...app, monthlyKwh }
    })

    const estimatedTotal = items.reduce((acc, item) => acc + item.monthlyKwh, 0)
    const otherKwh = Math.max(0, totalKwh - estimatedTotal)

    return {
      items: items.map(item => ({
        ...item,
        percent: totalKwh > 0 ? (item.monthlyKwh / totalKwh) * 100 : 0
      })),
      other: {
        name: 'Other / Standby',
        percent: totalKwh > 0 ? (otherKwh / totalKwh) * 100 : 0,
        kwh: otherKwh
      }
    }
  }, [selected, totalKwh])

  return (
    <div className="bg-card border border-border rounded-[40px] p-10 shadow-sm">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h3 className="text-2xl font-black text-foreground tracking-tight">Appliance Breakdown</h3>
          <p className="text-xs font-bold text-muted uppercase tracking-widest mt-1">Estimated consumption based on your {totalKwh} kWh bill</p>
        </div>
        <div className="flex gap-2">
          {PRESETS.map(preset => (
            <button 
              key={preset.id}
              onClick={() => {
                if (!selected.find(s => s.id === preset.id)) {
                  setSelected([...selected, { ...preset, id: `${preset.id}-${Date.now()}` }])
                }
              }}
              title={`Add ${preset.name}`}
              className="p-3 bg-muted/5 border border-border rounded-2xl text-muted hover:text-accent hover:border-accent transition-all"
            >
              <preset.icon size={18} />
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          {breakdown.items.map((item) => (
            <div key={item.id} className="group relative">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 text-accent rounded-xl">
                    <item.icon size={16} />
                  </div>
                  <span className="text-sm font-black text-foreground uppercase tracking-widest">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted mr-2">{item.percent.toFixed(1)}%</span>
                  <button 
                    onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                    className="p-1.5 text-muted hover:text-accent transition-all"
                  >
                    <Plus size={14} className={editingId === item.id ? 'rotate-45 transition-transform' : ''} />
                  </button>
                  <button 
                    onClick={() => setSelected(selected.filter(s => s.id !== item.id))}
                    className="p-1.5 text-muted hover:text-red-500 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {editingId === item.id ? (
                <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-muted/5 rounded-2xl border border-border animate-in zoom-in-95 duration-200">
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-muted uppercase tracking-widest">Wattage (W)</label>
                    <input 
                      type="number" 
                      value={item.watts}
                      onChange={(e) => handleUpdate(item.id, 'watts', parseInt(e.target.value) || 0)}
                      className="w-full bg-background border border-border p-2 rounded-lg text-xs font-bold focus:ring-1 focus:ring-accent outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] font-black text-muted uppercase tracking-widest">Hours / Day</label>
                    <input 
                      type="number" 
                      step="0.5"
                      value={item.hoursPerDay}
                      onChange={(e) => handleUpdate(item.id, 'hoursPerDay', parseFloat(e.target.value) || 0)}
                      className="w-full bg-background border border-border p-2 rounded-lg text-xs font-bold focus:ring-1 focus:ring-accent outline-none"
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="h-2 w-full bg-muted/10 rounded-full overflow-hidden mb-2">
                    <div 
                      className="h-full bg-accent transition-all duration-1000"
                      style={{ width: `${item.percent}%` }}
                    ></div>
                  </div>
                  <div className="flex gap-4 text-[9px] font-bold text-muted uppercase tracking-widest">
                    <span>{item.watts}W</span>
                    <span>{item.hoursPerDay}h / Day</span>
                    <span>{item.monthlyKwh.toFixed(1)} kWh/mo</span>
                  </div>
                </>
              )}
            </div>
          ))}

          <div className="pt-6 border-t border-border border-dashed">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted/10 text-muted rounded-xl">
                  <Info size={16} />
                </div>
                <span className="text-sm font-black text-muted uppercase tracking-widest">{breakdown.other.name}</span>
              </div>
              <span className="text-xs font-bold text-muted">{breakdown.other.percent.toFixed(1)}%</span>
            </div>
            <div className="h-2 w-full bg-muted/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-muted/30 transition-all duration-1000"
                style={{ width: `${breakdown.other.percent}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center items-center p-10 bg-accent/5 rounded-[40px] border border-accent/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5">
            <Monitor size={200} />
          </div>
          <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-4 text-center">Most Consuming Appliance</p>
          {breakdown.items.length > 0 ? (
            <>
              <div className="w-20 h-20 bg-accent text-background rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-accent/20">
                {(() => {
                  const max = breakdown.items.reduce((prev, current) => (prev.monthlyKwh > current.monthlyKwh) ? prev : current)
                  return <max.icon size={40} />
                })()}
              </div>
              <h4 className="text-2xl font-black text-foreground tracking-tight text-center uppercase">
                {breakdown.items.reduce((prev, current) => (prev.monthlyKwh > current.monthlyKwh) ? prev : current).name}
              </h4>
              <p className="text-sm font-bold text-muted text-center mt-2 max-w-[200px]">
                Accounts for nearly {breakdown.items.reduce((prev, current) => (prev.monthlyKwh > current.monthlyKwh) ? prev : current).percent.toFixed(0)}% of your total energy bill.
              </p>
            </>
          ) : (
            <p className="text-muted font-bold text-center">Add appliances to see breakdown</p>
          )}
        </div>
      </div>
    </div>
  )
}
