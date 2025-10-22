import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const { data: employees, error } = await supabaseAdmin
      .from('employees')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching employees:', error)
      return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 })
    }

    return NextResponse.json({ employees: employees || [] })

  } catch (error) {
    console.error('Error in employees API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, phone_number } = await request.json()

    if (!name || !phone_number) {
      return NextResponse.json({ error: 'Name and phone number are required' }, { status: 400 })
    }

    // Check if phone number already exists
    const { data: existingEmployee } = await supabaseAdmin
      .from('employees')
      .select('id')
      .eq('phone_number', phone_number)
      .single()

    if (existingEmployee) {
      return NextResponse.json({ error: 'Phone number already exists' }, { status: 400 })
    }

    const { data: employee, error } = await supabaseAdmin
      .from('employees')
      .insert({
        name,
        phone_number
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating employee:', error)
      return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 })
    }

    return NextResponse.json({ employee })

  } catch (error) {
    console.error('Error in create employee API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

