import { shallowRef } from 'vue'
import { supabase } from '../lib/supabase'
import { toDbTime } from '../utils/time'

export interface MyAppointmentItem {
  id: number
  customer: string
  services: string[]
  serviceIds: number[]
  specialist: string
  specialistId: number
  time: string
  date: string
  status: string
}

export function useMyAppointments() {
  const appointments = shallowRef<MyAppointmentItem[]>([])
  const loading = shallowRef(false)

  async function fetchMyAppointments(userId: string) {
    loading.value = true
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        id, customer_name, appointment_date, appointment_time, status, specialist_id,
        appointment_services(service_id, services(title)),
        specialists(name)
      `)
      .eq('user_id', userId)
      .order('appointment_date', { ascending: false })
      .order('appointment_time', { ascending: false })

    if (!error && data) {
      appointments.value = data.map((a: any) => ({
        id: a.id,
        customer: a.customer_name,
        services: a.appointment_services?.map((as: any) => as.services?.title || '-') || [],
        serviceIds: a.appointment_services?.map((as: any) => as.service_id) || [],
        specialist: a.specialists?.name || '-',
        specialistId: a.specialist_id,
        time: a.appointment_time?.slice(0, 5) || '-',
        date: a.appointment_date,
        status: a.status
      }))
    }
    loading.value = false
  }

  async function cancelAppointment(id: number): Promise<string | null> {
    const { data, error } = await supabase
      .from('appointments')
      .update({ status: 'Cancelada' })
      .eq('id', id)
      .select('id')

    if (error) return error.message
    if (!data || data.length === 0) return 'No se encontró la cita o no tienes permisos para cancelarla.'
    return null
  }

  async function rescheduleAppointment(id: number, date: string, time: string): Promise<string | null> {
    const { data, error } = await supabase
      .from('appointments')
      .update({
        appointment_date: date,
        appointment_time: toDbTime(time)
      })
      .eq('id', id)
      .select('id')

    if (error) return error.message
    if (!data || data.length === 0) return 'No se encontró la cita o no tienes permisos para reagendarla.'
    return null
  }

  return {
    appointments,
    loading,
    fetchMyAppointments,
    cancelAppointment,
    rescheduleAppointment
  }
}
