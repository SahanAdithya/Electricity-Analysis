'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import { X } from 'lucide-react'

const CATEGORIES = ['Rent', 'Utilities', 'Subscriptions', 'Food', 'Transport', 'Other']

interface Bill {
  id: string
  name: string
  amount: number
  due_date: string
  status: string
  category?: string
}

interface EditBillModalProps {
  bill: Bill
  isOpen: boolean
  onClose: () => void
  onBillUpdated: () => void
}

export default function EditBillModal({ bill, isOpen, onClose, onBillUpdated }: EditBillModalProps) {
  const [name, setName] = useState(bill.name)
  const [amount, setAmount] = useState(bill.amount.toString())
  const [date, setDate] = useState(bill.due_date)
  const [category, setCategory] = useState(bill.category || 'Other')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setName(bill.name)
    setAmount(bill.amount.toString())
    setDate(bill.due_date)
    setCategory(bill.category || 'Other')
  }, [bill])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from('bills')
      .update({
        name,
        amount: parseFloat(amount),
        due_date: date,
        category
      })
      .eq('id', bill.id)

    setLoading(false)

    if (error) {
      console.error(error)
      alert("Error updating bill")
    } else {
      onBillUpdated()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-900">Edit Bill</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bill Name</label>
            <input 
              type="text" 
              value={name} 
              required
              onChange={(e) => setName(e.target.value)}
              className="w-full border-gray-200 border p-3 rounded-xl text-black focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none"
              placeholder="e.g. Electricity"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border-gray-200 border p-3 rounded-xl text-black focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input 
              type="number" 
              step="0.01" 
              value={amount} 
              required
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border-gray-200 border p-3 rounded-xl text-black focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input 
              type="date" 
              value={date} 
              required
              onChange={(e) => setDate(e.target.value)}
              className="w-full border-gray-200 border p-3 rounded-xl text-black focus:ring-2 focus:ring-black focus:border-transparent transition-all outline-none"
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
