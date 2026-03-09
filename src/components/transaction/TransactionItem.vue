<template>
  <div
    @click="$emit('click', transaction)"
    class="glass-card-hover p-3.5 flex items-center gap-3 cursor-pointer"
  >
    <!-- Category Icon -->
    <div
      class="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
      :style="{ backgroundColor: (transaction.categories?.color || '#334155') + '20' }"
    >
      {{ transaction.categories?.icon || (transaction.type === 'income' ? '💰' : transaction.type === 'transfer' ? '🔄' : '💸') }}
    </div>

    <!-- Details -->
    <div class="flex-1 min-w-0">
      <p class="text-sm font-semibold text-white truncate">
        {{ transaction.categories?.name || (transaction.type === 'transfer' ? 'Transfer' : 'Lainnya') }}
      </p>
      <p class="text-xs text-surface-400 truncate">
        {{ transaction.note || transaction.wallets?.name || '-' }}
      </p>
    </div>

    <!-- Amount -->
    <div class="text-right flex-shrink-0">
      <p
        class="text-sm font-bold"
        :class="transaction.type === 'income' ? 'text-primary' : transaction.type === 'expense' ? 'text-danger' : 'text-blue-400'"
      >
        {{ transaction.type === 'income' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
      </p>
      <p class="text-[10px] text-surface-500">{{ formatDate(transaction.date, 'DD MMM') }}</p>
    </div>
  </div>
</template>

<script setup>
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/date'

defineProps({
  transaction: { type: Object, required: true }
})

defineEmits(['click'])
</script>
