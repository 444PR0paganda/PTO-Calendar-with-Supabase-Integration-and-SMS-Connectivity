import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const results = {
    timestamp: new Date().toISOString(),
    supabase: {
      configured: false,
      connected: false,
      error: null as string | null,
      details: {} as Record<string, unknown>
    },
    auth: {
      managerPasswordSet: !!process.env.MANAGER_PASSWORD,
      adminPasswordSet: !!process.env.ADMIN_PASSWORD
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  results.supabase.configured = !!(supabaseUrl && supabaseAnonKey && supabaseServiceKey)
  results.supabase.details = {
    url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'Not set',
    anonKeySet: !!supabaseAnonKey,
    serviceKeySet: !!supabaseServiceKey
  }

  if (results.supabase.configured) {
    try {
      const { count, error } = await supabaseAdmin
        .from('employees')
        .select('*', { count: 'exact', head: true })

      if (error) {
        const { error: probeError } = await supabaseAdmin.from('employees').select('id').limit(0)
        if (probeError && probeError.code !== 'PGRST116') throw probeError
      }
      results.supabase.connected = true
      results.supabase.details = { ...results.supabase.details, connectionTest: 'Success', employeeCount: count ?? 'N/A' }
    } catch (error: unknown) {
      results.supabase.connected = false
      results.supabase.error = error instanceof Error ? error.message : 'Connection failed'
      results.supabase.details = { ...results.supabase.details, connectionTest: 'Failed' }
    }
  } else {
    results.supabase.error = 'Missing required environment variables'
  }

  const allHealthy = results.supabase.connected
  const statusCode = allHealthy ? 200 : 503

  return NextResponse.json(
    { status: allHealthy ? 'healthy' : 'degraded', ...results },
    {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0'
      }
    }
  )
}
