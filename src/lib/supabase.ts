import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for client-side operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client for server-side operations with elevated permissions
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Database types
export interface Employee {
  id: string
  phone_number: string
  name: string
  created_at: string
}

export interface PTORequest {
  id: string
  employee_id: string
  start_date: string
  end_date: string
  status: 'pending' | 'approved' | 'denied'
  requested_at: string
  reviewed_at?: string
  reviewed_by?: string
  employee?: Employee
}
