import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const COOKIE_NAME = 'employee_id'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json()
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const trimmed = name.trim()
    if (!trimmed) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const { data: employee, error } = await supabaseAdmin
      .from('employees')
      .select('id, name')
      .ilike('name', trimmed)
      .limit(1)
      .maybeSingle()

    if (error || !employee) {
      return NextResponse.json({ error: 'Employee not found. Please use your full name as registered.' }, { status: 404 })
    }

    const response = NextResponse.json({ success: true, employee: { id: employee.id, name: employee.name } })
    response.cookies.set(COOKIE_NAME, employee.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/'
    })
    return response
  } catch (error) {
    console.error('Employee sign-in error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
