import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/lib/supabase'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/auth/LoginPage.vue'),
    meta: { requiresAuth: false, layout: 'auth' }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/pages/auth/RegisterPage.vue'),
    meta: { requiresAuth: false, layout: 'auth' }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/pages/DashboardPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/transactions',
    name: 'Transactions',
    component: () => import('@/pages/TransactionsPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/budget',
    name: 'Budget',
    component: () => import('@/pages/BudgetPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/report',
    name: 'Report',
    component: () => import('@/pages/ReportPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/savings',
    name: 'Savings',
    component: () => import('@/pages/SavingsPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/wallets',
    name: 'Wallets',
    component: () => import('@/pages/WalletsPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/pages/ProfilePage.vue'),
    meta: { requiresAuth: true }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Auth Guard
router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession()

  if (to.meta.requiresAuth && !session) {
    next('/login')
  } else if (to.meta.requiresAuth === false && session) {
    next('/')
  } else {
    next()
  }
})

export default router
