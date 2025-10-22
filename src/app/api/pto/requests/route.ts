import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Get all PTO requests with employee information
    const { data: ptoRequests, error } = await supabase
      .from('pto_requests')
      .select(`
        *,
        employee:employees(*)
      `)
      .order('start_date', { ascending: true })

    if (error) {
      console.error('Error fetching PTO requests:', error)
      return NextResponse.json({ error: 'Failed to fetch PTO requests' }, { status: 500 })
    }

    return NextResponse.json({ ptoRequests: ptoRequests || [] })

  } catch (error) {
    console.error('Error in PTO requests API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

