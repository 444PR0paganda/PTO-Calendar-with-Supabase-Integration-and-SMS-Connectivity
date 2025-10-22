import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: smsLogs, error } = await supabaseAdmin
      .from('sms_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50) // Limit to last 50 messages

    if (error) {
      console.error('Error fetching SMS logs:', error)
      return NextResponse.json({ error: 'Failed to fetch SMS logs' }, { status: 500 })
    }

    return NextResponse.json({ smsLogs: smsLogs || [] })

  } catch (error) {
    console.error('Error in SMS logs API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const { error } = await supabaseAdmin
      .from('sms_logs')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records

    if (error) {
      console.error('Error clearing SMS logs:', error)
      return NextResponse.json({ error: 'Failed to clear SMS logs' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'SMS logs cleared successfully' })

  } catch (error) {
    console.error('Error in clear SMS logs API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
