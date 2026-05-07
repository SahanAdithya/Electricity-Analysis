'use client'
import { useState } from 'react'
import Calendar from 'react-calendar'
import { format, isSameDay, parseISO, isBefore, startOfToday } from 'date-fns'
import '@/app/calendar.css'
import { CheckCircle, Clock, AlertCircle } from 'lucide-react'

interface Bill {
  id: string
  name: string
  amount: number
  due_date: string
  status: string
  category?: string
}

interface BillCalendarProps {
  bills: Bill[]
  onMarkAsPaid: (id: string) => void
}

export default function BillCalendar({ bills, onMarkAsPaid }: BillCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const getBillsForDate = (date: Date) => {
    return bills.filter(bill => isSameDay(parseISO(bill.due_date), date))
  }

  const selectedBills = getBillsForDate(selectedDate)

  const renderTileContent = ({ date, view }: { date: Date, view: string }) => {
    if (view !== 'month') return null
    
    const dayBills = getBillsForDate(date)
    if (dayBills.length === 0) return null

    return (
      <div className="flex gap-1 mt-1 justify-center">
        {dayBills.map(bill => {
          const isOverdue = bill.status === 'unpaid' && isBefore(parseISO(bill.due_date), startOfToday())
          return (
            <div 
              key={bill.id} 
              className={`bill-indicator ${
                bill.status === 'paid' ? 'indicator-paid' : isOverdue ? 'indicator-overdue' : 'indicator-pending'
              }`} 
            />
          )
        })}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
        <Calendar 
          onChange={(value) => setSelectedDate(value as Date)} 
          value={selectedDate}
          tileContent={renderTileContent}
          className="antigravity-calendar"
        />
      </div>

      <div className="flex flex-col gap-6">
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm h-full overflow-hidden flex flex-col">
          <div className="mb-6">
            <h3 className="text-xl font-black tracking-tight">{format(selectedDate, 'MMMM d, yyyy')}</h3>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Schedule for this day</p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {selectedBills.length > 0 ? (
              selectedBills.map(bill => {
                const isOverdue = bill.status === 'unpaid' && isBefore(parseISO(bill.due_date), startOfToday())
                return (
                  <div key={bill.id} className="p-5 bg-gray-50 rounded-3xl border border-gray-100 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                          {bill.category || 'Other'}
                        </span>
                        <h4 className="font-bold text-gray-900">{bill.name}</h4>
                      </div>
                      <p className="font-black text-gray-900">${bill.amount.toFixed(2)}</p>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className={`flex items-center gap-1.5 ${
                        bill.status === 'paid' ? 'text-green-500' : isOverdue ? 'text-red-500' : 'text-orange-500'
                      }`}>
                        {bill.status === 'paid' ? <CheckCircle size={12} /> : isOverdue ? <AlertCircle size={12} /> : <Clock size={12} />}
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {isOverdue ? 'Overdue' : bill.status}
                        </span>
                      </div>

                      {bill.status === 'unpaid' && (
                        <button 
                          onClick={() => onMarkAsPaid(bill.id)}
                          className="px-4 py-2 bg-black text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all"
                        >
                          Pay Now
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-10 opacity-30">
                <Clock size={32} />
                <p className="text-[10px] font-black uppercase tracking-widest mt-4">No events scheduled</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
