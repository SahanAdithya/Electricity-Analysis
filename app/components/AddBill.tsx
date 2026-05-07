'use client'
import { useState, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/utils/supabase'
import { Plus, CreditCard, Calendar, Tag, LayoutGrid, RefreshCw, Camera, Loader2 } from 'lucide-react'

const CATEGORIES = ['Rent', 'Utilities', 'Subscriptions', 'Food', 'Transport', 'Other']

export default function AddBill({ onBillAdded }: { onBillAdded: () => void }) {
  const { user } = useUser()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [category, setCategory] = useState('Other')
  const [isRecurring, setIsRecurring] = useState(false)
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setLoading(true)

    const { error } = await supabase.from('bills').insert({
      user_id: user.id,
      name,
      amount: parseFloat(amount),
      due_date: date,
      category,
      is_recurring: isRecurring,
      status: 'unpaid'
    })

    setLoading(false)

    if (error) {
      console.error(error)
      alert("Error saving bill")
    } else {
      setName('')
      setAmount('')
      setDate('')
      setCategory('Other')
      setIsRecurring(false)
      onBillAdded()
    }
  }

  const handleScanReceipt = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setScanning(true)
    const reader = new FileReader()
    reader.onloadend = async () => {
      try {
        const base64 = reader.result as string
        const response = await fetch('/api/scan-receipt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64 })
        })
        const data = await response.json()
        if (data.error) throw new Error(data.error)

        if (data.name) setName(data.name)
        if (data.amount) setAmount(data.amount.toString())
        if (data.date) setDate(data.date)
        
        // Try to guess category based on name
        const lowerName = data.name?.toLowerCase() || ''
        if (lowerName.includes('rent')) setCategory('Rent')
        else if (lowerName.includes('electric') || lowerName.includes('water') || lowerName.includes('gas')) setCategory('Utilities')
        else if (lowerName.includes('netflix') || lowerName.includes('spotify')) setCategory('Subscriptions')
        
      } catch (err: any) {
        alert("Scan failed: " + err.message)
      } finally {
        setScanning(false)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <form onSubmit={handleSubmit} className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 space-y-6 transition-all hover:shadow-md">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-black text-white rounded-lg">
            <Plus size={20} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Add New Bill</h2>
        </div>
        
        <div className="flex items-center gap-4">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleScanReceipt} 
            accept="image/*" 
            className="hidden" 
          />
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={scanning}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-all text-black disabled:opacity-50"
          >
            {scanning ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
            {scanning ? 'Scanning...' : 'Scan Receipt'}
          </button>

          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative">
              <input 
                type="checkbox" 
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-gray-400 group-hover:text-black transition-colors flex items-center gap-1.5">
              <RefreshCw size={12} className={isRecurring ? 'animate-spin-slow' : ''} />
              Monthly
            </span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Tag size={12} /> Bill Name
          </label>
          <input 
            type="text" placeholder="e.g. Rent" value={name} required
            onChange={(e) => setName(e.target.value)}
            className="w-full border-gray-200 border p-3 rounded-xl text-black focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none bg-gray-50/50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <LayoutGrid size={12} /> Category
          </label>
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border-gray-200 border p-3 rounded-xl text-black focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none bg-gray-50/50"
          >
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <CreditCard size={12} /> Amount
          </label>
          <input 
            type="number" step="0.01" placeholder="0.00" value={amount} required
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border-gray-200 border p-3 rounded-xl text-black focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none bg-gray-50/50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Calendar size={12} /> Due Date
          </label>
          <input 
            type="date" value={date} required
            onChange={(e) => setDate(e.target.value)}
            className="w-full border-gray-200 border p-3 rounded-xl text-black focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none bg-gray-50/50"
          />
        </div>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? 'Adding...' : 'Create Bill Entry'}
      </button>
    </form>
  )
}
