<template>
  <div class="flex flex-col items-center justify-center py-12 px-6 text-center">
    <span class="text-5xl mb-4">{{ icon }}</span>
    <h3 class="text-lg font-semibold text-white mb-1 font-display">{{ title }}</h3>
    <p class="text-sm text-surface-400 mb-6 max-w-[260px]">{{ description }}</p>
    <button v-if="actionLabel" @click="$emit('action')" class="btn-primary text-sm px-5 py-2.5">
      {{ actionLabel }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, default: '📭' },
  title: { type: String, default: 'Belum Ada Data' },
  description: { type: String, default: 'Data akan muncul di sini setelah Anda menambahkannya.' },
  actionLabel: String,
})

defineEmits(['action'])
</script>
