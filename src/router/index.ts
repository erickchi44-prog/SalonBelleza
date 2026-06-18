import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { supabase } from '../lib/supabase'
import DefaultLayout from '../layouts/DefaultLayout.vue'
import AdminLayout from '../layouts/AdminLayout.vue'

const routes: RouteRecordRaw[] = [
  { path: '/login',    name: 'login',    component: () => import('../views/LoginView.vue') },
  { path: '/register', name: 'register', component: () => import('../views/RegisterView.vue') },
  { path: '/forgot-password', name: 'forgot-password', component: () => import('../views/ForgotPasswordView.vue') },
  {
    path: '/',
    component: DefaultLayout,
    redirect: '/services',
    children: [
      { path: 'services', name: 'services', component: () => import('../views/ServicesView.vue') },
      { path: 'booking',  name: 'booking',  component: () => import('../views/BookingView.vue') },
      { path: 'feedback', name: 'feedback', component: () => import('../views/FeedbackView.vue') },
      { path: 'my-appointments', name: 'my-appointments', component: () => import('../views/MyAppointmentsView.vue') }
    ]
  },
  {
    path: '/admin',
    component: AdminLayout,
    redirect: '/admin/dashboard',
    children: [
      { path: 'dashboard',  name: 'admin-dashboard',  component: () => import('../views/admin/AdminDashboardView.vue') },
      { path: 'calendar',   name: 'admin-calendar',   component: () => import('../views/admin/AdminCalendarView.vue') },
      { path: 'specialists',name: 'admin-specialists',component: () => import('../views/admin/AdminSpecialistsView.vue') },
      { path: 'promotions', name: 'admin-promotions', component: () => import('../views/admin/AdminPromotionsView.vue') },
      { path: 'feedback',   name: 'admin-feedback',   component: () => import('../views/admin/AdminFeedbackView.vue') },
      { path: 'schedules',  name: 'admin-schedules',  component: () => import('../views/admin/AdminSchedulesView.vue') },
      { path: 'analytics',  name: 'admin-analytics',  component: () => import('../views/admin/AdminAnalyticsView.vue') }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/services' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

router.beforeEach(async (to, _from, next) => {
  const { data: { user } } = await supabase.auth.getUser()

  const publicRoutes = ['login', 'register', 'forgot-password', 'services', 'feedback']

  if (!user && !publicRoutes.includes(to.name as string)) {
    return next({ name: 'login' })
  }

  if (to.name === 'login' && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'admin') {
      return next({ name: 'admin-dashboard' })
    }
    return next({ name: 'services' })
  }

  if ((to.name as string)?.startsWith('admin-') && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return next({ name: 'services' })
    }
  }

  next()
})

export default router
