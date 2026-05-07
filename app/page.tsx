'use client'
import { useState, useEffect, useCallback } from 'react'
import { UserButton, useUser, SignInButton } from "@clerk/nextjs"
import { supabase } from '@/utils/supabase'
import ThemeToggle from "@/app/components/ThemeToggle"
import ElectricityDashboard from "@/app/components/ElectricityDashboard"
import LogElectricity from "@/app/components/LogElectricity"
import ApplianceBreakdown from "@/app/components/ApplianceBreakdown"
import LandingPage from "@/app/components/LandingPage"
import { TrendingUp, PieChart as PieIcon, ArrowUpRight, Bell, RefreshCw, FileText, Download, LayoutGrid, Settings, ArrowRight, Trash2, Clock, Zap } from 'lucide-react'
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
  const [reductionGoal, setReductionGoal] = useState<number>(10)

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

  const fetchSettings = useCallback(async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('user_settings')
      .select('energy_reduction_goal')
      .eq('user_id', user.id)
      .single()

    if (!error && data) {
      setReductionGoal(data.energy_reduction_goal || 10)
    }
  }, [user])

  useEffect(() => {
    fetchBills()
    fetchSettings()
  }, [fetchBills, fetchSettings])

  const updateReductionGoal = async (newGoal: number) => {
    if (!user) return
    setReductionGoal(newGoal)
    await supabase.from('user_settings').update({ energy_reduction_goal: newGoal }).eq('user_id', user.id)
  }

  const handleDeleteReading = async (id: string) => {
    if (!confirm("Delete this reading?")) return
    await supabase.from('bills').delete().eq('id', id)
    fetchBills()
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
      body: bills.filter(b => b.category === 'Electricity').map(b => [b.name, b.category || 'Other', `$${b.amount.toFixed(2)}`, b.units_consumed || '-', b.due_date]),
      headStyles: { fillColor: [0, 0, 0] },
    })

    doc.save(`Electricity_Analysis_${format(new Date(), 'yyyy-MM-dd')}.pdf`)
  }

  const exportToCSV = () => {
    const electricityBills = bills.filter(b => b.category === 'Electricity')
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Name,Amount,kWh,Date", ...electricityBills.map(b => `${b.name},${b.amount},${b.units_consumed || 0},${b.due_date}`)].join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "electricity_analysis.csv")
    document.body.appendChild(link)
    link.click()
  }

  const electricityBills = bills.filter(b => b.category === 'Electricity')

  const { isLoaded, isSignedIn } = useUser()

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!isSignedIn) {
    return <LandingPage />
  }

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
            <ThemeToggle />
            <UserButton />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-20">
        {/* Main Hero: Electricity Analytics */}
        <section>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
            <div>
              <h2 className="text-4xl font-black mb-2 tracking-tight text-foreground">Electricity Analysis</h2>
              <p className="text-sm font-bold text-muted uppercase tracking-widest">Energy Intelligence Hub</p>
            </div>
            <div className="flex flex-wrap gap-4">
              <LogElectricity onLogged={fetchBills} />
              <div className="flex gap-2">
                <button onClick={exportToPDF} title="Export PDF" className="p-4 bg-card border border-border rounded-2xl text-muted hover:text-foreground transition-all shadow-sm"><FileText size={20} /></button>
                <button onClick={exportToCSV} title="Export CSV" className="p-4 bg-card border border-border rounded-2xl text-muted hover:text-foreground transition-all shadow-sm"><Download size={20} /></button>
                <Link 
                  href="/manage"
                  title="Full Bill Management"
                  className="flex items-center gap-2 px-6 py-4 bg-muted/5 border border-border text-muted rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-muted/10 transition-all"
                >
                  <Settings size={16} /> Manage Bills
                </Link>
              </div>
            </div>
          </div>
          <ElectricityDashboard 
            bills={bills} 
            reductionGoal={reductionGoal}
            onGoalUpdate={updateReductionGoal}
          />
        </section>

        {/* Appliance Breakdown Tool */}
        <section>
          <ApplianceBreakdown 
            totalKwh={
              bills
                .filter(b => b.category === 'Electricity')
                .sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime())[0]?.units_consumed || 0
            } 
          />
        </section>

        <hr className="border-border opacity-50" />

        {/* Recent Readings Table */}
        <section className="space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-foreground">Recent Readings</h2>
              <p className="text-xs font-bold text-muted uppercase tracking-widest mt-1">Logged electricity data history</p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-[40px] overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/5">
                  <th className="px-8 py-6 text-[10px] font-black text-muted uppercase tracking-widest">Date</th>
                  <th className="px-8 py-6 text-[10px] font-black text-muted uppercase tracking-widest">Usage (kWh)</th>
                  <th className="px-8 py-6 text-[10px] font-black text-muted uppercase tracking-widest">Amount</th>
                  <th className="px-8 py-6 text-[10px] font-black text-muted uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {electricityBills.length > 0 ? (
                  electricityBills.slice().reverse().map((b) => (
                    <tr key={b.id} className="hover:bg-muted/5 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-accent/10 text-accent rounded-lg flex items-center justify-center">
                            <Clock size={14} />
                          </div>
                          <span className="text-sm font-bold text-foreground">
                            {format(parseISO(b.due_date), 'MMMM dd, yyyy')}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <Zap size={14} className="text-accent" />
                          <span className="text-sm font-black text-foreground">{b.units_consumed || 0} kWh</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm font-bold text-muted">${b.amount.toFixed(2)}</td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => handleDeleteReading(b.id)}
                          className="p-2 text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-8 py-20 text-center text-muted font-bold tracking-tight">
                      No electricity readings logged yet. Use the button above to log your first one!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
