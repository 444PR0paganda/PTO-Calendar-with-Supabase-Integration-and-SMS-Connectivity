'use client'

import { useState, useEffect } from 'react'
import Calendar from '@/components/Calendar'
import { PTORequest } from '@/lib/supabase'

export default function ManagePage() {
  const [ptoRequests, setPtoRequests] = useState<PTORequest[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  const fetchPTORequests = async () => {
    try {
      const response = await fetch('/api/pto/requests')
      if (response.ok) {
        const data = await response.json()
        setPtoRequests(data.ptoRequests || [])
      }
    } catch (error) {
      console.error('Error fetching PTO requests:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPTORequests()
  }, [])

  const handleApprove = async (ptoRequestId: string) => {
    setProcessing(ptoRequestId)
    try {
      const response = await fetch('/api/pto/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ptoRequestId })
      })

      if (response.ok) {
        await fetchPTORequests() // Refresh the data
      } else {
        alert('Failed to approve PTO request')
      }
    } catch (error) {
      console.error('Error approving PTO request:', error)
      alert('Error approving PTO request')
    } finally {
      setProcessing(null)
    }
  }

  const handleDeny = async (ptoRequestId: string) => {
    const reason = prompt('Please provide a reason for denial (optional):')
    setProcessing(ptoRequestId)
    
    try {
      const response = await fetch('/api/pto/deny', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ptoRequestId, reason })
      })

      if (response.ok) {
        await fetchPTORequests() // Refresh the data
      } else {
        alert('Failed to deny PTO request')
      }
    } catch (error) {
      console.error('Error denying PTO request:', error)
      alert('Error denying PTO request')
    } finally {
      setProcessing(null)
    }
  }

  const pendingRequests = ptoRequests.filter(req => req.status === 'pending')

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-xl text-gray-800">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            PTO Management Dashboard
          </h1>
          <p className="text-lg text-gray-800">
            Manage employee PTO requests
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Calendar 
              ptoRequests={ptoRequests}
              className="w-full"
            />
          </div>

          {/* Pending Requests */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Pending Requests
            </h2>
            
            {pendingRequests.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No pending PTO requests
              </p>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {request.employee?.name || 'Unknown Employee'}
                        </h3>
                        <p className="text-sm text-gray-800">
                          {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          Requested: {new Date(request.requested_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApprove(request.id)}
                        disabled={processing === request.id}
                        className="flex-1 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {processing === request.id ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleDeny(request.id)}
                        disabled={processing === request.id}
                        className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {processing === request.id ? 'Processing...' : 'Deny'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-blue-500">
              {ptoRequests.filter(req => req.status === 'approved').length}
            </div>
            <div className="text-gray-800">Approved</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-yellow-500">
              {ptoRequests.filter(req => req.status === 'pending').length}
            </div>
            <div className="text-gray-800">Pending</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-red-500">
              {ptoRequests.filter(req => req.status === 'denied').length}
            </div>
            <div className="text-gray-800">Denied</div>
          </div>
        </div>
      </div>
    </div>
  )
}
