import { supabaseAdmin } from './supabase'

const USE_MOCK_SMS = process.env.USE_MOCK_SMS === 'true'

export interface SMSMessage {
  to: string
  from: string
  body: string
}

export class SMSService {
  private static instance: SMSService
  private managerPhone: string

  constructor() {
    this.managerPhone = process.env.MANAGER_PHONE_NUMBER || '+1234567890'
  }

  static getInstance(): SMSService {
    if (!SMSService.instance) {
      SMSService.instance = new SMSService()
    }
    return SMSService.instance
  }

  async sendSMS(to: string, message: string): Promise<boolean> {
    try {
      if (USE_MOCK_SMS) {
        console.log(`📱 MOCK SMS to ${to}: ${message}`)
        await this.logSMS('+1234567890', to, message, 'outbound')
        return true
      } else {
        // TODO: Implement Twilio SMS sending
        const { default: twilio } = await import('twilio')
        const client = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        )

        await client.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: to
        })

        await this.logSMS(process.env.TWILIO_PHONE_NUMBER!, to, message, 'outbound')
        return true
      }
    } catch (error) {
      console.error('Error sending SMS:', error)
      return false
    }
  }

  async sendToManager(message: string): Promise<boolean> {
    return this.sendSMS(this.managerPhone, message)
  }

  async logSMS(from: string, to: string, message: string, direction: 'inbound' | 'outbound'): Promise<void> {
    try {
      await supabaseAdmin
        .from('sms_logs')
        .insert({
          from_number: from,
          to_number: to,
          message: message,
          direction: direction
        })
    } catch (error) {
      console.error('Error logging SMS:', error)
    }
  }

  parsePTORequest(message: string): { startDate: string; endDate: string } | null {
    // Parse various date formats
    const patterns = [
      // "Request PTO for 12/15, 12/16"
      /request pto for (\d{1,2}\/\d{1,2}),?\s*(\d{1,2}\/\d{1,2})/i,
      // "Request PTO 12/15-12/17"
      /request pto (\d{1,2}\/\d{1,2})-(\d{1,2}\/\d{1,2})/i,
      // "PTO 12/15 to 12/17"
      /pto (\d{1,2}\/\d{1,2}) to (\d{1,2}\/\d{1,2})/i,
      // "Request PTO 12/15"
      /request pto (\d{1,2}\/\d{1,2})/i
    ]

    for (const pattern of patterns) {
      const match = message.match(pattern)
      if (match) {
        const currentYear = new Date().getFullYear()
        const startDate = this.parseDate(match[1], currentYear)
        const endDate = match[2] ? this.parseDate(match[2], currentYear) : startDate

        if (startDate && endDate) {
          // Format dates as YYYY-MM-DD without timezone conversion
          const formatDate = (date: Date) => {
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            return `${year}-${month}-${day}`
          }
          
          return {
            startDate: formatDate(startDate),
            endDate: formatDate(endDate)
          }
        }
      }
    }

    return null
  }

  private parseDate(dateStr: string, year: number): Date | null {
    const [month, day] = dateStr.split('/').map(Number)
    if (month && day && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      // Create date in local timezone and set to start of day to avoid timezone issues
      const date = new Date(year, month - 1, day)
      date.setHours(0, 0, 0, 0)
      return date
    }
    return null
  }
}

export const smsService = SMSService.getInstance()
