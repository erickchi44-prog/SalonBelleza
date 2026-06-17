import { shallowRef } from 'vue'
import { supabase } from '../lib/supabase'
import type { Specialist } from '../types'

export function useSpecialists() {
  const specialists = shallowRef<Specialist[]>([])
  const loading = shallowRef(false)

  async function fetchSpecialists() {
    loading.value = true
    const { data, error } = await supabase
      .from('specialists')
      .select('id, name, specialty, bio, years_exp, appointments, rating, active')
      .eq('active', true)
      .order('id')
    if (!error && data) specialists.value = data as Specialist[]
    loading.value = false
  }

  async function fetchAllSpecialists() {
    loading.value = true
    const { data, error } = await supabase
      .from('specialists')
      .select('*')
      .order('id')
    if (!error && data) specialists.value = data
    loading.value = false
  }

  async function saveSpecialist(payload: Partial<Specialist>, id?: number | null) {
    if (id) {
      await supabase.from('specialists').update(payload).eq('id', id)
    } else {
      await supabase.from('specialists').insert({ ...payload, appointments: 0, rating: 0 })
    }
    await fetchAllSpecialists()
  }

  async function getSpecialistOptions() {
    const { data } = await supabase
      .from('specialists')
      .select('id, name')
      .eq('active', true)
      .order('id')
    return (data || []).map(s => ({ label: s.name, value: s.id }))
  }

  return { specialists, loading, fetchSpecialists, fetchAllSpecialists, saveSpecialist, getSpecialistOptions }
}
