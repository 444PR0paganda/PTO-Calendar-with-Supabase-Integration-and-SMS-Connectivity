import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            PTO Calendar System
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage employee time off requests with SMS integration and real-time calendar display
          </p>
        </div>

        {/* Quick Access Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Link 
            href="/display" 
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-200 group cursor-pointer"
          >
            <div className="flex items-center">
              <div className="text-3xl mr-4 group-hover:scale-110 transition-transform duration-200">📺</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">TV Display</h3>
                <p className="text-gray-600 text-sm">Full-screen calendar for shop TV</p>
              </div>
            </div>
          </Link>

          <Link 
            href="/manage" 
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-200 group cursor-pointer"
          >
            <div className="flex items-center">
              <div className="text-3xl mr-4 group-hover:scale-110 transition-transform duration-200">👨‍💼</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">Management</h3>
                <p className="text-gray-600 text-sm">Approve or deny PTO requests</p>
              </div>
            </div>
          </Link>

          <Link 
            href="/admin" 
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-200 group cursor-pointer"
          >
            <div className="flex items-center">
              <div className="text-3xl mr-4 group-hover:scale-110 transition-transform duration-200">⚙️</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">Admin</h3>
                <p className="text-gray-600 text-sm">Manage employees and settings</p>
              </div>
            </div>
          </Link>

          <Link 
            href="/test-sms" 
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-all duration-200 group cursor-pointer"
          >
            <div className="flex items-center">
              <div className="text-3xl mr-4 group-hover:scale-110 transition-transform duration-200">📱</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors duration-200">Test SMS</h3>
                <p className="text-gray-600 text-sm">Simulate employee PTO requests</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Features */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            System Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">For Employees</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Text PTO requests to your company phone number
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Receive instant SMS confirmations
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Multiple date format support
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  View calendar on shop TV
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">For Managers</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Web-based approval interface
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Real-time calendar updates
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  SMS notifications for new requests
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  Employee management tools
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Start */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-blue-800 mb-4">Quick Start Guide</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-700">
            <li>Go to <strong>Admin</strong> and add your employees with their phone numbers</li>
            <li>Set the manager phone number for PTO notifications</li>
            <li>Use <strong>Test SMS</strong> to simulate employee PTO requests</li>
            <li>Go to <strong>Management</strong> to approve or deny requests</li>
            <li>Display the <strong>TV Display</strong> on your shop TV for everyone to see</li>
          </ol>
        </div>
      </div>
    </div>
  )
}