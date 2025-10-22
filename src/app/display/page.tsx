'use client'

import { useState, useEffect } from 'react'
import Calendar from '@/components/Calendar'
import { PTORequest } from '@/lib/supabase'

export default function DisplayPage() {
  const [ptoRequests, setPtoRequests] = useState<PTORequest[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchPTORequests = async () => {
    try {
      const response = await fetch('/api/pto/requests')
      if (response.ok) {
        const data = await response.json()
        setPtoRequests(data.ptoRequests || [])
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('Error fetching PTO requests:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPTORequests()
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchPTORequests, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-xl text-gray-800">Loading PTO Calendar...</p>
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
            PTO Calendar
          </h1>
          <p className="text-lg text-gray-800">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>

        {/* Calendar */}
        <div className="flex justify-center">
          <Calendar 
            ptoRequests={ptoRequests}
            showControls={false}
            className="w-full max-w-6xl"
          />
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500">
          <p>This display refreshes automatically every 5 minutes</p>
        </div>
      </div>
    </div>
  )
}
