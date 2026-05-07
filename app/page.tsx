'use client'
import { useState, useEffect, useCallback } from 'react'
import { UserButton, useUser } from "@clerk/nextjs"
import { supabase } from '@/utils/supabase'
import AddBill from "@/app/components/AddBill"
import EditBillModal from "@/app/components/EditBillModal"
import SpendingChart from "@/app/components/SpendingChart"
import CategoryBreakdown from "@/app/components/CategoryBreakdown"
import { Trash2, Edit2, CheckCircle, Clock, Wallet, TrendingUp, PieChart as PieIcon, ArrowUpRight, CreditCard } from 'lucide-react'

interface Bill {
  id: string
  name: string
  amount: number
  due_date: string
  status: string
  category?: string
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

  const totalOutstanding = bills.reduce((acc, b) => acc + (b.status === 'unpaid' ? b.amount : 0), 0)
  const thisMonthBills = bills.filter(b => {
    const d = new Date(b.due_date)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const totalDueThisMonth = thisMonthBills.reduce((acc, b) => acc + (b.status === 'unpaid' ? b.amount : 0), 0)

  return (
    <main className="min-h-screen bg-[#fafafa] text-black pb-20">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white rounded-sm rotate-45"></div>
            </div>
            <h1 className="text-xl font-bold tracking-tight">Antigravity Bills</h1>
          </div>
          <UserButton afterSignOutUrl="/"/>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 pt-12 space-y-8">
        {/* Header Section */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-4xl font-black mb-2 tracking-tight">Financial Overview</h2>
            <p className="text-gray-500 font-medium">Welcome back, {user?.firstName || 'User'}. Here's your spending summary.</p>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
            <div className="flex-1 md:w-64 p-6 bg-black text-white rounded-3xl shadow-2xl shadow-black/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Wallet size={80} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Total Due This Month</p>
              <h3 className="text-3xl font-black">${totalDueThisMonth.toFixed(2)}</h3>
              <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-green-400">
                <ArrowUpRight size={12} />
                <span>{thisMonthBills.filter(b => b.status === 'unpaid').length} PENDING BILLS</span>
              </div>
            </div>
          </div>
        </section>

        {/* Analytics Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 p-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-8">
              <TrendingUp size={18} className="text-gray-400" />
              <h3 className="text-lg font-bold">Monthly Spending</h3>
            </div>
            <SpendingChart bills={bills} />
          </div>

          <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 mb-8">
              <PieIcon size={18} className="text-gray-400" />
              <h3 className="text-lg font-bold">Category Breakdown</h3>
            </div>
            <CategoryBreakdown bills={bills} />
          </div>
        </section>

        {/* Add Bill Form */}
        <section>
          <AddBill onBillAdded={fetchBills} />
        </section>

        {/* Bill List */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Active Bills</h2>
            <div className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
              Total Outstanding: ${totalOutstanding.toFixed(2)}
            </div>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-3xl border border-gray-200"></div>
              ))}
            </div>
          ) : bills.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {bills.map((bill) => (
                <div 
                  key={bill.id} 
                  className={`group relative p-6 bg-white rounded-3xl shadow-sm border border-gray-100 transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between h-full ${bill.status === 'paid' ? 'opacity-70 grayscale-[0.5]' : ''}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                          {bill.category || 'Other'}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 leading-tight">{bill.name}</h3>
                      <div className="flex items-center gap-1.5 text-gray-400 mt-1">
                        <Clock size={12} />
                        <span className="text-[10px] font-black uppercase tracking-wider">
                          Due: {new Date(bill.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                      <button 
                        onClick={() => setEditingBill(bill)}
                        className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-black transition-colors"
                        title="Edit Bill"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(bill.id)}
                        className="p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete Bill"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-between items-end">
                    <div>
                      <p className="text-3xl font-black text-gray-900 leading-none tracking-tighter">
                        ${bill.amount.toFixed(2)}
                      </p>
                      <div className={`mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        bill.status === 'paid' 
                          ? 'bg-green-50 text-green-600 border border-green-100' 
                          : 'bg-orange-50 text-orange-600 border border-orange-100'
                      }`}>
                        {bill.status === 'paid' ? <CheckCircle size={10} /> : <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>}
                        {bill.status}
                      </div>
                    </div>
                    
                    {bill.status === 'unpaid' && (
                      <button 
                        onClick={() => handleMarkAsPaid(bill.id)}
                        className="bg-black text-white px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-black/10"
                      >
                        Paid
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[40px] border-2 border-dashed border-gray-100">
              <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6">
                <Wallet className="text-gray-200" size={40} />
              </div>
              <p className="text-gray-400 font-bold tracking-tight text-lg">Your dashboard is empty.</p>
              <p className="text-gray-300 text-sm mt-1">Add your first bill to see the analytics magic.</p>
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
