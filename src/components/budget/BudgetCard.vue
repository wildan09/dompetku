<template>
  <div class="glass-card p-4">
    <div class="flex items-center justify-between mb-3">
      <div class="flex items-center gap-2">
        <span class="text-lg">{{ budget.categories?.icon || '📦' }}</span>
        <div>
          <p class="text-sm font-semibold text-white">{{ budget.categories?.name || 'Kategori' }}</p>
          <p class="text-xs text-surface-400">{{ formatCurrency(spent) }} / {{ formatCurrency(budget.amount) }}</p>
        </div>
      </div>
      <span class="text-sm font-bold" :class="percentClass">{{ percent }}%</span>
    </div>

    <!-- Progress Bar -->
    <div class="progress-bar">
      <div
        class="progress-fill"
        :class="barColorClass"
        :style="{ width: Math.min(percent, 100) + '%' }"
      ></div>
    </div>

    <!-- Remaining -->
    <div class="flex justify-between mt-2">
      <span class="text-xs text-surface-400">
        Sisa: {{ formatCurrency(Math.max(0, Number(budget.amount) - spent)) }}
      </span>
      <span v-if="percent >= 90" class="text-xs text-danger-400 font-medium">⚠️ Hampir habis</span>
      <span v-else-if="percent >= 70" class="text-xs text-amber-400 font-medium">⚡ Hati-hati</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatCurrency } from '@/utils/currency'

const props = defineProps({
  budget: { type: Object, required: true },
  spent: { type: Number, default: 0 },
})

const percent = computed(() => {
  if (!props.budget.amount || Number(props.budget.amount) === 0) return 0
  return Math.round((props.spent / Number(props.budget.amount)) * 100)
})

const percentClass = computed(() => {
  if (percent.value >= 90) return 'text-danger'
  if (percent.value >= 70) return 'text-amber-400'
  return 'text-primary'
})

const barColorClass = computed(() => {
  if (percent.value >= 90) return 'bg-gradient-to-r from-danger-600 to-danger'
  if (percent.value >= 70) return 'bg-gradient-to-r from-amber-600 to-amber-400'
  return 'bg-gradient-to-r from-primary-600 to-primary'
})
</script>
