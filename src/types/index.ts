export interface Service {
  id: number
  title: string
  description: string
  price: number
  duration: number
  category: string
  imageUrl?: string
  active: boolean
}

export interface ServiceOption {
  label: string
  value: number
  duration: number
  price: number
}

export interface Specialist {
  id: number
  name: string
  specialty: string
  bio: string
  years_exp: number
  appointments: number
  rating: number
  active: boolean
  imageUrl?: string
}

export interface AppointmentService {
  id: number
  appointment_id: number
  service_id: number
}

export interface Appointment {
  id: number
  user_id: string
  customer_name: string
  service_ids: number[]
  specialist_id: number
  appointment_date: string
  appointment_time: string
  notes?: string
  status: 'Pendiente' | 'Confirmada' | 'Completada' | 'Cancelada'
  created_at: string
}

export interface AppointmentDisplay {
  id?: number
  customer: string
  services: string[]
  specialist: string
  time: string
  status: string
  date?: string
}

export interface Feedback {
  id: number
  user_id: string
  customer_name: string
  service_id: number
  rating: number
  comment: string
  created_at: string
}

export interface FeedbackDisplay {
  id: number
  customerName: string
  date: string
  rating: number
  comment: string
  serviceName: string
}

export interface Promotion {
  id: number
  title: string
  description: string
  discount: number
  valid_until: string
  service_id: number | null
  active: boolean
  created_at: string
}

export interface PromotionDisplay {
  id: number
  title: string
  description: string
  discount: number
  validUntil: string
  service: string
  active: boolean
}

export interface Schedule {
  id: number | null
  specialist_id: number
  day_of_week: number
  active: boolean
  start_time: string
  end_time: string
  break_start: string | null
  break_end: string | null
}

export interface Profile {
  id: string
  full_name?: string
  role: 'client' | 'admin'
  phone?: string
}

export interface KpiCard {
  label: string
  value: string
  trend: number
  icon: string
  iconBg: string
  iconColor: string
}

export interface QuickAction {
  label: string
  path: string
  icon: string
}
