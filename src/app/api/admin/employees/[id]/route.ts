import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { name, phone_number } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 })
    }

    if (!name || !phone_number) {
      return NextResponse.json({ error: 'Name and phone number are required' }, { status: 400 })
    }

    // Check if phone number already exists for a different employee
    const { data: existingEmployee } = await supabaseAdmin
      .from('employees')
      .select('id')
      .eq('phone_number', phone_number)
      .neq('id', id)
      .single()

    if (existingEmployee) {
      return NextResponse.json({ error: 'Phone number already exists for another employee' }, { status: 400 })
    }

    const { data: employee, error } = await supabaseAdmin
      .from('employees')
      .update({
        name,
        phone_number
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating employee:', error)
      return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 })
    }

    return NextResponse.json({ employee })

  } catch (error) {
    console.error('Error in update employee API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { deletePtoRequests } = await request.json().catch(() => ({ deletePtoRequests: false }))

    if (!id) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 })
    }

    // Check if employee has any PTO requests
    const { data: ptoRequests } = await supabaseAdmin
      .from('pto_requests')
      .select('id')
      .eq('employee_id', id)

    // If employee has PTO requests and we're not deleting them, return error
    if (ptoRequests && ptoRequests.length > 0 && !deletePtoRequests) {
      return NextResponse.json({ 
        error: 'Employee has existing PTO requests',
        hasPtoRequests: true,
        ptoCount: ptoRequests.length
      }, { status: 400 })
    }

    // Delete PTO requests first if requested
    if (deletePtoRequests && ptoRequests && ptoRequests.length > 0) {
      const { error: ptoError } = await supabaseAdmin
        .from('pto_requests')
        .delete()
        .eq('employee_id', id)

      if (ptoError) {
        console.error('Error deleting PTO requests:', ptoError)
        return NextResponse.json({ error: 'Failed to delete PTO requests' }, { status: 500 })
      }
    }

    // Delete the employee
    const { error } = await supabaseAdmin
      .from('employees')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting employee:', error)
      return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      deletedPtoRequests: deletePtoRequests && ptoRequests ? ptoRequests.length : 0
    })

  } catch (error) {
    console.error('Error in delete employee API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}