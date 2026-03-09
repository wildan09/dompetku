import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

export const useTransactionsStore = defineStore('transactions', () => {
  const transactions = ref([])
  const loading = ref(false)
  const error = ref(null)

  const recentTransactions = computed(() => transactions.value.slice(0, 5))

  const totalIncome = computed(() =>
    transactions.value
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0)
  )

  const totalExpense = computed(() =>
    transactions.value
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0)
  )

  const netBalance = computed(() => totalIncome.value - totalExpense.value)

  async function fetchTransactions(filters = {}) {
    loading.value = true
    error.value = null
    try {
      let query = supabase
        .from('transactions')
        .select(`*, categories(name, icon, color), wallets(name, type, icon)`)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      if (filters.type) query = query.eq('type', filters.type)
      if (filters.category_id) query = query.eq('category_id', filters.category_id)
      if (filters.wallet_id) query = query.eq('wallet_id', filters.wallet_id)
      if (filters.startDate) query = query.gte('date', filters.startDate)
      if (filters.endDate) query = query.lte('date', filters.endDate)
      if (filters.search) query = query.ilike('note', `%${filters.search}%`)
      if (filters.limit) query = query.limit(filters.limit)

      const { data, error: err } = await query
      if (err) throw err
      transactions.value = data || []
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function addTransaction(transaction) {
    const { data, error: err } = await supabase
      .from('transactions')
      .insert(transaction)
      .select(`*, categories(name, icon, color), wallets(name, type, icon)`)
      .single()
    if (err) throw err

    // Update wallet balance
    if (transaction.wallet_id) {
      const modifier = transaction.type === 'income' ? 1 : -1
      await supabase.rpc('update_wallet_balance', {
        p_wallet_id: transaction.wallet_id,
        p_amount: Number(transaction.amount) * modifier
      }).catch(() => {
        // Fallback: manual update
        updateWalletBalance(transaction.wallet_id, Number(transaction.amount), transaction.type)
      })
    }

    transactions.value.unshift(data)
    return data
  }

  async function updateTransaction(id, updates) {
    const { data, error: err } = await supabase
      .from('transactions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`*, categories(name, icon, color), wallets(name, type, icon)`)
      .single()
    if (err) throw err
    const idx = transactions.value.findIndex(t => t.id === id)
    if (idx !== -1) transactions.value[idx] = data
    return data
  }

  async function deleteTransaction(id) {
    const tx = transactions.value.find(t => t.id === id)
    const { error: err } = await supabase.from('transactions').delete().eq('id', id)
    if (err) throw err

    // Reverse wallet balance
    if (tx && tx.wallet_id) {
      const modifier = tx.type === 'income' ? -1 : 1
      await updateWalletBalance(tx.wallet_id, Number(tx.amount), tx.type === 'income' ? 'expense' : 'income')
    }

    transactions.value = transactions.value.filter(t => t.id !== id)
  }

  async function updateWalletBalance(walletId, amount, type) {
    const { data: wallet } = await supabase.from('wallets').select('balance').eq('id', walletId).single()
    if (wallet) {
      const newBalance = type === 'income'
        ? Number(wallet.balance) + amount
        : Number(wallet.balance) - amount
      await supabase.from('wallets').update({ balance: newBalance }).eq('id', walletId)
    }
  }

  async function uploadReceipt(file, transactionId) {
    const ext = file.name.split('.').pop()
    const filePath = `receipts/${transactionId}.${ext}`
    const { error: err } = await supabase.storage.from('receipts').upload(filePath, file, { upsert: true })
    if (err) throw err
    const { data: { publicUrl } } = supabase.storage.from('receipts').getPublicUrl(filePath)
    await updateTransaction(transactionId, { receipt_url: publicUrl })
    return publicUrl
  }

  return {
    transactions, loading, error,
    recentTransactions, totalIncome, totalExpense, netBalance,
    fetchTransactions, addTransaction, updateTransaction, deleteTransaction, uploadReceipt
  }
})
