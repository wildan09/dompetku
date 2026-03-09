import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import dayjs from 'dayjs'

export const useBudgetsStore = defineStore('budgets', () => {
  const budgets = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchBudgets(month, year) {
    loading.value = true
    const m = month || dayjs().month() + 1
    const y = year || dayjs().year()
    try {
      const { data, error: err } = await supabase
        .from('budgets')
        .select(`*, categories(name, icon, color)`)
        .eq('month', m)
        .eq('year', y)
        .order('created_at', { ascending: false })
      if (err) throw err
      budgets.value = data || []
      return data
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function addBudget(budget) {
    const { data, error: err } = await supabase
      .from('budgets')
      .insert(budget)
      .select(`*, categories(name, icon, color)`)
      .single()
    if (err) throw err
    budgets.value.push(data)
    return data
  }

  async function updateBudget(id, updates) {
    const { data, error: err } = await supabase
      .from('budgets')
      .update(updates)
      .eq('id', id)
      .select(`*, categories(name, icon, color)`)
      .single()
    if (err) throw err
    const idx = budgets.value.findIndex(b => b.id === id)
    if (idx !== -1) budgets.value[idx] = data
    return data
  }

  async function deleteBudget(id) {
    const { error: err } = await supabase.from('budgets').delete().eq('id', id)
    if (err) throw err
    budgets.value = budgets.value.filter(b => b.id !== id)
  }

  return {
    budgets, loading, error,
    fetchBudgets, addBudget, updateBudget, deleteBudget
  }
})
