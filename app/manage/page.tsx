'use client'
import { useState, useEffect, useCallback } from 'react'
import { UserButton, useUser } from "@clerk/nextjs"
import { supabase } from '@/utils/supabase'
import AddBill from "@/app/components/AddBill"
import EditBillModal from "@/app/components/EditBillModal"
import BillCalendar from "@/app/components/BillCalendar"
import BillShares from "@/app/components/BillShares"
import ThemeToggle from "@/app/components/ThemeToggle"
import SpendingChart from "@/app/components/SpendingChart"
import CategoryBreakdown from "@/app/components/CategoryBreakdown"
import { Trash2, Edit2, CheckCircle, Clock, Wallet, ArrowUpRight, Bell, AlertCircle, RefreshCw, LayoutGrid, List, Calendar, TrendingUp, PieChart as PieIcon } from 'lucide-react'
import { isBefore, startOfToday, parseISO, format, startOfMonth, endOfMonth } from 'date-fns'
import Link from 'next/link'

interface Bill {
  id: string
  name: string
  amount: number
  due_date: string
  status: string
  category?: string
  is_recurring?: boolean
}

export default function ManageBills() {
  const { user } = useUser()
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [editingBill, setEditingBill] = useState<Bill | null>(null)
  const [reminding, setReminding] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [budget, setBudget] = useState<number>(2000)

  const fetchBills = useCallback(async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('user_id', user.id)
      .order('due_date', { ascending: true })

    if (error) console.error('Error fetching bills:', error)
    else setBills(data || [])
    setLoading(false)
  }, [user])

  const fetchUserSettings = useCallback(async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('user_settings')
      .select('monthly_budget')
      .eq('user_id', user.id)
      .single()

    if (!error && data) {
      setBudget(data.monthly_budget)
    }
  }, [user])

  useEffect(() => {
    fetchBills()
    fetchUserSettings()

    const channel = supabase
      .channel('manage-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bills' }, () => fetchBills())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchBills, fetchUserSettings])

  const handleMarkAsPaid = async (billId: string) => {
    await supabase.from('bills').update({ status: 'paid' }).eq('id', billId)
    fetchBills()
  }

  const handleDelete = async (billId: string) => {
    if (!confirm("Delete this bill?")) return
    await supabase.from('bills').delete().eq('id', billId)
    fetchBills()
  }

  const totalOutstanding = bills.reduce((acc, b) => acc + (b.status === 'unpaid' ? b.amount : 0), 0)
  const thisMonthBills = bills.filter(b => {
    const d = new Date(b.due_date)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const totalDueThisMonth = thisMonthBills.reduce((acc, b) => acc + b.amount, 0)
  const remainingBudget = Math.max(0, budget - totalDueThisMonth)

  return (
    <main className="min-h-screen bg-background text-foreground pb-20 transition-colors">
      <header className="bg-card border-b border-border sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-accent/10 text-accent rounded-lg flex items-center justify-center group-hover:bg-accent group-hover:text-background transition-all">
                <LayoutGrid size={16} />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">Manage Bills</h1>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <UserButton afterSignOutUrl="/"/>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* Financial Summary */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Total Due Card */}
          <div className="p-6 bg-accent text-background rounded-3xl shadow-2xl relative overflow-hidden group">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">Due This Month</p>
            <h3 className="text-3xl font-black">${totalDueThisMonth.toFixed(2)}</h3>
            <div className="mt-4 flex items-center gap-1 text-[10px] font-bold opacity-80">
              <ArrowUpRight size={12} />
              <span>{thisMonthBills.filter(b => b.status === 'unpaid').length} PENDING</span>
            </div>
          </div>

          {/* Budget Progress Card */}
          <div className="p-6 bg-card border border-border rounded-3xl relative overflow-hidden group">
            <div className="flex justify-between items-center mb-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">Budget Usage</p>
              <button 
                onClick={() => {
                  const n = prompt("Enter new budget:", budget.toString())
                  if (n) updateBudget(parseFloat(n))
                }}
                className="text-[9px] font-black uppercase tracking-widest text-accent"
              >
                Edit
              </button>
            </div>
            <h3 className="text-2xl font-black text-foreground">${budget.toFixed(0)}</h3>
            <div className="mt-4 space-y-2">
              <div className="h-1.5 w-full bg-muted/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${remainingBudget < budget * 0.1 ? 'bg-red-500' : 'bg-accent'}`}
                  style={{ width: `${Math.min(100, (totalDueThisMonth / budget) * 100)}%` }}
                ></div>
              </div>
              <p className="text-[9px] font-black text-muted uppercase tracking-widest">
                ${remainingBudget.toFixed(0)} REMAINING
              </p>
            </div>
          </div>

          {/* Prediction Card */}
          <div className="p-6 bg-card border border-border rounded-3xl relative overflow-hidden group border-dashed border-accent/20">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted flex items-center gap-2">
              <RefreshCw size={10} className="text-accent animate-spin-slow" />
              Next Month Estimate
            </p>
            <h3 className="text-2xl font-black text-foreground">${bills.filter(b => b.is_recurring).reduce((acc, b) => acc + b.amount, 0).toFixed(2)}</h3>
            <p className="mt-4 text-[9px] font-black text-muted uppercase tracking-widest">
              Recurring commitments
            </p>
          </div>
        </section>

        {/* Analytics Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 p-8 bg-card rounded-3xl border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-8">
              <TrendingUp size={18} className="text-muted" />
              <h3 className="text-lg font-bold text-foreground">Spending Trends</h3>
            </div>
            <SpendingChart bills={bills} />
          </div>

          <div className="p-8 bg-card rounded-3xl border border-border shadow-sm">
            <div className="flex items-center gap-2 mb-8">
              <PieIcon size={18} className="text-muted" />
              <h3 className="text-lg font-bold text-foreground">Expense Distribution</h3>
            </div>
            <CategoryBreakdown bills={bills} />
          </div>
        </section>

        {/* Add Bill Form */}
        <section>
          <AddBill remainingBudget={remainingBudget} onBillAdded={fetchBills} />
        </section>

        {/* Bill List / Calendar View */}
        <section>
          <div className="mb-6">
            <div className="text-sm font-semibold text-muted uppercase tracking-widest">
              Total Outstanding: <span className="text-foreground font-black">${totalOutstanding.toFixed(2)}</span>
            </div>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-muted/5 animate-pulse rounded-3xl border border-border"></div>
              ))}
            </div>
          ) : viewMode === 'list' ? (
            bills.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {bills.map((bill) => {
                  const isOverdue = bill.status === 'unpaid' && isBefore(parseISO(bill.due_date), startOfToday())
                  
                  return (
                    <div 
                      key={bill.id} 
                      className={`group relative p-6 bg-card rounded-3xl shadow-sm border transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between h-full ${
                        isOverdue 
                          ? 'border-red-500/30 bg-red-500/5' 
                          : 'border-border'
                      } ${bill.status === 'paid' ? 'opacity-70 grayscale-[0.5]' : ''}`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted bg-muted/5 px-2 py-0.5 rounded-md border border-border">
                              {bill.category || 'Other'}
                            </span>
                            {bill.is_recurring && (
                              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-400/5 px-2 py-0.5 rounded-md border border-blue-400/20 flex items-center gap-1">
                                <RefreshCw size={8} /> Recurring
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl font-bold text-foreground leading-tight">{bill.name}</h3>
                          <div className={`flex items-center gap-1.5 mt-1 ${isOverdue ? 'text-red-500 animate-pulse' : 'text-muted'}`}>
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
                            className="p-2 hover:bg-muted/10 rounded-xl text-muted hover:text-foreground transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(bill.id)}
                            className="p-2 hover:bg-red-500/10 rounded-xl text-muted hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <BillShares billId={bill.id} />

                      <div className="mt-8 flex justify-between items-end">
                        <div>
                          <p className={`text-3xl font-black leading-none tracking-tighter ${isOverdue ? 'text-red-500' : 'text-foreground'}`}>
                            ${bill.amount.toFixed(2)}
                          </p>
                          <div className={`mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            bill.status === 'paid' 
                              ? 'bg-green-500/10 text-green-500 border border-green-500/20' 
                              : isOverdue
                                ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                                : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
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
                                ? 'bg-red-600 hover:bg-red-700 text-white' 
                                : 'bg-accent text-background hover:opacity-90'
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
              <div className="flex flex-col items-center justify-center py-24 bg-card rounded-[40px] border border-border">
                <Wallet className="text-muted mb-4 opacity-20" size={48} />
                <p className="text-muted font-bold tracking-tight">No bills found.</p>
              </div>
            )
          ) : (
            <BillCalendar bills={bills} onMarkAsPaid={handleMarkAsPaid} />
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
