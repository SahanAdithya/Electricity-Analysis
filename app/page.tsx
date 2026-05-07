'use client'
import { useState, useEffect, useCallback } from 'react'
import { UserButton, useUser } from "@clerk/nextjs"
import { supabase } from '@/utils/supabase'
import AddBill from "@/app/components/AddBill"

interface Bill {
  id: string
  name: string
  amount: number
  due_date: string
  status: string
}

export default function Home() {
  const { user } = useUser()
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)

  const fetchBills = useCallback(async () => {
    if (!user) return
    
    setLoading(true)
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('user_id', user.id)
      .order('due_date', { ascending: true })

    if (error) {
      console.error('Error fetching bills:', error)
    } else {
      setBills(data || [])
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (user) {
      fetchBills()
    }
  }, [user, fetchBills])

  return (
    <main className="max-w-4xl mx-auto p-8">
      <header className="flex justify-between items-center mb-12">
        <h1 className="text-3xl font-bold">Bill Tracker</h1>
        <UserButton />
      </header>

      <section className="mb-12">
        <AddBill onBillAdded={fetchBills} />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Your Upcoming Bills</h2>
        
        {loading ? (
          <div className="text-gray-500 italic">Loading your bills...</div>
        ) : bills.length > 0 ? (
          <div className="space-y-4">
            {bills.map((bill) => (
              <div key={bill.id} className="p-4 bg-white rounded-lg shadow-sm border flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-black">{bill.name}</h3>
                  <p className="text-sm text-gray-500">Due: {new Date(bill.due_date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-black">${bill.amount.toFixed(2)}</p>
                  <span className={`text-xs uppercase font-bold ${bill.status === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                    {bill.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 italic">No bills found. Add one above!</div>
        )}
      </section>
    </main>
  );
}
