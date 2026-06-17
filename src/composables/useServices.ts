import { shallowRef, computed } from 'vue'
import { supabase } from '../lib/supabase'
import type { Service, ServiceOption } from '../types'

export function useServices() {
  const services = shallowRef<Service[]>([])
  const loading = shallowRef(false)
  const searchQuery = shallowRef('')
  const selectedCategory = shallowRef('TODOS')

  const categories = ['TODOS', 'CABELLO', 'MANICURA & PEDICURA', 'FACIALES', 'BIENESTAR']

  const filteredServices = computed(() =>
    services.value.filter(s => {
      const q = searchQuery.value.toLowerCase()
      const matchesSearch = s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)
      const matchesCategory = selectedCategory.value === 'TODOS' || s.category === selectedCategory.value
      return matchesSearch && matchesCategory
    })
  )

  const serviceOptions = computed<ServiceOption[]>(() =>
    services.value.map(s => ({
      label: s.title,
      value: s.id,
      duration: s.duration,
      price: s.price
    }))
  )

  const serviceMap = computed(() =>
    new Map(services.value.map(s => [s.id, s]))
  )

  async function fetchServices() {
    loading.value = true
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('active', true)
      .order('id')
    if (!error && data) services.value = data
    loading.value = false
  }

  function getServiceById(id: number | null): Service | undefined {
    if (id === null) return undefined
    return serviceMap.value.get(id)
  }

  return {
    services,
    loading,
    searchQuery,
    selectedCategory,
    categories,
    filteredServices,
    serviceOptions,
    fetchServices,
    getServiceById
  }
}
