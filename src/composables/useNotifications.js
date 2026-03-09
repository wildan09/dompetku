import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export function useNotifications() {
  const permission = ref(Notification.permission || 'default')
  const settings = ref(null)

  async function requestPermission() {
    if (!('Notification' in window)) return false
    const result = await Notification.requestPermission()
    permission.value = result
    return result === 'granted'
  }

  function showNotification(title, options = {}) {
    if (permission.value !== 'granted') return
    return new Notification(title, {
      icon: '/vite.svg',
      badge: '/vite.svg',
      ...options,
    })
  }

  function checkBudgetAlert(budgets, transactions) {
    budgets.forEach(budget => {
      const spent = transactions
        .filter(t => t.category_id === budget.category_id && t.type === 'expense')
        .reduce((sum, t) => sum + Number(t.amount), 0)
      const pct = (spent / Number(budget.amount)) * 100
      if (pct >= 80 && pct < 100) {
        showNotification('⚠️ Budget Hampir Habis', {
          body: `${budget.categories?.name}: ${Math.round(pct)}% terpakai`,
          tag: `budget-${budget.id}`,
        })
      } else if (pct >= 100) {
        showNotification('🚨 Budget Terlampaui!', {
          body: `${budget.categories?.name}: sudah melebihi budget`,
          tag: `budget-${budget.id}`,
        })
      }
    })
  }

  async function fetchSettings() {
    const { data } = await supabase
      .from('notification_settings')
      .select('*')
      .single()
    settings.value = data
    return data
  }

  async function updateSettings(updates) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('notification_settings')
      .upsert({ user_id: user.id, ...updates })
      .select()
      .single()
    if (error) throw error
    settings.value = data
    return data
  }

  return {
    permission, settings,
    requestPermission, showNotification,
    checkBudgetAlert, fetchSettings, updateSettings
  }
}
