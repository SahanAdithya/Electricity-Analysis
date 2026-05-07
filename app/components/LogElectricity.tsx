'use client'
import { useState } from 'react'
import { supabase } from '@/utils/supabase'
import { useUser } from '@clerk/nextjs'
import { Zap, Calendar, DollarSign, Loader2, Plus, X, AlertCircle } from 'lucide-react'
import { format, parseISO } from 'date-fns'

export default function LogElectricity({ onLogged }: { onLogged: () => void }) {
  const { user } = useUser()
  const [isOpen, setIsOpen] = useState(false)
  const [amount, setAmount] = useState('')
  const [kWh, setKWh] = useState('')
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(false)

  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)
    setErrorMsg(null)

    try {
      const { error } = await supabase
        .from('bills')
        .insert({
          user_id: user.id,
          name: `Electricity Bill - ${format(parseISO(date), 'MMM yyyy')}`,
          amount: parseFloat(amount),
          due_date: date,
          category: 'Electricity',
          units_consumed: parseFloat(kWh),
          status: 'paid'
        })

      if (error) throw error

      setAmount('')
      setKWh('')
      setDate('')
      setIsOpen(false)
      onLogged()
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || "Failed to save reading. Check your connection or table schema.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-6 py-3 bg-accent text-background rounded-2xl font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-accent/20"
      >
        <Plus size={18} /> Log Energy Usage
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-md p-8 rounded-[40px] border border-border shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6">
              <button onClick={() => setIsOpen(false)} className="text-muted hover:text-foreground">
                <X size={24} />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-accent/10 text-accent rounded-xl flex items-center justify-center">
                <Zap size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-foreground tracking-tight">Log Electricity Data</h2>
                <p className="text-[10px] font-bold text-muted uppercase tracking-widest">Entry for Analyst Insights</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                  <DollarSign size={12} className="text-accent" /> Total Bill Amount ($)
                </label>
                <input 
                  type="number" step="0.01" required value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-background/50 border border-border p-4 rounded-2xl text-foreground focus:ring-2 focus:ring-accent transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                  <Zap size={12} className="text-accent" /> Units Consumed (kWh)
                </label>
                <input 
                  type="number" step="0.1" required value={kWh}
                  onChange={(e) => setKWh(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-background/50 border border-border p-4 rounded-2xl text-foreground focus:ring-2 focus:ring-accent transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                  <Calendar size={12} className="text-accent" /> Reading/Due Date
                </label>
                <input 
                  type="date" required value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-background/50 border border-border p-4 rounded-2xl text-foreground focus:ring-2 focus:ring-accent transition-all outline-none"
                />
              </div>

              {errorMsg && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2">
                  <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest leading-relaxed">
                    {errorMsg}
                  </p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-5 bg-foreground text-background rounded-2xl font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Save Reading'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
