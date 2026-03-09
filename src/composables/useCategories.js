import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export function useCategories() {
  const categories = ref([])
  const loading = ref(false)

  async function fetchCategories(type = null) {
    loading.value = true
    try {
      let query = supabase.from('categories').select('*').order('name')
      if (type) query = query.eq('type', type)
      const { data, error } = await query
      if (error) throw error
      categories.value = data || []
      return data
    } finally {
      loading.value = false
    }
  }

  async function addCategory(category) {
    const { data, error } = await supabase.from('categories').insert(category).select().single()
    if (error) throw error
    categories.value.push(data)
    return data
  }

  async function updateCategory(id, updates) {
    const { data, error } = await supabase.from('categories').update(updates).eq('id', id).select().single()
    if (error) throw error
    const idx = categories.value.findIndex(c => c.id === id)
    if (idx !== -1) categories.value[idx] = data
    return data
  }

  async function deleteCategory(id) {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw error
    categories.value = categories.value.filter(c => c.id !== id)
  }

  const incomeCategories = () => categories.value.filter(c => c.type === 'income')
  const expenseCategories = () => categories.value.filter(c => c.type === 'expense')

  return {
    categories, loading,
    fetchCategories, addCategory, updateCategory, deleteCategory,
    incomeCategories, expenseCategories
  }
}
