import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export const useSavingsStore = defineStore('savings', () => {
  const goals = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchGoals() {
    loading.value = true
    try {
      const { data, error: err } = await supabase
        .from('savings_goals')
        .select('*')
        .order('created_at', { ascending: false })
      if (err) throw err
      goals.value = data || []
      return data
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function addGoal(goal) {
    const { data, error: err } = await supabase
      .from('savings_goals')
      .insert(goal)
      .select()
      .single()
    if (err) throw err
    goals.value.unshift(data)
    return data
  }

  async function updateGoal(id, updates) {
    const { data, error: err } = await supabase
      .from('savings_goals')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (err) throw err
    const idx = goals.value.findIndex(g => g.id === id)
    if (idx !== -1) goals.value[idx] = data
    return data
  }

  async function addFunds(id, amount) {
    const goal = goals.value.find(g => g.id === id)
    if (!goal) throw new Error('Goal tidak ditemukan')
    const newAmount = Number(goal.current_amount) + Number(amount)
    const isCompleted = newAmount >= Number(goal.target_amount)
    return updateGoal(id, { current_amount: newAmount, is_completed: isCompleted })
  }

  async function deleteGoal(id) {
    const { error: err } = await supabase.from('savings_goals').delete().eq('id', id)
    if (err) throw err
    goals.value = goals.value.filter(g => g.id !== id)
  }

  return {
    goals, loading, error,
    fetchGoals, addGoal, updateGoal, addFunds, deleteGoal
  }
})
