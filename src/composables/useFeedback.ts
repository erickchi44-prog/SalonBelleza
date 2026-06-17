import { shallowRef, computed } from 'vue'
import { supabase } from '../lib/supabase'
import type { FeedbackDisplay } from '../types'

export function useFeedback() {
  const reviews = shallowRef<FeedbackDisplay[]>([])
  const loading = shallowRef(false)

  const averageRating = computed(() => {
    if (reviews.value.length === 0) return '0.0'
    const sum = reviews.value.reduce((a, r) => a + r.rating, 0)
    return (sum / reviews.value.length).toFixed(1)
  })

  async function fetchReviews() {
    loading.value = true
    const { data, error } = await supabase
      .from('feedback')
      .select('*, services(title)')
      .order('created_at', { ascending: false })
    if (!error && data) {
      reviews.value = data.map((r: any) => ({
        id: r.id,
        customerName: r.customer_name,
        date: new Date(r.created_at).toLocaleDateString('es-MX'),
        rating: r.rating,
        comment: r.comment,
        serviceName: r.services?.title || '-'
      }))
    }
    loading.value = false
  }

  async function submitFeedback(payload: {
    user_id: string
    customer_name: string
    service_id: number
    rating: number
    comment: string
  }) {
    return supabase.from('feedback').insert(payload)
  }

  return { reviews, loading, averageRating, fetchReviews, submitFeedback }
}
