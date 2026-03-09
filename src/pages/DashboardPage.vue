<template>
  <div class="px-4 py-4 space-y-5 animate-fade-in">
    <!-- Balance Summary -->
    <BalanceSummary
      :totalBalance="walletsStore.totalBalance"
      :totalIncome="transactionsStore.totalIncome"
      :totalExpense="transactionsStore.totalExpense"
    />

    <!-- Wallet Carousel -->
    <WalletCarousel
      :wallets="walletsStore.activeWallets"
      @add="router.push('/wallets')"
      @select="(w) => router.push('/wallets')"
    />

    <!-- Quick Actions -->
    <QuickStats @action="handleQuickAction" />

    <!-- Budget Alerts -->
    <div v-if="overBudgets.length" class="space-y-2">
      <h3 class="text-sm font-semibold text-amber-400 flex items-center gap-1.5">
        ⚠️ Peringatan Budget
      </h3>
      <div v-for="b in overBudgets" :key="b.id" class="glass-card p-3 border border-amber-500/20 flex items-center gap-3">
        <span class="text-lg">{{ b.categories?.icon || '📦' }}</span>
        <div class="flex-1">
          <p class="text-xs font-medium text-white">{{ b.categories?.name }}</p>
          <p class="text-[10px] text-amber-400">Budget hampir habis</p>
        </div>
      </div>
    </div>

    <!-- Recent Transactions -->
    <RecentTransactions
      :transactions="transactionsStore.recentTransactions"
      :loading="transactionsStore.loading"
    />

    <!-- FAB -->
    <button
      @click="showForm = true"
      class="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center text-2xl text-white shadow-lg glow-primary active:scale-90 transition-transform z-30"
      style="right: max(16px, calc((100vw - 430px) / 2 + 16px));"
    >
      +
    </button>

    <!-- Transaction Form Sheet -->
    <BottomSheet v-model="showForm" title="Tambah Transaksi">
      <TransactionForm
        ref="formRef"
        :categories="categories"
        :wallets="walletsStore.wallets"
        :submitting="submitting"
        @submit="handleAddTransaction"
        @scan="showScanner = true"
      />
    </BottomSheet>

    <!-- Receipt Scanner Sheet -->
    <BottomSheet v-model="showScanner" title="Scan Struk Belanja">
      <ReceiptScanner @apply="handleScanResult" />
    </BottomSheet>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTransactionsStore } from '@/stores/transactions'
import { useWalletsStore } from '@/stores/wallets'
import { useBudgetsStore } from '@/stores/budgets'
import { useAuthStore } from '@/stores/auth'
import { useCategories } from '@/composables/useCategories'
import { useToast } from '@/composables/useToast'

import BalanceSummary from '@/components/dashboard/BalanceSummary.vue'
import WalletCarousel from '@/components/dashboard/WalletCarousel.vue'
import QuickStats from '@/components/dashboard/QuickStats.vue'
import RecentTransactions from '@/components/dashboard/RecentTransactions.vue'
import BottomSheet from '@/components/common/BottomSheet.vue'
import TransactionForm from '@/components/transaction/TransactionForm.vue'
import ReceiptScanner from '@/components/transaction/ReceiptScanner.vue'

const router = useRouter()
const transactionsStore = useTransactionsStore()
const walletsStore = useWalletsStore()
const budgetsStore = useBudgetsStore()
const authStore = useAuthStore()
const { categories, fetchCategories } = useCategories()
const toast = useToast()

const showForm = ref(false)
const showScanner = ref(false)
const submitting = ref(false)
const formRef = ref(null)

const overBudgets = computed(() => {
  return budgetsStore.budgets.filter(b => {
    const spent = transactionsStore.transactions
      .filter(t => t.category_id === b.category_id && t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0)
    return (spent / Number(b.amount)) >= 0.8
  })
})

function handleQuickAction(type) {
  if (type === 'report') {
    router.push('/report')
    return
  }
  showForm.value = true
  if (formRef.value) {
    formRef.value.form.type = type
  }
}

async function handleAddTransaction(data) {
  submitting.value = true
  try {
    const payload = {
      user_id: authStore.user.id,
      type: data.type,
      amount: data.amount,
      category_id: data.category_id || null,
      wallet_id: data.wallet_id || null,
      date: data.date,
      note: data.note || null,
    }
    await transactionsStore.addTransaction(payload)
    await walletsStore.fetchWallets()
    showForm.value = false
    toast.success('Transaksi berhasil disimpan! ✅')
  } catch (err) {
    toast.error('Gagal menyimpan: ' + err.message)
  } finally {
    submitting.value = false
  }
}

function handleScanResult(result) {
  showScanner.value = false
  showForm.value = true
  if (formRef.value) {
    formRef.value.form.type = 'expense'
    formRef.value.form.amount = result.total_amount || 0
    formRef.value.form.date = result.date || new Date().toISOString().slice(0, 10)
    formRef.value.form.note = result.merchant_name || ''
  }
}

onMounted(async () => {
  await Promise.all([
    transactionsStore.fetchTransactions({ limit: 20 }),
    walletsStore.fetchWallets(),
    budgetsStore.fetchBudgets(),
    fetchCategories(),
  ])
})
</script>
