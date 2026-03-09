<template>
  <div class="glass-card p-5 relative overflow-hidden">
    <!-- Background Gradient -->
    <div class="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none"></div>

    <div class="relative">
      <div class="flex items-center justify-between mb-1">
        <span class="text-sm text-surface-400">Total Saldo</span>
        <button
          @click="showBalance = !showBalance"
          class="text-surface-400 hover:text-white transition-colors text-sm active:scale-90"
        >
          {{ showBalance ? '👁️' : '🙈' }}
        </button>
      </div>

      <Transition name="fade" mode="out-in">
        <h2
          v-if="showBalance"
          key="shown"
          class="text-3xl font-bold font-display text-white tracking-tight"
        >
          {{ formatCurrency(totalBalance) }}
        </h2>
        <h2
          v-else
          key="hidden"
          class="text-3xl font-bold font-display text-white tracking-tight"
        >
          Rp ••••••
        </h2>
      </Transition>

      <!-- Income / Expense Summary -->
      <div class="flex items-center gap-4 mt-4">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <span class="text-sm">↗️</span>
          </div>
          <div>
            <p class="text-xs text-surface-400">Pemasukan</p>
            <p class="text-sm font-semibold text-primary">{{ formatCurrency(totalIncome) }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-danger/20 flex items-center justify-center">
            <span class="text-sm">↘️</span>
          </div>
          <div>
            <p class="text-xs text-surface-400">Pengeluaran</p>
            <p class="text-sm font-semibold text-danger">{{ formatCurrency(totalExpense) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { formatCurrency } from '@/utils/currency'

defineProps({
  totalBalance: { type: Number, default: 0 },
  totalIncome: { type: Number, default: 0 },
  totalExpense: { type: Number, default: 0 },
})

const showBalance = ref(true)
</script>
