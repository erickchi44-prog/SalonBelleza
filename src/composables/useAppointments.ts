import { shallowRef } from 'vue'
import { supabase } from '../lib/supabase'

export function useAppointments() {
  const appointments = shallowRef<any[]>([])
  const loading = shallowRef(false)

  async function fetchAppointments(filters?: { specialistId?: number | null }) {
    loading.value = true
    let query = supabase
      .from('appointments')
      .select(`
        id, customer_name, appointment_date, appointment_time, status,
        appointment_services(service_id, services(title)),
        specialists(name)
      `)

    if (filters?.specialistId) {
      query = query.eq('specialist_id', filters.specialistId)
    }

    const { data, error } = await query.order('appointment_date').order('appointment_time')
    if (!error && data) {
      appointments.value = data.map((a: any) => ({
        id: a.id,
        customer: a.customer_name,
        services: a.appointment_services?.map((as: any) => as.services?.title || '-') || [],
        specialist: a.specialists?.name || '-',
        time: a.appointment_time?.slice(0, 5) || '-',
        status: a.status,
        date: a.appointment_date
      }))
    }
    loading.value = false
  }

  async function createAppointment(payload: {
    customer_name: string
    service_ids: number[]
    specialist_id: number
    appointment_date: string
    appointment_time: string
    notes?: string
    status?: string
    user_id?: string
  }) {
    const { service_ids, ...appointmentData } = payload
    const { data, error } = await supabase.from('appointments').insert({
      ...appointmentData,
      status: payload.status || 'Pendiente'
    }).select('id').single()

    if (error) return { data: null, error }

    const appointmentId = data.id
    const { error: relError } = await supabase.from('appointment_services').insert(
      service_ids.map(service_id => ({ appointment_id: appointmentId, service_id }))
    )

    if (relError) {
      await supabase.from('appointments').delete().eq('id', appointmentId)
      return { data: null, error: relError }
    }

    return { data: { id: appointmentId }, error: null }
  }

  return { appointments, loading, fetchAppointments, createAppointment }
}
