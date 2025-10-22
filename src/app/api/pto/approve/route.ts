import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { smsService } from '@/lib/sms'

export async function POST(request: NextRequest) {
  try {
    const { ptoRequestId } = await request.json()

    if (!ptoRequestId) {
      return NextResponse.json({ error: 'PTO request ID is required' }, { status: 400 })
    }

    // Get the PTO request with employee info
    const { data: ptoRequest, error: fetchError } = await supabaseAdmin
      .from('pto_requests')
      .select(`
        *,
        employee:employees(*)
      `)
      .eq('id', ptoRequestId)
      .single()

    if (fetchError || !ptoRequest) {
      return NextResponse.json({ error: 'PTO request not found' }, { status: 404 })
    }

    if (ptoRequest.status !== 'pending') {
      return NextResponse.json({ error: 'PTO request has already been processed' }, { status: 400 })
    }

    // Update the PTO request status
    const { error: updateError } = await supabaseAdmin
      .from('pto_requests')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: 'manager'
      })
      .eq('id', ptoRequestId)

    if (updateError) {
      console.error('Error updating PTO request:', updateError)
      return NextResponse.json({ error: 'Failed to approve PTO request' }, { status: 500 })
    }

    // Send SMS confirmation to employee
    const employeeMessage = `Your PTO request for ${ptoRequest.start_date} to ${ptoRequest.end_date} has been APPROVED. Enjoy your time off!`
    await smsService.sendSMS(ptoRequest.employee.phone_number, employeeMessage)

    return NextResponse.json({ 
      success: true, 
      message: 'PTO request approved successfully' 
    })

  } catch (error) {
    console.error('Error approving PTO request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

