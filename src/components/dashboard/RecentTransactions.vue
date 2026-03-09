<template>
  <div>
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold text-surface-300">Transaksi Terakhir</h3>
      <router-link to="/transactions" class="text-xs text-primary font-medium">Lihat Semua →</router-link>
    </div>

    <SkeletonCard v-if="loading" :count="3" />

    <EmptyState
      v-else-if="!transactions.length"
      icon="📝"
      title="Belum Ada Transaksi"
      description="Mulai catat pemasukan dan pengeluaranmu."
    />

    <div v-else class="space-y-2">
      <TransactionItem
        v-for="tx in transactions"
        :key="tx.id"
        :transaction="tx"
        @click="$emit('select', tx)"
      />
    </div>
  </div>
</template>

<script setup>
import SkeletonCard from '@/components/common/SkeletonCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import TransactionItem from '@/components/transaction/TransactionItem.vue'

defineProps({
  transactions: { type: Array, default: () => [] },
  loading: Boolean,
})

defineEmits(['select'])
</script>
