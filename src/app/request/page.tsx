'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function RequestPage() {
  const [employee, setEmployee] = useState<{ id: string; name: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [signInName, setSignInName] = useState('')
  const [signInError, setSignInError] = useState('')
  const [signInLoading, setSignInLoading] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/employee/me')
      if (res.ok) {
        const data = await res.json()
        setEmployee(data.employee)
      } else {
        setEmployee(null)
      }
    } catch {
      setEmployee(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setSignInError('')
    setSignInLoading(true)
    try {
      const res = await fetch('/api/auth/employee/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: signInName.trim() })
      })
      const data = await res.json()
      if (res.ok) {
        setEmployee(data.employee)
        setSignInName('')
      } else {
        setSignInError(data.error || 'Sign-in failed')
      }
    } catch {
      setSignInError('Something went wrong. Please try again.')
    } finally {
      setSignInLoading(false)
    }
  }

  const handleSignOut = async () => {
    await fetch('/api/auth/employee/signout', { method: 'POST' })
    setEmployee(null)
    setSubmitMessage(null)
  }

  const handleSubmitPTO = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitMessage(null)
    if (!startDate || !endDate) {
      setSubmitMessage({ type: 'error', text: 'Please select both start and end dates.' })
      return
    }
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (start > end) {
      setSubmitMessage({ type: 'error', text: 'End date must be on or after start date.' })
      return
    }
    setSubmitLoading(true)
    try {
      const res = await fetch('/api/pto/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start_date: startDate, end_date: endDate })
      })
      const data = await res.json()
      if (res.ok) {
        setSubmitMessage({ type: 'success', text: `Request submitted for ${startDate} to ${endDate}. You'll be notified when it's reviewed.` })
        setStartDate('')
        setEndDate('')
      } else {
        setSubmitMessage({ type: 'error', text: data.error || 'Failed to submit request' })
      }
    } catch {
      setSubmitMessage({ type: 'error', text: 'Something went wrong. Please try again.' })
    } finally {
      setSubmitLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Request time off</h1>
          <p className="text-lg text-gray-600">Sign in with your name and submit a PTO request</p>
        </div>

        {!employee ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Sign in</h2>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Your full name</label>
                <input
                  type="text"
                  value={signInName}
                  onChange={(e) => setSignInName(e.target.value)}
                  className="input-field"
                  placeholder="As registered with HR"
                  required
                  autoFocus
                />
              </div>
              {signInError && (
                <p className="text-sm text-red-600">{signInError}</p>
              )}
              <button
                type="submit"
                disabled={signInLoading}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {signInLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
            <p className="mt-4 text-sm text-gray-500 text-center">
              Not in the system? Contact HR to be added as an employee.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-700">
                Signed in as <strong>{employee.name}</strong>
              </p>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Sign out
              </button>
            </div>

            <h2 className="text-xl font-semibold text-gray-800 mb-4">Request PTO</h2>
            <form onSubmit={handleSubmitPTO} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">Start date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1">End date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
              {submitMessage && (
                <div className={`p-3 rounded-lg text-sm ${submitMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  {submitMessage.text}
                </div>
              )}
              <button
                type="submit"
                disabled={submitLoading}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitLoading ? 'Submitting...' : 'Submit request'}
              </button>
            </form>

            <p className="mt-6 text-center">
              <Link href="/" className="text-blue-600 hover:underline">Back to home</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
