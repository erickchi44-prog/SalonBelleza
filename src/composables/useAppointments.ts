import { shallowRef } from 'vue'
import { supabase } from '../lib/supabase'
import type { Appointment } from '../types'

export function useAppointments() {
  const appointments = shallowRef<Appointment[]>([])
  const loading = shallowRef(false)

  async function fetchAppointments(filters?: { specialistId?: number | null }) {
    loading.value = true
    let query = supabase
      .from('appointments')
      .select('id, customer_name, appointment_date, appointment_time, status, services(title), specialists(name)')

    if (filters?.specialistId) {
      query = query.eq('specialist_id', filters.specialistId)
    }

    const { data, error } = await query.order('appointment_date').order('appointment_time')
    if (!error && data) {
      appointments.value = data.map((a: any) => ({
        id: a.id,
        customer: a.customer_name,
        service: a.services?.title || '-',
        specialist: a.specialists?.name || '-',
        time: a.appointment_time?.slice(0, 5) || '-',
        status: a.status,
        date: a.appointment_date
      })) as any
    }
    loading.value = false
  }

  async function createAppointment(payload: {
    customer_name: string
    service_id: number
    specialist_id: number
    appointment_date: string
    appointment_time: string
    notes?: string
    status?: string
    user_id?: string
  }) {
    return supabase.from('appointments').insert({
      ...payload,
      status: payload.status || 'Pendiente'
    })
  }

  return { appointments, loading, fetchAppointments, createAppointment }
}
