import { NextRequest, NextResponse } from 'next/server'

const COOKIE_NAME = 'manager_session'
const COOKIE_MAX_AGE = 60 * 60 * 8 // 8 hours

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    const expected = process.env.MANAGER_PASSWORD
    if (!expected) {
      console.error('MANAGER_PASSWORD is not set')
      return NextResponse.json({ error: 'Manager sign-in is not configured' }, { status: 500 })
    }
    if (password !== expected) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
    }

    const response = NextResponse.json({ success: true })
    response.cookies.set(COOKIE_NAME, '1', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/'
    })
    return response
  } catch (error) {
    console.error('Manager sign-in error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
