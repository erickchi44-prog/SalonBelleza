import { shallowRef } from 'vue'
import { supabase } from '../lib/supabase'
import type { PromotionDisplay } from '../types'

export function usePromotions() {
  const promotions = shallowRef<PromotionDisplay[]>([])
  const loading = shallowRef(false)

  async function fetchPromotions() {
    loading.value = true
    const { data, error } = await supabase
      .from('promotions')
      .select('*, services(title)')
      .order('created_at', { ascending: false })
    if (!error && data) {
      promotions.value = data.map((p: any) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        discount: p.discount,
        validUntil: p.valid_until ? new Date(p.valid_until).toLocaleDateString('es-MX') : '-',
        service: p.services?.title || 'Todos los servicios',
        active: p.active
      }))
    }
    loading.value = false
  }

  async function savePromotion(payload: any, id?: number | null) {
    if (id) {
      await supabase.from('promotions').update(payload).eq('id', id)
    } else {
      await supabase.from('promotions').insert(payload)
    }
    await fetchPromotions()
  }

  async function deletePromotion(id: number) {
    await supabase.from('promotions').delete().eq('id', id)
    await fetchPromotions()
  }

  return { promotions, loading, fetchPromotions, savePromotion, deletePromotion }
}
