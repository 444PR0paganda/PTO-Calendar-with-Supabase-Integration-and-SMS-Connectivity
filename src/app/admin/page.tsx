'use client'

import { useState, useEffect } from 'react'
import { Employee } from '@/lib/supabase'

export default function AdminPage() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null)
  const [adminPassword, setAdminPassword] = useState('')
  const [adminError, setAdminError] = useState('')
  const [adminLoading, setAdminLoading] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [newEmployee, setNewEmployee] = useState({ name: '', phone_number: '' })
  const [managerPhone, setManagerPhone] = useState('')
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [editForm, setEditForm] = useState({ name: '', phone_number: '' })

  const checkAdminAuth = async () => {
    try {
      const res = await fetch('/api/auth/admin/me')
      setSignedIn(res.ok)
    } catch {
      setSignedIn(false)
    }
  }

  useEffect(() => {
    checkAdminAuth()
  }, [])

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdminError('')
    setAdminLoading(true)
    try {
      const res = await fetch('/api/auth/admin/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword })
      })
      if (res.ok) {
        setSignedIn(true)
        setAdminPassword('')
      } else {
        const data = await res.json()
        setAdminError(data.error || 'Invalid password')
      }
    } catch {
      setAdminError('Something went wrong')
    } finally {
      setAdminLoading(false)
    }
  }

  const handleAdminSignOut = async () => {
    await fetch('/api/auth/admin/signout', { method: 'POST' })
    setSignedIn(false)
  }

  const fetchData = async () => {
    try {
      const employeesResponse = await fetch('/api/admin/employees')
      if (employeesResponse.ok) {
        const employeesData = await employeesResponse.json()
        setEmployees(employeesData.employees || [])
      }

      const managerResponse = await fetch('/api/admin/manager-phone')
      if (managerResponse.ok) {
        const managerData = await managerResponse.json()
        setManagerPhone(managerData.phone || '')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (signedIn) fetchData()
  }, [signedIn])

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmployee.name || !newEmployee.phone_number) return

    try {
      const response = await fetch('/api/admin/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEmployee)
      })

      if (response.ok) {
        setNewEmployee({ name: '', phone_number: '' })
        fetchData() // Refresh the list
      } else {
        alert('Failed to add employee')
      }
    } catch (error) {
      console.error('Error adding employee:', error)
      alert('Error adding employee')
    }
  }

  const handleDeleteEmployee = async (employeeId: string) => {
    try {
      // First, try to delete without PTO requests
      let response = await fetch(`/api/admin/employees/${employeeId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deletePtoRequests: false })
      })

      if (response.ok) {
        fetchData() // Refresh the list
        alert('Employee deleted successfully')
        return
      }

      // If employee has PTO requests, ask what to do
      const errorData = await response.json()
      if (errorData.hasPtoRequests) {
        const action = confirm(
          `This employee has ${errorData.ptoCount} PTO request(s). Do you want to delete the employee AND all their PTO requests?`
        )
        
        if (action) {
          response = await fetch(`/api/admin/employees/${employeeId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deletePtoRequests: true })
          })

          if (response.ok) {
            const result = await response.json()
            fetchData() // Refresh the list
            alert(`Employee and ${result.deletedPtoRequests} PTO request(s) deleted successfully`)
          } else {
            const errorData = await response.json()
            alert(`Failed to delete employee: ${errorData.error || 'Unknown error'}`)
          }
        }
      } else {
        alert(`Failed to delete employee: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting employee:', error)
      alert(`Error deleting employee: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee)
    setEditForm({
      name: employee.name,
      phone_number: employee.phone_number
    })
  }

  const handleCancelEdit = () => {
    setEditingEmployee(null)
    setEditForm({ name: '', phone_number: '' })
  }

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingEmployee) return

    try {
      const response = await fetch(`/api/admin/employees/${editingEmployee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })

      if (response.ok) {
        fetchData() // Refresh the list
        setEditingEmployee(null)
        setEditForm({ name: '', phone_number: '' })
        alert('Employee updated successfully')
      } else {
        const errorData = await response.json()
        alert(`Failed to update employee: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error updating employee:', error)
      alert('Error updating employee')
    }
  }

  const handleUpdateManagerPhone = async () => {
    try {
      const response = await fetch('/api/admin/manager-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: managerPhone })
      })

      if (response.ok) {
        alert('Manager phone number updated successfully')
      } else {
        alert('Failed to update manager phone number')
      }
    } catch (error) {
      console.error('Error updating manager phone:', error)
      alert('Error updating manager phone number')
    }
  }

  if (signedIn === null) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    )
  }

  if (!signedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Admin sign in</h1>
          <p className="text-gray-600 text-sm mb-6">Enter the admin password to continue.</p>
          <form onSubmit={handleAdminSignIn} className="space-y-4">
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="input-field"
              placeholder="Password"
              required
            />
            {adminError && <p className="text-sm text-red-600">{adminError}</p>}
            <button
              type="submit"
              disabled={adminLoading}
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {adminLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    )
  }

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
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-end mb-2">
            <button
              type="button"
              onClick={handleAdminSignOut}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Sign out
            </button>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Admin Configuration
          </h1>
          <p className="text-lg text-gray-800">
            Manage employees and system settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Employee Management */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Employee Management
            </h2>

            {/* Add Employee Form */}
            <form onSubmit={handleAddEmployee} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Add New Employee</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                    className="input-field"
                    placeholder="Employee Name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-800 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={newEmployee.phone_number}
                    onChange={(e) => setNewEmployee({ ...newEmployee, phone_number: e.target.value })}
                    className="input-field"
                    placeholder="+1234567890"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  Add Employee
                </button>
              </div>
            </form>

            {/* Employee List */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold mb-4">Current Employees</h3>
              {employees.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No employees added yet</p>
              ) : (
                employees.map((employee) => (
                  <div key={employee.id} className="p-3 bg-gray-50 rounded-lg">
                    {editingEmployee?.id === employee.id ? (
                      // Edit Form
                      <form onSubmit={handleUpdateEmployee} className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-800 mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="input-field"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-800 mb-1">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            value={editForm.phone_number}
                            onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                            className="input-field"
                            required
                          />
                        </div>
                        <div className="flex space-x-2">
                          <button
                            type="submit"
                            className="flex-1 bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600 transition-colors"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="flex-1 bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      // Display Mode
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{employee.name}</div>
                          <div className="text-sm text-gray-800">{employee.phone_number}</div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditEmployee(employee)}
                            className="text-blue-500 hover:text-blue-700 px-2 py-1"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteEmployee(employee.id)}
                            className="text-red-500 hover:text-red-700 px-2 py-1"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* System Settings */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              System Settings
            </h2>

            {/* Manager Phone */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Manager Phone Number</h3>
              <div className="flex space-x-2">
                <input
                  type="tel"
                  value={managerPhone}
                  onChange={(e) => setManagerPhone(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1234567890"
                />
                <button
                  onClick={handleUpdateManagerPhone}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  Update
                </button>
              </div>
              <p className="text-sm text-gray-800 mt-2">
                Optional: for future notifications (e.g. new PTO requests)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
