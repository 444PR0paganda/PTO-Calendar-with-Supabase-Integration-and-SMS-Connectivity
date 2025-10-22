import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory storage for manager phone (in production, you'd store this in database)
let managerPhone = process.env.MANAGER_PHONE_NUMBER || '+1234567890'

export async function GET() {
  return NextResponse.json({ phone: managerPhone })
}

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    // Update the manager phone
    managerPhone = phone

    // In a real application, you'd update this in the database
    // For now, we'll just update the environment variable for the current session
    process.env.MANAGER_PHONE_NUMBER = phone

    return NextResponse.json({ success: true, phone })

  } catch (error) {
    console.error('Error updating manager phone:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

