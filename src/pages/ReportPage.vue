<template>
  <div class="px-4 py-4 space-y-5 animate-fade-in">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-bold font-display">Laporan</h1>
      <div class="flex gap-2">
        <button @click="exportPDF" class="btn-ghost text-xs flex items-center gap-1" :disabled="exporting">📄 PDF</button>
        <button @click="exportExcel" class="btn-ghost text-xs flex items-center gap-1" :disabled="exporting">📊 Excel</button>
      </div>
    </div>

    <!-- Period Toggle -->
    <div class="flex bg-surface-800 rounded-xl p-1 gap-1">
      <button
        v-for="p in periods"
        :key="p.value"
        @click="selectedPeriod = p.value"
        class="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
        :class="selectedPeriod === p.value ? 'bg-primary text-white' : 'text-surface-400'"
      >
        {{ p.label }}
      </button>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-2 gap-3">
      <div class="glass-card p-4 text-center">
        <p class="text-xs text-surface-400 mb-1">Pemasukan</p>
        <p class="text-lg font-bold text-primary font-display">{{ formatCurrency(totalIncome) }}</p>
      </div>
      <div class="glass-card p-4 text-center">
        <p class="text-xs text-surface-400 mb-1">Pengeluaran</p>
        <p class="text-lg font-bold text-danger font-display">{{ formatCurrency(totalExpense) }}</p>
      </div>
    </div>

    <!-- Bar Chart -->
    <div class="glass-card p-4">
      <h3 class="text-sm font-semibold text-surface-300 mb-3">Pemasukan vs Pengeluaran</h3>
      <ChartBar :categories="barLabels" :series="barSeries" :height="250" />
    </div>

    <!-- Donut Chart -->
    <div class="glass-card p-4">
      <h3 class="text-sm font-semibold text-surface-300 mb-3">Pengeluaran per Kategori</h3>
      <ChartDonut :labels="donutLabels" :series="donutSeries" :colors="donutColors" />
    </div>

    <!-- Category Breakdown Table -->
    <div class="glass-card p-4">
      <h3 class="text-sm font-semibold text-surface-300 mb-3">Detail per Kategori</h3>
      <div class="space-y-2">
        <div v-for="cat in categoryBreakdown" :key="cat.name" class="flex items-center justify-between py-2 border-b border-surface-800 last:border-0">
          <div class="flex items-center gap-2">
            <span>{{ cat.icon }}</span>
            <span class="text-sm text-white">{{ cat.name }}</span>
          </div>
          <div class="text-right">
            <p class="text-sm font-semibold text-surface-200">{{ formatCurrency(cat.total) }}</p>
            <p class="text-[10px] text-surface-500">{{ cat.percentage }}%</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import dayjs from 'dayjs'
import { useTransactionsStore } from '@/stores/transactions'
import { formatCurrency } from '@/utils/currency'
import { useExport } from '@/composables/useExport'
import ChartDonut from '@/components/report/ChartDonut.vue'
import ChartBar from '@/components/report/ChartBar.vue'

const transactionsStore = useTransactionsStore()
const { exporting, exportToPDF, exportToExcel } = useExport()

const selectedPeriod = ref('monthly')
const periods = [
  { value: 'weekly', label: 'Mingguan' },
  { value: 'monthly', label: 'Bulanan' },
  { value: 'yearly', label: 'Tahunan' },
]

const filteredTx = computed(() => {
  const now = dayjs()
  return transactionsStore.transactions.filter(t => {
    const d = dayjs(t.date)
    if (selectedPeriod.value === 'weekly') return d.isAfter(now.subtract(7, 'day'))
    if (selectedPeriod.value === 'monthly') return d.month() === now.month() && d.year() === now.year()
    return d.year() === now.year()
  })
})

const totalIncome = computed(() => filteredTx.value.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0))
const totalExpense = computed(() => filteredTx.value.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0))

const categoryBreakdown = computed(() => {
  const map = {}
  filteredTx.value.filter(t => t.type === 'expense').forEach(t => {
    const name = t.categories?.name || 'Lainnya'
    const icon = t.categories?.icon || '📦'
    const color = t.categories?.color || '#64748B'
    if (!map[name]) map[name] = { name, icon, color, total: 0 }
    map[name].total += Number(t.amount)
  })
  const items = Object.values(map).sort((a, b) => b.total - a.total)
  const total = items.reduce((s, i) => s + i.total, 0)
  return items.map(i => ({ ...i, percentage: total ? Math.round((i.total / total) * 100) : 0 }))
})

const donutLabels = computed(() => categoryBreakdown.value.map(c => c.name))
const donutSeries = computed(() => categoryBreakdown.value.map(c => c.total))
const donutColors = computed(() => categoryBreakdown.value.map(c => c.color))

const barLabels = computed(() => {
  if (selectedPeriod.value === 'yearly') {
    return Array.from({ length: 12 }, (_, i) => dayjs().month(i).format('MMM'))
  }
  if (selectedPeriod.value === 'weekly') {
    return Array.from({ length: 7 }, (_, i) => dayjs().subtract(6 - i, 'day').format('dd'))
  }
  const daysInMonth = dayjs().daysInMonth()
  return Array.from({ length: Math.ceil(daysInMonth / 7) }, (_, i) => `W${i + 1}`)
})

const barSeries = computed(() => {
  const incomeData = barLabels.value.map(() => 0)
  const expenseData = barLabels.value.map(() => 0)
  // Simplified: show total in first bar
  if (barLabels.value.length > 0) {
    incomeData[0] = totalIncome.value
    expenseData[0] = totalExpense.value
  }
  return [
    { name: 'Pemasukan', data: incomeData },
    { name: 'Pengeluaran', data: expenseData },
  ]
})

function exportPDF() {
  exportToPDF(filteredTx.value, { income: totalIncome.value, expense: totalExpense.value }, selectedPeriod.value === 'monthly' ? 'Bulanan' : selectedPeriod.value === 'weekly' ? 'Mingguan' : 'Tahunan')
}

function exportExcel() {
  exportToExcel(filteredTx.value, { income: totalIncome.value, expense: totalExpense.value }, categoryBreakdown.value)
}

onMounted(async () => {
  await transactionsStore.fetchTransactions()
})
</script>
