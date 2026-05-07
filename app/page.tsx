'use client'
import { useState, useEffect, useCallback } from 'react'
import { UserButton, useUser } from "@clerk/nextjs"
import { supabase } from '@/utils/supabase'
import AddBill from "@/app/components/AddBill"
import EditBillModal from "@/app/components/EditBillModal"
import { Trash2, Edit2, CheckCircle, Clock, MoreVertical } from 'lucide-react'

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
  const [editingBill, setEditingBill] = useState<Bill | null>(null)

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

  const handleMarkAsPaid = async (billId: string) => {
    const { error } = await supabase
      .from('bills')
      .update({ status: 'paid' })
      .eq('id', billId)

    if (error) {
      console.error(error)
      alert("Error updating status")
    } else {
      fetchBills()
    }
  }

  const handleDelete = async (billId: string) => {
    if (!confirm("Are you sure you want to delete this bill?")) return

    const { error } = await supabase
      .from('bills')
      .delete()
      .eq('id', billId)

    if (error) {
      console.error(error)
      alert("Error deleting bill")
    } else {
      fetchBills()
    }
  }

  return (
    <main className="min-h-screen bg-[#fafafa] text-black pb-20">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white rounded-sm rotate-45"></div>
            </div>
            <h1 className="text-xl font-bold tracking-tight">Antigravity Bills</h1>
          </div>
          <UserButton afterSignOutUrl="/"/>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 pt-12 space-y-12">
        <section>
          <div className="mb-8">
            <h2 className="text-4xl font-black mb-2 tracking-tight">Dashboard</h2>
            <p className="text-gray-500 font-medium">Keep track of your monthly home expenses.</p>
          </div>
          <AddBill onBillAdded={fetchBills} />
        </section>

        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Your Upcoming Bills</h2>
            <div className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
              Total: ${bills.reduce((acc, b) => acc + (b.status === 'unpaid' ? b.amount : 0), 0).toFixed(2)} pending
            </div>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-2xl border border-gray-200"></div>
              ))}
            </div>
          ) : bills.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bills.map((bill) => (
                <div 
                  key={bill.id} 
                  className={`group relative p-6 bg-white rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between h-full ${bill.status === 'paid' ? 'opacity-75' : ''}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-black transition-colors">{bill.name}</h3>
                      <div className="flex items-center gap-1.5 text-gray-400 mt-1">
                        <Clock size={14} />
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Due: {new Date(bill.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setEditingBill(bill)}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-black transition-colors"
                        title="Edit Bill"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(bill.id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete Bill"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-end mt-4">
                    <div>
                      <p className="text-3xl font-black text-gray-900 leading-none">
                        ${bill.amount.toFixed(2)}
                      </p>
                      <div className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        bill.status === 'paid' 
                          ? 'bg-green-50 text-green-600 border border-green-100' 
                          : 'bg-orange-50 text-orange-600 border border-orange-100'
                      }`}>
                        {bill.status === 'paid' ? <CheckCircle size={10} /> : <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>}
                        {bill.status}
                      </div>
                    </div>
                    
                    {bill.status === 'unpaid' && (
                      <button 
                        onClick={() => handleMarkAsPaid(bill.id)}
                        className="bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-black/10"
                      >
                        Mark as Paid
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                <CreditCard className="text-gray-300" size={32} />
              </div>
              <p className="text-gray-400 font-bold tracking-tight">No bills found yet. Add your first one above!</p>
            </div>
          )}
        </section>
      </div>

      {editingBill && (
        <EditBillModal 
          bill={editingBill} 
          isOpen={!!editingBill} 
          onClose={() => setEditingBill(null)} 
          onBillUpdated={fetchBills} 
        />
      )}
    </main>
  );
}
