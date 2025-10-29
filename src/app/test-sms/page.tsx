'use client'

import { useState } from 'react'

export default function TestSMSPage() {
  const [formData, setFormData] = useState({
    phoneNumber: '+1234567890',
    message: 'Request PTO for 12/15, 12/16'
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/sms/incoming', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_number: formData.phoneNumber,
          message: formData.message
        })
      })

      const data = await response.json()

      if (response.ok) {
        setResult(`✅ Success: ${data.message}`)
      } else {
        setResult(`❌ Error: ${data.error}`)
      }
    } catch (error) {
      setResult(`❌ Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const exampleMessages = [
    'Request PTO for 12/15, 12/16',
    'Request PTO 12/15-12/17',
    'PTO 12/20 to 12/22',
    'Request PTO 12/25'
  ]

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Test SMS Interface
          </h1>
          <p className="text-lg text-gray-800">
            Simulate employee PTO requests via SMS
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="input-field"
                placeholder="+1234567890"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                This should match a phone number in your employee database
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                SMS Message
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="input-field"
                rows={3}
                placeholder="Request PTO for 12/15, 12/16"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Use one of the supported formats below
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Example Messages
              </label>
              <div className="space-y-2">
                {exampleMessages.map((example, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setFormData({ ...formData, message: example })}
                    className="block w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded border text-sm"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Sending...' : 'Send Test SMS'}
            </button>
          </form>

          {result && (
            <div className={`mt-6 p-4 rounded-lg ${
              result.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {result}
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">How to Test:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
              <li>First, add an employee with the phone number you want to test</li>
              <li>Go to the Admin page and add the employee</li>
              <li>Come back here and use that phone number</li>
              <li>Send a test message using one of the example formats</li>
              <li>Check the Management dashboard to see the pending request</li>
              <li>Approve or deny the request to test the full flow</li>
            </ol>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">About This Test Tool:</h3>
            <p className="text-sm text-blue-700">
              This test interface simulates incoming SMS messages by directly calling the webhook endpoint.
              It works with both mock and real Twilio SMS systems. Use this to test PTO request processing
              without sending actual text messages. All activity is logged to the database.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
