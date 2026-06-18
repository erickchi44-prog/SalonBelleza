import { shallowRef, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { supabase } from '../lib/supabase'
import { useServices } from './useServices'
import { useSpecialists } from './useSpecialists'
import { toDbTime, toDisplayTime } from '../utils/time'
import type { Specialist, ServiceOption } from '../types'

export const steps = [
  { key: 'service', label: 'Servicio' },
  { key: 'specialist', label: 'Especialista' },
  { key: 'datetime', label: 'Fecha & Hora' },
  { key: 'confirm', label: 'Confirmación' }
]

interface DaySchedule {
  day_of_week: number
  active: boolean
  start_time: string
  end_time: string
  break_start: string | null
  break_end: string | null
}

function generateTimeSlots(start: string, end: string, breakStart: string | null, breakEnd: string | null): string[] {
  const slots: string[] = []
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const startMin = sh * 60 + sm
  const endMin = eh * 60 + em
  const breakStartMin = breakStart ? (() => { const [h, m] = breakStart.split(':').map(Number); return h * 60 + m })() : -1
  const breakEndMin = breakEnd ? (() => { const [h, m] = breakEnd.split(':').map(Number); return h * 60 + m })() : -1

  for (let m = startMin; m < endMin; m += 30) {
    if (m >= breakStartMin && m < breakEndMin) continue
    const hh = Math.floor(m / 60)
    const mm = m % 60
    const ampm = hh >= 12 ? 'PM' : 'AM'
    const displayH = hh === 0 ? 12 : hh > 12 ? hh - 12 : hh
    slots.push(`${displayH}:${String(mm).padStart(2, '0')} ${ampm}`)
  }
  return slots
}

export function useBooking() {
  const router = useRouter()
  const toast = useToast()
  const { serviceOptions, loading: loadingServices, fetchServices } = useServices()
  const { specialists, loading: loadingSpecialists, fetchSpecialists } = useSpecialists()

  const currentStep = shallowRef(0)
  const loadingSubmit = shallowRef(false)
  const loadingSlots = shallowRef(false)
  const notes = shallowRef('')
  const selectedServiceIds = shallowRef<number[]>([])
  const selectedSpecialistId = shallowRef<number | null>(null)
  const selectedDate = shallowRef<Date | null>(null)
  const selectedTime = shallowRef('')

  const weekSchedule = shallowRef<DaySchedule[]>([])
  const occupiedSlots = shallowRef<string[]>([])

  const today = new Date()
  const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const selectedServices = computed<ServiceOption[]>(() =>
    serviceOptions.value.filter(s => selectedServiceIds.value.includes(s.value))
  )
  const selectedSpecialist = computed(() => specialists.value.find(s => s.id === selectedSpecialistId.value))

  const totalPrice = computed(() => selectedServices.value.reduce((sum, s) => sum + s.price, 0))
  const totalDuration = computed(() => selectedServices.value.reduce((sum, s) => sum + s.duration, 0))

  const formattedDate = computed(() =>
    selectedDate.value
      ? selectedDate.value.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      : ''
  )

  const canProceed = computed(() => {
    if (currentStep.value === 0) return selectedServiceIds.value.length > 0
    if (currentStep.value === 1) return !!selectedSpecialistId.value
    if (currentStep.value === 2) return !!selectedDate.value && !!selectedTime.value
    return true
  })

  const availableTimeSlots = computed(() => {
    if (!selectedDate.value || weekSchedule.value.length === 0) return []
    const dow = selectedDate.value.getDay()
    const daySched = weekSchedule.value.find(s => s.day_of_week === dow)
    if (!daySched || !daySched.active) return []
    const slots = generateTimeSlots(daySched.start_time, daySched.end_time, daySched.break_start, daySched.break_end)
    return slots.filter(s => !occupiedSlots.value.includes(s))
  })

  const disabledDates = computed(() => {
    if (weekSchedule.value.length === 0) return []
    const activeDays = new Set(weekSchedule.value.filter(s => s.active).map(s => s.day_of_week))
    const dates: Date[] = []
    const start = new Date(minDate)
    const end = new Date(start)
    end.setMonth(end.getMonth() + 3)
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (!activeDays.has(d.getDay())) {
        dates.push(new Date(d))
      }
    }
    return dates
  })

  function toggleService(id: number) {
    const idx = selectedServiceIds.value.indexOf(id)
    if (idx >= 0) {
      selectedServiceIds.value = selectedServiceIds.value.filter(i => i !== id)
    } else {
      selectedServiceIds.value = [...selectedServiceIds.value, id]
    }
  }

  function selectSpecialist(id: number | null) {
    selectedSpecialistId.value = id
    selectedDate.value = null
    selectedTime.value = ''
  }
  function selectDate(date: Date | null) {
    selectedDate.value = date
    selectedTime.value = ''
  }
  function selectTime(time: string) { selectedTime.value = time }
  function nextStep() { currentStep.value++ }
  function prevStep() { currentStep.value-- }

  async function fetchSchedule(specialistId: number) {
    const { data } = await supabase
      .from('schedules')
      .select('*')
      .eq('specialist_id', specialistId)
      .order('day_of_week')

    if (data && data.length > 0) {
      weekSchedule.value = data.map((s: any) => ({
        day_of_week: s.day_of_week,
        active: s.active,
        start_time: s.start_time,
        end_time: s.end_time,
        break_start: s.break_start,
        break_end: s.break_end
      }))
    } else {
      weekSchedule.value = []
    }
  }

  async function fetchOccupiedSlots(specialistId: number, date: Date) {
    const dateStr = date.toISOString().split('T')[0]
    const { data } = await supabase
      .from('appointments')
      .select('appointment_time')
      .eq('specialist_id', specialistId)
      .eq('appointment_date', dateStr)
      .neq('status', 'Cancelada')

    occupiedSlots.value = (data || []).map((a: any) => toDisplayTime(a.appointment_time))
  }

  watch(selectedSpecialistId, async (id) => {
    if (id) {
      await fetchSchedule(id)
    } else {
      weekSchedule.value = []
    }
  })

  watch(selectedDate, async (date) => {
    if (date && selectedSpecialistId.value) {
      loadingSlots.value = true
      await fetchOccupiedSlots(selectedSpecialistId.value, date)
      loadingSlots.value = false
    } else {
      occupiedSlots.value = []
    }
  })

  async function confirmBooking() {
    const { data: { user: u } } = await supabase.auth.getUser()
    if (!u) {
      router.push('/login')
      return
    }

    loadingSubmit.value = true

    const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', u.id).single()
    const { data: appointment, error: apptError } = await supabase.from('appointments').insert({
      user_id: u.id,
      customer_name: profile?.full_name || u.email,
      specialist_id: selectedSpecialistId.value,
      appointment_date: selectedDate.value?.toISOString().split('T')[0],
      appointment_time: toDbTime(selectedTime.value),
      notes: notes.value,
      status: 'Pendiente'
    }).select('id').single()

    if (apptError) {
      loadingSubmit.value = false
      toast.add({ severity: 'error', summary: 'Error', detail: apptError.message, life: 4000 })
      return
    }

    const { error: relError } = await supabase.from('appointment_services').insert(
      selectedServiceIds.value.map(service_id => ({
        appointment_id: appointment.id,
        service_id
      }))
    )

    loadingSubmit.value = false

    if (relError) {
      await supabase.from('appointments').delete().eq('id', appointment.id)
      toast.add({ severity: 'error', summary: 'Error', detail: relError.message, life: 4000 })
      return
    }

    toast.add({
      severity: 'success', summary: 'Cita Confirmada!',
      detail: `Tu cita para el ${selectedDate.value?.toLocaleDateString('es-MX')} a las ${selectedTime.value} ha sido registrada.`,
      life: 4000
    })
    setTimeout(() => router.push('/my-appointments'), 2500)
  }

  onMounted(() => {
    fetchServices()
    fetchSpecialists()
  })

  return {
    currentStep,
    loadingSubmit,
    loadingSlots,
    loadingServices,
    loadingSpecialists,
    notes,
    serviceOptions,
    specialists,
    selectedServices,
    selectedSpecialist,
    selectedDate,
    selectedTime,
    totalPrice,
    totalDuration,
    formattedDate,
    minDate,
    disabledDates,
    availableTimeSlots,
    canProceed,
    toggleService,
    selectSpecialist,
    selectDate,
    selectTime,
    nextStep,
    prevStep,
    confirmBooking,
    selectedServiceIds,
    selectedSpecialistId
  }
}
