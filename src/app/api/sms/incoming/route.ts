import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { smsService } from '@/lib/sms'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Handle Twilio webhook format
    const fromNumber = body.From || body.from_number
    const messageBody = body.Body || body.message || body.body

    if (!fromNumber || !messageBody) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // --- DEBUG & MOCK MODE ---
    console.log("DEBUG: process.env.USE_MOCK_SMS (raw) =>", process.env.USE_MOCK_SMS)
    const useMockSMS = String(process.env.USE_MOCK_SMS).toLowerCase() === "true"
    console.log("DEBUG: useMockSMS (boolean) =>", useMockSMS)

    // Log the incoming SMS (always log, even in mock)
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '+1234567890'
    await smsService.logSMS(fromNumber, twilioPhoneNumber, messageBody, 'inbound')

    // Find employee by phone number
    const { data: employee, error: employeeError } = await supabaseAdmin
      .from('employees')
      .select('*')
      .eq('phone_number', fromNumber)
      .single()

    if (employeeError || !employee) {
      const errorMsg = 'Sorry, your phone number is not registered in our system. Please contact HR to register.'
      if (useMockSMS) {
        console.log(`[MOCK SMS] Would send to ${fromNumber}: ${errorMsg}`)
      } else {
        await smsService.sendSMS(fromNumber, errorMsg)
      }
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    // Parse PTO request from message
    const ptoDates = smsService.parsePTORequest(messageBody)
    
    if (!ptoDates) {
      const invalidMsg = 'Invalid PTO request format. Please use: "Request PTO for 12/15, 12/16" or "Request PTO 12/15-12/17"'
      if (useMockSMS) {
        console.log(`[MOCK SMS] Would send to ${fromNumber}: ${invalidMsg}`)
      } else {
        await smsService.sendSMS(fromNumber, invalidMsg)
      }
      return NextResponse.json({ error: 'Invalid PTO request format' }, { status: 400 })
    }

    // Create PTO request in Supabase
    const { data: ptoRequest, error: ptoError } = await supabaseAdmin
      .from('pto_requests')
      .insert({
        employee_id: employee.id,
        start_date: ptoDates.startDate,
        end_date: ptoDates.endDate,
        status: 'pending'
      })
      .select(`*, employee:employees(*)`)
      .single()

    if (ptoError) {
      console.error('Error creating PTO request:', ptoError)
      const failMsg = 'Sorry, there was an error processing your PTO request. Please try again later.'
      if (useMockSMS) {
        console.log(`[MOCK SMS] Would send to ${fromNumber}: ${failMsg}`)
      } else {
        await smsService.sendSMS(fromNumber, failMsg)
      }
      return NextResponse.json({ error: 'Failed to create PTO request' }, { status: 500 })
    }

    // Send confirmation to employee
    const confirmMsg = `PTO request received for ${ptoDates.startDate} to ${ptoDates.endDate}. You will be notified when it's reviewed.`
    if (useMockSMS) {
      console.log(`[MOCK SMS] Would send to ${fromNumber}: ${confirmMsg}`)
    } else {
      await smsService.sendSMS(fromNumber, confirmMsg)
    }

    // Send notification to manager
    const managerMessage = `New PTO request from ${employee.name} for ${ptoDates.startDate} to ${ptoDates.endDate}. Check the management dashboard to approve/deny.`
    if (useMockSMS) {
      console.log(`[MOCK SMS] Would send to manager: ${managerMessage}`)
    } else {
      await smsService.sendToManager(managerMessage)
    }

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
export const dynamic = 'force-dynamic'

export async function GET() {
  const response = NextResponse.json({ 
    message: 'SMS webhook endpoint is active',
    mode: 'production',
    twilioConfigured: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
    twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER || 'Not configured',
    timestamp: new Date().toISOString()
  })
  
  // Force no caching
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  
  return response
}
