import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

const EMPLOYEE_COOKIE = 'employee_id'

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

export async function POST(request: NextRequest) {
  try {
    const employeeId = request.cookies.get(EMPLOYEE_COOKIE)?.value
    if (!employeeId) {
      return NextResponse.json({ error: 'Please sign in to request PTO' }, { status: 401 })
    }

    const body = await request.json()
    const startDate = body.start_date ?? body.startDate
    const endDate = body.end_date ?? body.endDate
    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'Start date and end date are required' }, { status: 400 })
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return NextResponse.json({ error: 'Invalid date range' }, { status: 400 })
    }

    const { data: ptoRequest, error } = await supabaseAdmin
      .from('pto_requests')
      .insert({
        employee_id: employeeId,
        start_date: start.toISOString().slice(0, 10),
        end_date: end.toISOString().slice(0, 10),
        status: 'pending'
      })
      .select(`
        *,
        employee:employees(*)
      `)
      .single()

    if (error) {
      console.error('Error creating PTO request:', error)
      return NextResponse.json({ error: 'Failed to create PTO request' }, { status: 500 })
    }

    return NextResponse.json({ success: true, ptoRequest })
  } catch (error) {
    console.error('Error in PTO request create API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

