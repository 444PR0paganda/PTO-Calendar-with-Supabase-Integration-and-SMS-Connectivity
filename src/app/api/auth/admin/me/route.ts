import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'admin_session'

export async function GET(request: NextRequest) {
  const value = request.cookies.get(COOKIE_NAME)?.value
  if (value) {
    return NextResponse.json({ signedIn: true })
  }
  return NextResponse.json({ signedIn: false }, { status: 401 })
}
