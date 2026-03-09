<template>
  <div class="space-y-3">
    <!-- Search -->
    <div class="relative">
      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">🔍</span>
      <input
        v-model="filters.search"
        type="text"
        class="input-field pl-10"
        placeholder="Cari transaksi..."
        @input="$emit('filter', filters)"
      />
    </div>

    <!-- Filter chips -->
    <div class="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
      <button
        v-for="type in typeFilters"
        :key="type.value"
        @click="toggleType(type.value)"
        class="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95"
        :class="filters.type === type.value ? 'bg-primary text-white' : 'bg-surface-800 text-surface-400'"
      >
        {{ type.label }}
      </button>
    </div>

    <!-- Date Range -->
    <div class="flex gap-2">
      <input
        v-model="filters.startDate"
        type="date"
        class="input-field text-xs flex-1"
        @change="$emit('filter', filters)"
      />
      <input
        v-model="filters.endDate"
        type="date"
        class="input-field text-xs flex-1"
        @change="$emit('filter', filters)"
      />
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const emit = defineEmits(['filter'])

const filters = reactive({
  search: '',
  type: '',
  startDate: '',
  endDate: '',
})

const typeFilters = [
  { value: '', label: 'Semua' },
  { value: 'income', label: '💰 Masuk' },
  { value: 'expense', label: '💸 Keluar' },
  { value: 'transfer', label: '🔄 Transfer' },
]

function toggleType(value) {
  filters.type = filters.type === value ? '' : value
  emit('filter', filters)
}
</script>
