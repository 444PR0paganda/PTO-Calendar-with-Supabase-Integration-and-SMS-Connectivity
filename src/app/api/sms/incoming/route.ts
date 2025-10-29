import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { smsService } from '@/lib/sms'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Handle both Twilio webhook format and mock format
    const fromNumber = body.From || body.from_number
    const messageBody = body.Body || body.message || body.body

    if (!fromNumber || !messageBody) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Log the incoming SMS
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '+1234567890'
    await smsService.logSMS(fromNumber, twilioPhoneNumber, messageBody, 'inbound')

    // Find employee by phone number
    const { data: employee, error: employeeError } = await supabaseAdmin
      .from('employees')
      .select('*')
      .eq('phone_number', fromNumber)
      .single()

    if (employeeError || !employee) {
      // Send error message back to unknown number
      await smsService.sendSMS(fromNumber, 'Sorry, your phone number is not registered in our system. Please contact HR to register.')
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    // Parse PTO request from message
    const ptoDates = smsService.parsePTORequest(messageBody)
    
    if (!ptoDates) {
      await smsService.sendSMS(fromNumber, 'Invalid PTO request format. Please use: "Request PTO for 12/15, 12/16" or "Request PTO 12/15-12/17"')
      return NextResponse.json({ error: 'Invalid PTO request format' }, { status: 400 })
    }

    // Create PTO request
    const { data: ptoRequest, error: ptoError } = await supabaseAdmin
      .from('pto_requests')
      .insert({
        employee_id: employee.id,
        start_date: ptoDates.startDate,
        end_date: ptoDates.endDate,
        status: 'pending'
      })
      .select(`
        *,
        employee:employees(*)
      `)
      .single()

    if (ptoError) {
      console.error('Error creating PTO request:', ptoError)
      await smsService.sendSMS(fromNumber, 'Sorry, there was an error processing your PTO request. Please try again later.')
      return NextResponse.json({ error: 'Failed to create PTO request' }, { status: 500 })
    }

    // Send confirmation to employee
    await smsService.sendSMS(
      fromNumber, 
      `PTO request received for ${ptoDates.startDate} to ${ptoDates.endDate}. You will be notified when it's reviewed.`
    )

    // Send notification to manager
    const managerMessage = `New PTO request from ${employee.name} for ${ptoDates.startDate} to ${ptoDates.endDate}. Check the management dashboard to approve/deny.`
    await smsService.sendToManager(managerMessage)

    return NextResponse.json({ 
      success: true, 
      message: 'PTO request processed successfully',
      ptoRequest 
    })

  } catch (error) {
    console.error('Error processing SMS:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Handle GET requests for testing
export async function GET() {
  const rawMockSMS = process.env.USE_MOCK_SMS
  // Temporarily hardcoded to false to bypass environment variable issue
  const mockMode = false // rawMockSMS?.toLowerCase() === 'true'
  
  return NextResponse.json({ 
    message: 'SMS webhook endpoint is active',
    mockMode: mockMode,
    note: 'Temporarily hardcoded to false - env var issue being investigated',
    debug: {
      rawUSE_MOCK_SMS: rawMockSMS || 'undefined',
      afterLowercase: rawMockSMS?.toLowerCase() || 'undefined',
      comparison: `${rawMockSMS?.toLowerCase()} === 'true'`,
      hardcodedResult: false
    },
    twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || 'Not configured',
    hasTwilioCredentials: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
  })
}

