import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import { supabase } from '@/utils/supabase'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'Resend API Key is missing. Please add RESEND_API_KEY to your .env.local' 
      }, { status: 500 })
    }

    const resend = new Resend(apiKey)
    const { userId, userEmail } = await request.json()
    if (!userId || !userEmail) {
      return NextResponse.json({ error: 'Missing userId or userEmail' }, { status: 400 })
    }

    // Get bills due in exactly 3 days
    const threeDaysFromNow = new Date()
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
    const dateString = threeDaysFromNow.toISOString().split('T')[0]

    const { data: bills, error } = await supabase
      .from('bills')
      .select('*')
      .eq('user_id', userId)
      .eq('due_date', dateString)
      .eq('status', 'unpaid')

    if (error) throw error

    if (!bills || bills.length === 0) {
      return NextResponse.json({ message: 'No bills due in 3 days' })
    }

    // Send email
    const { data, error: emailError } = await resend.emails.send({
      from: 'BillTracker <notifications@resend.dev>',
      to: [userEmail],
      subject: 'Upcoming Bill Reminder',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #000;">Upcoming Bill Reminders</h2>
          <p>This is a reminder that you have ${bills.length} bill(s) due in 3 days.</p>
          <ul style="list-style: none; padding: 0;">
            ${bills.map(bill => `
              <li style="padding: 15px; background: #f9fafb; margin-bottom: 10px; border-radius: 8px; border-left: 4px solid #000;">
                <strong>${bill.name}</strong><br/>
                Amount: $${bill.amount.toFixed(2)}<br/>
                Due: ${new Date(bill.due_date).toLocaleDateString()}
              </li>
            `).join('')}
          </ul>
          <p style="margin-top: 20px; color: #666; font-size: 12px;">Login to your dashboard to mark them as paid.</p>
        </div>
      `,
    })

    if (emailError) throw emailError

    return NextResponse.json({ message: 'Reminders sent successfully', data })
  } catch (error: any) {
    console.error('Email Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
