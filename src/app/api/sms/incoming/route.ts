import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log("DEBUG: process.env.USE_MOCK_SMS =>", process.env.USE_MOCK_SMS)
  const useMockSMS = String(process.env.USE_MOCK_SMS).toLowerCase() === "true"
  console.log("DEBUG: useMockSMS =>", useMockSMS)

  return NextResponse.json({ success: true, useMockSMS })
}

export const dynamic = 'force-dynamic'
