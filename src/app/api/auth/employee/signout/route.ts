import { NextResponse } from 'next/server'

const COOKIE_NAME = 'employee_id'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set(COOKIE_NAME, '', { maxAge: 0, path: '/' })
  return response
}
