import { supabase } from './supabase'

type BookingData = {
  customer_name: string
  customer_email: string
  specialist_name: string
  appointment_date: string
  appointment_time: string
}

type FeedbackData = {
  customer_name: string
  customer_email: string
  comment: string
  rating: number
}

export async function sendBookingConfirmation(data: BookingData) {
  const { error } = await supabase.functions.invoke('booking-confirmation', {
    body: { record: data },
  })
  if (error) console.error('Error sending booking email:', error)
}

export async function sendFeedbackThankyou(data: FeedbackData) {
  const { error } = await supabase.functions.invoke('feedback-thankyou', {
    body: { record: data },
  })
  if (error) console.error('Error sending feedback email:', error)
}
