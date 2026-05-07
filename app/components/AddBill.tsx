'use client'
import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/utils/supabase'
import { Plus, CreditCard, Calendar, Tag, LayoutGrid } from 'lucide-react'

const CATEGORIES = ['Rent', 'Utilities', 'Subscriptions', 'Food', 'Transport', 'Other']

export default function AddBill({ onBillAdded }: { onBillAdded: () => void }) {
  const { user } = useUser()
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [category, setCategory] = useState('Other')
  const [loading, setLoading] = useState(false)

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
      onBillAdded()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 space-y-6 transition-all hover:shadow-md">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-black text-white rounded-lg">
          <Plus size={20} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Add New Bill</h2>
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
