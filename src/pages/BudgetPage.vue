<template>
  <div class="px-4 py-4 space-y-5 animate-fade-in">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-bold font-display">Budget Bulanan</h1>
      <button @click="showForm = true" class="btn-primary text-sm px-4 py-2">+ Tambah</button>
    </div>

    <!-- Month Selector -->
    <div class="flex items-center justify-center gap-4">
      <button @click="prevMonth" class="btn-ghost">←</button>
      <span class="text-sm font-semibold text-white">{{ monthLabel }}</span>
      <button @click="nextMonth" class="btn-ghost">→</button>
    </div>

    <!-- Budget List -->
    <AppLoader v-if="budgetsStore.loading" />
    <EmptyState v-else-if="!budgetsStore.budgets.length" icon="📊" title="Belum Ada Budget" description="Atur budget per kategori untuk mengontrol pengeluaran." actionLabel="+ Buat Budget" @action="showForm = true" />
    <div v-else class="space-y-3">
      <BudgetCard
        v-for="budget in budgetsStore.budgets"
        :key="budget.id"
        :budget="budget"
        :spent="getSpent(budget.category_id)"
      />
    </div>

    <!-- Add Budget Form -->
    <BottomSheet v-model="showForm" title="Tambah Budget">
      <div class="space-y-4">
        <div>
          <label class="input-label">Kategori</label>
          <select v-model="form.category_id" class="input-field">
            <option value="">Pilih kategori</option>
            <option v-for="cat in expenseCategories" :key="cat.id" :value="cat.id">
              {{ cat.icon }} {{ cat.name }}
            </option>
          </select>
        </div>
        <CurrencyInput v-model="form.amount" label="Batas Budget" />
        <button @click="handleAdd" :disabled="!form.category_id || !form.amount" class="btn-primary w-full" :class="{ 'opacity-50': !form.category_id || !form.amount }">
          Simpan Budget
        </button>
      </div>
    </BottomSheet>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { useBudgetsStore } from '@/stores/budgets'
import { useTransactionsStore } from '@/stores/transactions'
import { useAuthStore } from '@/stores/auth'
import { useCategories } from '@/composables/useCategories'
import { useToast } from '@/composables/useToast'
import { getMonthName } from '@/utils/date'
import BudgetCard from '@/components/budget/BudgetCard.vue'
import BottomSheet from '@/components/common/BottomSheet.vue'
import CurrencyInput from '@/components/common/CurrencyInput.vue'
import AppLoader from '@/components/common/AppLoader.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const budgetsStore = useBudgetsStore()
const transactionsStore = useTransactionsStore()
const authStore = useAuthStore()
const { categories, fetchCategories } = useCategories()
const toast = useToast()

const currentMonth = ref(dayjs().month() + 1)
const currentYear = ref(dayjs().year())
const showForm = ref(false)
const form = reactive({ category_id: '', amount: 0 })

const monthLabel = computed(() => `${getMonthName(currentMonth.value)} ${currentYear.value}`)

const expenseCategories = computed(() => categories.value.filter(c => c.type === 'expense'))

function getSpent(categoryId) {
  return transactionsStore.transactions
    .filter(t => t.category_id === categoryId && t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0)
}

function prevMonth() {
  if (currentMonth.value === 1) { currentMonth.value = 12; currentYear.value-- }
  else currentMonth.value--
  loadData()
}

function nextMonth() {
  if (currentMonth.value === 12) { currentMonth.value = 1; currentYear.value++ }
  else currentMonth.value++
  loadData()
}

async function handleAdd() {
  try {
    await budgetsStore.addBudget({
      user_id: authStore.user.id,
      category_id: form.category_id,
      amount: form.amount,
      period: 'monthly',
      month: currentMonth.value,
      year: currentYear.value,
    })
    showForm.value = false
    form.category_id = ''
    form.amount = 0
    toast.success('Budget berhasil dibuat! ✅')
  } catch (err) {
    toast.error('Gagal: ' + err.message)
  }
}

async function loadData() {
  const startDate = dayjs().year(currentYear.value).month(currentMonth.value - 1).startOf('month').format('YYYY-MM-DD')
  const endDate = dayjs().year(currentYear.value).month(currentMonth.value - 1).endOf('month').format('YYYY-MM-DD')
  await Promise.all([
    budgetsStore.fetchBudgets(currentMonth.value, currentYear.value),
    transactionsStore.fetchTransactions({ startDate, endDate, type: 'expense' }),
  ])
}

onMounted(async () => {
  await fetchCategories()
  await loadData()
})
</script>
