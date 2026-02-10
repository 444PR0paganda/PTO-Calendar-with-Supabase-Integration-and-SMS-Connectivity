import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const COOKIE_NAME = 'employee_id'

export async function GET(request: NextRequest) {
  try {
    const employeeId = request.cookies.get(COOKIE_NAME)?.value
    if (!employeeId) {
      return NextResponse.json({ error: 'Not signed in' }, { status: 401 })
    }

    const { data: employee, error } = await supabaseAdmin
      .from('employees')
      .select('id, name')
      .eq('id', employeeId)
      .single()

    if (error || !employee) {
      const response = NextResponse.json({ error: 'Employee not found' }, { status: 401 })
      response.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' })
      return response
    }

    return NextResponse.json({ employee })
  } catch (error) {
    console.error('Employee me error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
