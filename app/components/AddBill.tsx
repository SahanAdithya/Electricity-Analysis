'use client'
import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/utils/supabase'
import { Plus, CreditCard, Calendar, Tag, LayoutGrid, RefreshCw } from 'lucide-react'

const CATEGORIES = ['Rent', 'Utilities', 'Subscriptions', 'Food', 'Transport', 'Other']

interface Roommate {
  name: string
  amount: string
}

export default function AddBill({ onBillAdded }: { onBillAdded: () => void }) {
  const { user } = useUser()
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [category, setCategory] = useState('Other')
  const [isRecurring, setIsRecurring] = useState(false)
  const [isSplit, setIsSplit] = useState(false)
  const [roommates, setRoommates] = useState<Roommate[]>([{ name: '', amount: '' }])
  const [loading, setLoading] = useState(false)

  const handleAddRoommate = () => setRoommates([...roommates, { name: '', amount: '' }])
  const handleRemoveRoommate = (index: number) => setRoommates(roommates.filter((_, i) => i !== index))
  const handleRoommateChange = (index: number, field: keyof Roommate, value: string) => {
    const newRoommates = [...roommates]
    newRoommates[index][field] = value
    setRoommates(newRoommates)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)

    // Insert bill
    const { data: billData, error: billError } = await supabase
      .from('bills')
      .insert({
        user_id: user.id,
        name,
        amount: parseFloat(amount),
        due_date: date,
        category,
        is_recurring: isRecurring,
        status: 'unpaid'
      })
      .select()
      .single()

    if (billError) {
      console.error(billError)
      alert("Error saving bill")
      setLoading(false)
      return
    }

    // Insert shares if split
    if (isSplit && billData) {
      const sharesToInsert = roommates
        .filter(r => r.name && r.amount)
        .map(r => ({
          bill_id: billData.id,
          person_name: r.name,
          amount: parseFloat(r.amount),
          status: 'unpaid'
        }))

      if (sharesToInsert.length > 0) {
        const { error: shareError } = await supabase.from('bill_shares').insert(sharesToInsert)
        if (shareError) console.error("Error saving shares:", shareError)
      }
    }

    setLoading(false)
    setName('')
    setAmount('')
    setDate('')
    setCategory('Other')
    setIsRecurring(false)
    setIsSplit(false)
    setRoommates([{ name: '', amount: '' }])
    onBillAdded()
  }

  return (
    <form onSubmit={handleSubmit} className="p-8 bg-card rounded-2xl shadow-sm border border-border space-y-6 transition-all hover:shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent text-background rounded-lg">
            <Plus size={20} />
          </div>
          <h2 className="text-xl font-bold text-foreground">Add New Bill</h2>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative">
              <input 
                type="checkbox" 
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-muted/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted group-hover:text-foreground transition-colors">
              Recurring
            </span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative">
              <input 
                type="checkbox" 
                checked={isSplit}
                onChange={(e) => setIsSplit(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-muted/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-background after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted group-hover:text-foreground transition-colors">
              Split with Roommates
            </span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* ... existing fields ... */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-2">
            <Tag size={12} /> Bill Name
          </label>
          <input 
            type="text" placeholder="e.g. Rent" value={name} required
            onChange={(e) => setName(e.target.value)}
            className="w-full border-border border p-3 rounded-xl text-foreground focus:ring-2 focus:ring-accent focus:border-transparent transition-all outline-none bg-background/50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-2">
            <LayoutGrid size={12} /> Category
          </label>
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border-border border p-3 rounded-xl text-foreground focus:ring-2 focus:ring-accent focus:border-transparent transition-all outline-none bg-background/50"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-2">
            <CreditCard size={12} /> Total Amount
          </label>
          <input 
            type="number" step="0.01" placeholder="0.00" value={amount} required
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border-border border p-3 rounded-xl text-foreground focus:ring-2 focus:ring-accent focus:border-transparent transition-all outline-none bg-background/50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-2">
            <Calendar size={12} /> Due Date
          </label>
          <input 
            type="date" value={date} required
            onChange={(e) => setDate(e.target.value)}
            className="w-full border-border border p-3 rounded-xl text-foreground focus:ring-2 focus:ring-accent focus:border-transparent transition-all outline-none bg-background/50"
          />
        </div>
      </div>

      {isSplit && (
        <div className="pt-6 border-t border-border animate-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Roommate Shares</h3>
            <button 
              type="button" 
              onClick={handleAddRoommate}
              className="text-[10px] font-black uppercase tracking-widest text-accent hover:opacity-70 transition-opacity"
            >
              + Add Roommate
            </button>
          </div>
          <div className="space-y-3">
            {roommates.map((roommate, index) => (
              <div key={index} className="flex gap-4 items-center">
                <input 
                  type="text" placeholder="Name" value={roommate.name}
                  onChange={(e) => handleRoommateChange(index, 'name', e.target.value)}
                  className="flex-1 border-border border p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-accent focus:border-transparent transition-all outline-none bg-background/50 text-foreground"
                />
                <input 
                  type="number" step="0.01" placeholder="Amount" value={roommate.amount}
                  onChange={(e) => handleRoommateChange(index, 'amount', e.target.value)}
                  className="w-32 border-border border p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-accent focus:border-transparent transition-all outline-none bg-background/50 text-foreground"
                />
                {roommates.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => handleRemoveRoommate(index)}
                    className="p-2 text-muted hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-accent text-background py-4 rounded-xl font-bold hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? 'Adding...' : 'Create Bill Entry'}
      </button>
    </form>
  )
}
