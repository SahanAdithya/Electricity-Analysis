'use client'
import { useState, useEffect, useCallback } from 'react'
import { UserButton, useUser } from "@clerk/nextjs"
import { supabase } from '@/utils/supabase'
import AddBill from "@/app/components/AddBill"
import EditBillModal from "@/app/components/EditBillModal"
import SpendingChart from "@/app/components/SpendingChart"
import CategoryBreakdown from "@/app/components/CategoryBreakdown"
import { Trash2, Edit2, CheckCircle, Clock, Wallet, TrendingUp, PieChart as PieIcon, ArrowUpRight, CreditCard, Bell, AlertCircle, Calendar } from 'lucide-react'
import { isBefore, startOfToday, parseISO, format, startOfMonth, endOfMonth } from 'date-fns'

interface Bill {
  id: string
  name: string
  amount: number
  due_date: string
  status: string
  category?: string
  is_recurring?: boolean
}

export default function Home() {
  const { user } = useUser()
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [editingBill, setEditingBill] = useState<Bill | null>(null)
  const [reminding, setReminding] = useState(false)

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

  // Recurring Bill Logic: Check if recurring bills for this month have been created
  const checkAndCreateRecurringBills = useCallback(async (currentBills: Bill[]) => {
    if (!user || currentBills.length === 0) return

    const recurringBills = currentBills.filter(b => b.is_recurring)
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    for (const bill of recurringBills) {
      // Check if there's already an entry for this recurring bill in the current month
      const alreadyExists = currentBills.find(b => 
        b.name === bill.name && 
        b.is_recurring && 
        isBefore(monthStart, parseISO(b.due_date)) && 
        isBefore(parseISO(b.due_date), monthEnd)
      )

      if (!alreadyExists) {
        // Create new bill for this month
        const newDueDate = new Date(bill.due_date)
        newDueDate.setMonth(now.getMonth())
        newDueDate.setFullYear(now.getFullYear())

        await supabase.from('bills').insert({
          user_id: user.id,
          name: bill.name,
          amount: bill.amount,
          due_date: format(newDueDate, 'yyyy-MM-dd'),
          category: bill.category,
          is_recurring: true,
          status: 'unpaid'
        })
      }
    }
    // No need to re-fetch here if we want to avoid loops, but we should probably fetch once done
  }, [user])

  useEffect(() => {
    if (user) {
      fetchBills()
    }
  }, [user, fetchBills])

  useEffect(() => {
    if (bills.length > 0) {
      checkAndCreateRecurringBills(bills)
    }
  }, [bills, checkAndCreateRecurringBills])

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

  const handleSendReminders = async () => {
    if (!user?.primaryEmailAddress?.emailAddress) return
    setReminding(true)
    try {
      const response = await fetch('/api/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.primaryEmailAddress.emailAddress
        })
      })
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      alert(data.message || "Reminders processed!")
    } catch (err: any) {
      alert("Error: " + err.message)
    } finally {
      setReminding(false)
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
          <div className="flex items-center gap-4">
            <button 
              onClick={handleSendReminders}
              disabled={reminding}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-all disabled:opacity-50"
            >
              <Bell size={14} className={reminding ? 'animate-bounce' : ''} />
              {reminding ? 'Sending...' : 'Sync Reminders'}
            </button>
            <UserButton afterSignOutUrl="/"/>
          </div>
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
              {bills.map((bill) => {
                const isOverdue = bill.status === 'unpaid' && isBefore(parseISO(bill.due_date), startOfToday())
                
                return (
                  <div 
                    key={bill.id} 
                    className={`group relative p-6 bg-white rounded-3xl shadow-sm border transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between h-full ${
                      isOverdue 
                        ? 'border-red-100 bg-red-50/10' 
                        : 'border-gray-100'
                    } ${bill.status === 'paid' ? 'opacity-70 grayscale-[0.5]' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                            {bill.category || 'Other'}
                          </span>
                          {bill.is_recurring && (
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 flex items-center gap-1">
                              <RefreshCw size={8} /> Recurring
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 leading-tight">{bill.name}</h3>
                        <div className={`flex items-center gap-1.5 mt-1 ${isOverdue ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>
                          {isOverdue ? <AlertCircle size={12} /> : <Clock size={12} />}
                          <span className="text-[10px] font-black uppercase tracking-wider">
                            {isOverdue ? 'OVERDUE: ' : 'Due: '}
                            {new Date(bill.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
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
                        <p className={`text-3xl font-black leading-none tracking-tighter ${isOverdue ? 'text-red-600' : 'text-gray-900'}`}>
                          ${bill.amount.toFixed(2)}
                        </p>
                        <div className={`mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          bill.status === 'paid' 
                            ? 'bg-green-50 text-green-600 border border-green-100' 
                            : isOverdue
                              ? 'bg-red-50 text-red-600 border border-red-100'
                              : 'bg-orange-50 text-orange-600 border border-orange-100'
                        }`}>
                          {bill.status === 'paid' ? <CheckCircle size={10} /> : <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isOverdue ? 'bg-red-500' : 'bg-orange-500'}`}></div>}
                          {isOverdue ? 'Overdue' : bill.status}
                        </div>
                      </div>
                      
                      {bill.status === 'unpaid' && (
                        <button 
                          onClick={() => handleMarkAsPaid(bill.id)}
                          className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg ${
                            isOverdue 
                              ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-200' 
                              : 'bg-black hover:bg-gray-800 text-white shadow-black/10'
                          }`}
                        >
                          Paid
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
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
