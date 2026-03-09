<template>
  <div>
    <h3 class="text-sm font-semibold text-surface-300 mb-3">Wallet</h3>
    <div class="flex gap-3 overflow-x-auto hide-scrollbar pb-2 -mx-1 px-1">
      <div
        v-for="wallet in wallets"
        :key="wallet.id"
        class="flex-shrink-0 w-[200px] rounded-2xl p-4 relative overflow-hidden transition-transform duration-200 active:scale-95 cursor-pointer"
        :style="{ background: `linear-gradient(135deg, ${wallet.color || '#1E293B'}, ${wallet.color || '#1E293B'}dd)` }"
        @click="$emit('select', wallet)"
      >
        <div class="absolute top-0 right-0 w-24 h-24 rounded-full bg-white/5 -mr-6 -mt-6"></div>
        <div class="relative">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-lg">{{ wallet.icon || walletIcons[wallet.type] || '💳' }}</span>
            <span class="text-xs font-medium text-white/70">{{ walletTypeLabels[wallet.type] || wallet.type }}</span>
          </div>
          <p class="text-xs text-white/60 mb-0.5">{{ wallet.name }}</p>
          <p class="text-lg font-bold text-white font-display">{{ formatCurrency(wallet.balance) }}</p>
        </div>
      </div>

      <!-- Add Wallet Button -->
      <div
        @click="$emit('add')"
        class="flex-shrink-0 w-[200px] rounded-2xl p-4 border-2 border-dashed border-surface-700 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 transition-colors active:scale-95"
      >
        <span class="text-2xl text-surface-500">+</span>
        <span class="text-xs text-surface-500">Tambah Wallet</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { formatCurrency } from '@/utils/currency'
import { walletIcons, walletTypeLabels } from '@/utils/formatters'

defineProps({
  wallets: { type: Array, default: () => [] }
})

defineEmits(['select', 'add'])
</script>
