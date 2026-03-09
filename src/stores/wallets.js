import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

export const useWalletsStore = defineStore('wallets', () => {
  const wallets = ref([])
  const loading = ref(false)
  const error = ref(null)

  const totalBalance = computed(() =>
    wallets.value
      .filter(w => w.is_active)
      .reduce((sum, w) => sum + Number(w.balance), 0)
  )

  const activeWallets = computed(() => wallets.value.filter(w => w.is_active))

  async function fetchWallets() {
    loading.value = true
    try {
      const { data, error: err } = await supabase
        .from('wallets')
        .select('*')
        .order('created_at', { ascending: true })
      if (err) throw err
      wallets.value = data || []
      return data
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function addWallet(wallet) {
    const { data, error: err } = await supabase
      .from('wallets')
      .insert(wallet)
      .select()
      .single()
    if (err) throw err
    wallets.value.push(data)
    return data
  }

  async function updateWallet(id, updates) {
    const { data, error: err } = await supabase
      .from('wallets')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (err) throw err
    const idx = wallets.value.findIndex(w => w.id === id)
    if (idx !== -1) wallets.value[idx] = data
    return data
  }

  async function deleteWallet(id) {
    const { error: err } = await supabase.from('wallets').delete().eq('id', id)
    if (err) throw err
    wallets.value = wallets.value.filter(w => w.id !== id)
  }

  async function transferBetweenWallets(fromId, toId, amount) {
    const amt = Number(amount)
    const fromWallet = wallets.value.find(w => w.id === fromId)
    const toWallet = wallets.value.find(w => w.id === toId)
    if (!fromWallet || !toWallet) throw new Error('Wallet tidak ditemukan')

    await supabase.from('wallets').update({ balance: Number(fromWallet.balance) - amt }).eq('id', fromId)
    await supabase.from('wallets').update({ balance: Number(toWallet.balance) + amt }).eq('id', toId)

    fromWallet.balance = Number(fromWallet.balance) - amt
    toWallet.balance = Number(toWallet.balance) + amt
  }

  return {
    wallets, loading, error, totalBalance, activeWallets,
    fetchWallets, addWallet, updateWallet, deleteWallet, transferBetweenWallets
  }
})
