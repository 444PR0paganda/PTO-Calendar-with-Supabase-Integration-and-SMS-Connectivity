'use client'

import { useState, useEffect } from 'react'

interface HealthCheckResult {
  status: string
  timestamp: string
  supabase: {
    configured: boolean
    connected: boolean
    error: string | null
    details: Record<string, unknown>
  }
  auth: {
    managerPasswordSet: boolean
    adminPasswordSet: boolean
  }
}

export default function HealthCheckPage() {
  const [result, setResult] = useState<HealthCheckResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const runCheck = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/health-check')
      const data = await response.json()
      setResult(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to run health check')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runCheck()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">System Health Check</h1>
            <button
              onClick={runCheck}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Checking...' : 'Refresh'}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              Error: {error}
            </div>
          )}

          {loading && !result && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Running health checks...</p>
            </div>
          )}

          {result && (
            <div className="space-y-6">
              <div className={`p-4 rounded-lg ${
                result.status === 'healthy'
                  ? 'bg-green-100 border border-green-400'
                  : 'bg-yellow-100 border border-yellow-400'
              }`}>
                <h2 className="text-xl font-semibold mb-2">
                  Overall Status: <span className={result.status === 'healthy' ? 'text-green-700' : 'text-yellow-700'}>
                    {result.status.toUpperCase()}
                  </span>
                </h2>
                <p className="text-sm text-gray-600">
                  Last checked: {new Date(result.timestamp).toLocaleString()}
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <span className={`w-3 h-3 rounded-full mr-2 ${
                    result.supabase.connected ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  Supabase
                </h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Configuration:</span>
                    <span className={result.supabase.configured ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                      {result.supabase.configured ? '✓ Configured' : '✗ Not Configured'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Connection:</span>
                    <span className={result.supabase.connected ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                      {result.supabase.connected ? '✓ Connected' : '✗ Not Connected'}
                    </span>
                  </div>
                  {result.supabase.error && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                      {result.supabase.error}
                    </div>
                  )}
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">View Details</summary>
                    <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto">
                      {JSON.stringify(result.supabase.details, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4">Auth configuration</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Manager password:</span>
                    <span className={result.auth.managerPasswordSet ? 'text-green-600 font-semibold' : 'text-yellow-600 font-semibold'}>
                      {result.auth.managerPasswordSet ? '✓ Set' : '⚠ Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Admin password:</span>
                    <span className={result.auth.adminPasswordSet ? 'text-green-600 font-semibold' : 'text-yellow-600 font-semibold'}>
                      {result.auth.adminPasswordSet ? '✓ Set' : '⚠ Not set'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Next steps</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                  {!result.supabase.configured && (
                    <li>Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY</li>
                  )}
                  {!result.supabase.connected && result.supabase.configured && (
                    <li>Check Supabase URL and keys and that the database is accessible</li>
                  )}
                  {!result.auth.managerPasswordSet && (
                    <li>Set MANAGER_PASSWORD for management dashboard sign-in</li>
                  )}
                  {!result.auth.adminPasswordSet && (
                    <li>Set ADMIN_PASSWORD for admin dashboard sign-in</li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
