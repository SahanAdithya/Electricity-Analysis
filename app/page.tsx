'use client'
import { useState, useEffect, useCallback } from 'react'
import { UserButton, useUser } from "@clerk/nextjs"
import { supabase } from '@/utils/supabase'
import SpendingChart from "@/app/components/SpendingChart"
import CategoryBreakdown from "@/app/components/CategoryBreakdown"
import ThemeToggle from "@/app/components/ThemeToggle"
import ElectricityDashboard from "@/app/components/ElectricityDashboard"
import { TrendingUp, PieChart as PieIcon, ArrowUpRight, Bell, RefreshCw, FileText, Download, LayoutGrid, Settings, ArrowRight } from 'lucide-react'
import { format, startOfMonth, endOfMonth, parseISO, isBefore } from 'date-fns'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import Link from 'next/link'

interface Bill {
  id: string
  name: string
  amount: number
  due_date: string
  status: string
  category?: string
  is_recurring?: boolean
  units_consumed?: number
}

export default function Home() {
  const { user } = useUser()
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [budget, setBudget] = useState<number>(2000)
  const [reminding, setReminding] = useState(false)

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
  }, [fetchBills, fetchUserSettings])

  const updateBudget = async (newBudget: number) => {
    if (!user) return
    setBudget(newBudget)
    await supabase.from('user_settings').update({ monthly_budget: newBudget }).eq('user_id', user.id)
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    const today = format(new Date(), 'PPP')
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('ELECTRICITY ANALYST REPORT', 14, 20)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Generated: ${today}`, 14, 28)
    doc.text(`User: ${user?.fullName || user?.firstName}`, 14, 34)

    autoTable(doc, {
      startY: 50,
      head: [['Bill Name', 'Category', 'Amount', 'Usage (kWh)', 'Date']],
      body: bills.map(b => [b.name, b.category || 'Other', `$${b.amount.toFixed(2)}`, b.units_consumed || '-', b.due_date]),
      headStyles: { fillColor: [0, 0, 0] },
    })

    doc.save(`Electricity_Analysis_${format(new Date(), 'yyyy-MM-dd')}.pdf`)
  }

  const exportToCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Name,Amount,Category,kWh,Date", ...bills.map(b => `${b.name},${b.amount},${b.category},${b.units_consumed || 0},${b.due_date}`)].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "electricity_analysis.csv")
    document.body.appendChild(link)
    link.click()
  }

  const thisMonthBills = bills.filter(b => {
    const d = new Date(b.due_date)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const totalDueThisMonth = thisMonthBills.reduce((acc, b) => acc + b.amount, 0)
  const remainingBudget = Math.max(0, budget - totalDueThisMonth)
  const budgetProgress = Math.min(100, (totalDueThisMonth / budget) * 100)
  const predictedNextMonth = bills.filter(b => b.is_recurring).reduce((acc, b) => acc + b.amount, 0)

  return (
    <main className="min-h-screen bg-background text-foreground pb-20 transition-colors">
      <header className="bg-card border-b border-border sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-background rounded-sm rotate-45"></div>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Electricity Analyst</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/manage"
              className="flex items-center gap-2 px-4 py-2 bg-accent text-background rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-accent/20"
            >
              <Settings size={14} /> Manage Bills
            </Link>
            <ThemeToggle />
            <UserButton afterSignOutUrl="/"/>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-20">
        {/* Main Hero: Electricity Analytics */}
        <section>
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-4xl font-black mb-2 tracking-tight text-foreground">Electricity Analysis</h2>
              <p className="text-sm font-bold text-muted uppercase tracking-widest">Main Dashboard</p>
            </div>
            <div className="flex gap-3">
              <button onClick={exportToPDF} className="p-3 bg-card border border-border rounded-xl text-muted hover:text-foreground transition-all"><FileText size={18} /></button>
              <button onClick={exportToCSV} className="p-3 bg-card border border-border rounded-xl text-muted hover:text-foreground transition-all"><Download size={18} /></button>
            </div>
          </div>
          <ElectricityDashboard bills={bills} />
        </section>
      </div>
    </main>
  );
}
