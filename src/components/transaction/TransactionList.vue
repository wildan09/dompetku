<template>
  <div>
    <SkeletonCard v-if="loading" :count="5" />
    <EmptyState v-else-if="!grouped.length" icon="📝" title="Belum Ada Transaksi" description="Mulai catat transaksimu." :actionLabel="'+ Tambah'" @action="$emit('add')" />
    <div v-else class="space-y-4">
      <div v-for="group in grouped" :key="group.label">
        <p class="text-xs font-semibold text-surface-500 uppercase mb-2 px-1">{{ group.label }}</p>
        <div class="space-y-2">
          <TransactionItem
            v-for="tx in group.items"
            :key="tx.id"
            :transaction="tx"
            @click="$emit('select', tx)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatDateGroup } from '@/utils/date'
import SkeletonCard from '@/components/common/SkeletonCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import TransactionItem from './TransactionItem.vue'

const props = defineProps({
  transactions: { type: Array, default: () => [] },
  loading: Boolean,
})

defineEmits(['select', 'add'])

const grouped = computed(() => {
  const groups = {}
  props.transactions.forEach(tx => {
    const label = formatDateGroup(tx.date)
    if (!groups[label]) groups[label] = { label, items: [] }
    groups[label].items.push(tx)
  })
  return Object.values(groups)
})
</script>
