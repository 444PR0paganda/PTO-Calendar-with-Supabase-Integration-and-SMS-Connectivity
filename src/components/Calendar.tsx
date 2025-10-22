'use client'

import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay, startOfWeek } from 'date-fns'
import { PTORequest } from '@/lib/supabase'

interface CalendarProps {
  ptoRequests: PTORequest[]
  onDateClick?: (date: Date) => void
  showControls?: boolean
  className?: string
}

export default function Calendar({ ptoRequests, onDateClick, showControls = true, className = '' }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })
  
  // Get the first day of the week for the month start (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = getDay(monthStart)
  
  // Create empty cells for days before the month starts
  const emptyCells = Array.from({ length: firstDayOfWeek }, (_, i) => null)
  
  // Combine empty cells with actual days
  const calendarDays = [...emptyCells, ...daysInMonth]

  // Get PTO requests for the current month
  const getPTOForDate = (date: Date) => {
    return ptoRequests.filter(request => {
      // Parse dates and normalize to start of day to avoid timezone issues
      const startDate = new Date(request.start_date + 'T00:00:00')
      const endDate = new Date(request.end_date + 'T00:00:00')
      const currentDate = new Date(date)
      
      // Set current date to start of day for accurate comparison
      currentDate.setHours(0, 0, 0, 0)
      
      return currentDate >= startDate && currentDate <= endDate
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500 text-white'
      case 'pending':
        return 'bg-yellow-500 text-white'
      case 'denied':
        return 'bg-red-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1))
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      {/* Month Header */}
      <div className="text-center mb-6">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="w-24 h-1 bg-blue-500 mx-auto rounded"></div>
      </div>

      {showControls && (
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigateMonth('prev')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            ← Previous
          </button>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-700">
              {format(currentDate, 'MMMM yyyy')}
            </div>
            <div className="text-sm text-gray-500">
              Navigate months
            </div>
          </div>
          <button
            onClick={() => navigateMonth('next')}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Next →
          </button>
        </div>
      )}

      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, index) => {
          // Handle empty cells (days before month starts)
          if (day === null) {
            return (
              <div
                key={index}
                className="min-h-[80px] p-2 border border-gray-100 rounded-lg bg-gray-50"
              >
                {/* Empty cell */}
              </div>
            )
          }
          
          const ptoForDay = getPTOForDate(day)
          const isToday = isSameDay(day, new Date())
          
          return (
            <div
              key={index}
              className={`
                min-h-[80px] p-2 border border-gray-200 rounded-lg cursor-pointer
                ${isToday ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'}
                ${onDateClick ? 'hover:shadow-md transition-shadow' : ''}
              `}
              onClick={() => onDateClick?.(day)}
            >
              <div className="text-sm font-medium text-gray-800 mb-1">
                {format(day, 'd')}
              </div>
              
              <div className="space-y-1">
                {ptoForDay.map((request, idx) => (
                  <div
                    key={idx}
                    className={`
                      text-xs px-2 py-1 rounded truncate
                      ${getStatusColor(request.status)}
                    `}
                    title={`${request.employee?.name || 'Unknown'} - ${request.status}`}
                  >
                    {request.employee?.name || 'Unknown'}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 flex justify-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-sm text-gray-600">Approved</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span className="text-sm text-gray-600">Pending</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-sm text-gray-600">Denied</span>
        </div>
      </div>
    </div>
  )
}
