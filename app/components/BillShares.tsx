'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase'
import { CheckCircle, Circle, Users } from 'lucide-react'

interface Share {
  id: string
  bill_id: string
  person_name: string
  amount: number
  status: string
}

interface BillSharesProps {
  billId: string
}

export default function BillShares({ billId }: BillSharesProps) {
  const [shares, setShares] = useState<Share[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchShares()

    // Real-time subscription - make channel name unique to this bill
    const channel = supabase
      .channel(`bill_shares_${billId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'bill_shares', filter: `bill_id=eq.${billId}` }, 
        () => fetchShares()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [billId])

  const fetchShares = async () => {
    const { data, error } = await supabase
      .from('bill_shares')
      .select('*')
      .eq('bill_id', billId)

    if (error) {
      if (error.code === 'PGRST116') {
        // Table doesn't exist or other common Supabase error
        console.warn('bill_shares table may not be created yet.')
      } else {
        console.error('Error fetching shares:', error.message)
      }
    } else {
      setShares(data || [])
    }
    setLoading(false)
  }

  const toggleShareStatus = async (shareId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'paid' ? 'unpaid' : 'paid'
    const { error } = await supabase
      .from('bill_shares')
      .update({ status: newStatus })
      .eq('id', shareId)

    if (error) console.error(error)
    // Subscription will handle the UI update
  }

  if (loading) return null
  if (shares.length === 0) return null

  return (
    <div className="mt-4 pt-4 border-t border-border">
      <div className="flex items-center gap-2 mb-3">
        <Users size={12} className="text-muted" />
        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted">Roommate Split</h4>
      </div>
      <div className="space-y-2">
        {shares.map(share => (
          <div key={share.id} className="flex justify-between items-center bg-muted/5 p-2 rounded-xl border border-border">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => toggleShareStatus(share.id, share.status)}
                className={`transition-colors ${share.status === 'paid' ? 'text-green-500' : 'text-muted hover:text-foreground'}`}
              >
                {share.status === 'paid' ? <CheckCircle size={14} /> : <Circle size={14} />}
              </button>
              <span className={`text-[11px] font-bold ${share.status === 'paid' ? 'text-muted line-through' : 'text-foreground'}`}>
                {share.person_name}
              </span>
            </div>
            <span className={`text-[11px] font-black ${share.status === 'paid' ? 'text-muted' : 'text-foreground'}`}>
              ${share.amount.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
