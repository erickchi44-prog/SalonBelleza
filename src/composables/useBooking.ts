import { shallowRef, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { supabase } from '../lib/supabase'
import { useServices } from './useServices'
import { useSpecialists } from './useSpecialists'
import { toDbTime } from '../utils/time'
import type { Specialist } from '../types'

export const steps = [
  { key: 'service', label: 'Servicio' },
  { key: 'specialist', label: 'Especialista' },
  { key: 'datetime', label: 'Fecha & Hora' },
  { key: 'confirm', label: 'Confirmación' }
]

export const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '01:00 PM', '01:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM'
]

export function useBooking() {
  const router = useRouter()
  const toast = useToast()
  const { serviceOptions, loading: loadingServices, fetchServices } = useServices()
  const { specialists, loading: loadingSpecialists, fetchSpecialists } = useSpecialists()

  const currentStep = shallowRef(0)
  const loadingSubmit = shallowRef(false)
  const notes = shallowRef('')
  const selectedServiceId = shallowRef<number | null>(null)
  const selectedSpecialistId = shallowRef<number | null>(null)
  const selectedDate = shallowRef<Date | null>(null)
  const selectedTime = shallowRef('')

  const minDate = new Date()

  const selectedService = computed(() => serviceOptions.value.find(s => s.value === selectedServiceId.value))
  const selectedSpecialist = computed(() => specialists.value.find(s => s.id === selectedSpecialistId.value))

  const formattedDate = computed(() =>
    selectedDate.value
      ? selectedDate.value.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      : ''
  )

  const canProceed = computed(() => {
    if (currentStep.value === 0) return !!selectedServiceId.value
    if (currentStep.value === 1) return !!selectedSpecialistId.value
    if (currentStep.value === 2) return !!selectedDate.value && !!selectedTime.value
    return true
  })

  function selectService(id: number | null) { selectedServiceId.value = id }
  function selectSpecialist(id: number | null) { selectedSpecialistId.value = id }
  function selectDate(date: Date | null) { selectedDate.value = date }
  function selectTime(time: string) { selectedTime.value = time }
  function nextStep() { currentStep.value++ }
  function prevStep() { currentStep.value-- }

  async function confirmBooking() {
    const { data: { user: u } } = await supabase.auth.getUser()
    if (!u) {
      router.push('/login')
      return
    }

    loadingSubmit.value = true
    const { error } = await supabase.from('appointments').insert({
      user_id: u.id,
      customer_name: u.email,
      service_id: selectedServiceId.value,
      specialist_id: selectedSpecialistId.value,
      appointment_date: selectedDate.value?.toISOString().split('T')[0],
      appointment_time: toDbTime(selectedTime.value),
      notes: notes.value,
      status: 'Pendiente'
    })
    loadingSubmit.value = false

    if (error) {
      toast.add({ severity: 'error', summary: 'Error', detail: error.message, life: 4000 })
      return
    }

    toast.add({
      severity: 'success', summary: 'Cita Confirmada!',
      detail: `Tu cita para el ${selectedDate.value?.toLocaleDateString('es-MX')} a las ${selectedTime.value} ha sido registrada.`,
      life: 4000
    })
    setTimeout(() => router.push('/feedback'), 2500)
  }

  onMounted(() => {
    fetchServices()
    fetchSpecialists()
  })

  return {
    currentStep,
    loadingSubmit,
    loadingServices,
    loadingSpecialists,
    notes,
    serviceOptions,
    specialists,
    selectedService,
    selectedSpecialist,
    selectedDate,
    selectedTime,
    formattedDate,
    minDate,
    canProceed,
    selectService,
    selectSpecialist,
    selectDate,
    selectTime,
    nextStep,
    prevStep,
    confirmBooking,
    selectedServiceId,
    selectedSpecialistId
  }
}
