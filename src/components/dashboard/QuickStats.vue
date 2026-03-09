<template>
  <div>
    <h3 class="text-sm font-semibold text-surface-300 mb-3">Aksi Cepat</h3>
    <div class="grid grid-cols-4 gap-3">
      <button
        v-for="action in actions"
        :key="action.label"
        @click="$emit('action', action.type)"
        class="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-surface-800/50 hover:bg-surface-700/50 transition-all duration-200 active:scale-90"
      >
        <div
          class="w-11 h-11 rounded-xl flex items-center justify-center text-lg"
          :style="{ background: action.bg }"
        >
          {{ action.icon }}
        </div>
        <span class="text-[10px] font-medium text-surface-400">{{ action.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
defineEmits(['action'])

const actions = [
  { type: 'income', icon: '💰', label: 'Pemasukan', bg: 'rgba(16,185,129,0.15)' },
  { type: 'expense', icon: '💸', label: 'Pengeluaran', bg: 'rgba(244,63,94,0.15)' },
  { type: 'transfer', icon: '🔄', label: 'Transfer', bg: 'rgba(59,130,246,0.15)' },
  { type: 'report', icon: '📊', label: 'Laporan', bg: 'rgba(139,92,246,0.15)' },
]
</script>
