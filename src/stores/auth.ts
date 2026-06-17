import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  const user = ref<any>(null)
  const profile = ref<Profile | null>(null)
  const loading = ref(true)

  async function refresh() {
    loading.value = true
    const { data: { user: u } } = await supabase.auth.getUser()
    user.value = u
    if (u) {
      const { data: p } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', u.id)
        .single()
      profile.value = p
    } else {
      profile.value = null
    }
    loading.value = false
  }

  async function login(email: string, password: string) {
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) throw new Error(err.message)
    await refresh()
    const role = profile.value?.role
    if (role === 'admin') router.push('/admin/dashboard')
    else router.push('/booking')
  }

  async function register(fullName: string, email: string, phone: string, password: string) {
    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone } }
    })
    if (err) throw new Error(err.message)
    router.push('/login')
  }

  async function logout() {
    await supabase.auth.signOut()
    user.value = null
    profile.value = null
    router.push('/login')
  }

  return { user, profile, loading, login, register, logout, refresh }
})
