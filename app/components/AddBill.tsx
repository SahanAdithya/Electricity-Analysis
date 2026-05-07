'use client'
import { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/utils/supabase'

export default function AddBill({ onBillAdded }: { onBillAdded: () => void }) {
  const { user } = useUser()
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const { error } = await supabase.from('bills').insert({
      user_id: user.id, // Clerk User ID
      name,
      amount: parseFloat(amount),
      due_date: date,
      status: 'unpaid'
    })

    if (error) {
      console.error(error)
      alert("Error saving bill")
    } else {
      setName('')
      setAmount('')
      setDate('')
      onBillAdded() // Refresh the list
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-sm border space-y-4">
      <h2 className="text-xl font-semibold">Add New Bill</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input 
          type="text" placeholder="Bill Name" value={name} required
          onChange={(e) => setName(e.target.value)}
          className="border p-2 rounded text-black"
        />
        <input 
          type="number" step="0.01" placeholder="Amount" value={amount} required
          onChange={(e) => setAmount(e.target.value)}
          className="border p-2 rounded text-black"
        />
        <input 
          type="date" value={date} required
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 rounded text-black"
        />
      </div>
      <button type="submit" className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition">
        Add Bill
      </button>
    </form>
  )
}
