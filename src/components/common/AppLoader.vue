<template>
  <div class="flex flex-col items-center gap-1 py-8">
    <div class="relative w-12 h-12">
      <div class="absolute inset-0 rounded-full border-3 border-surface-700"></div>
      <div class="absolute inset-0 rounded-full border-3 border-primary border-t-transparent animate-spin"></div>
    </div>
    <p class="text-sm text-surface-400 mt-2">{{ text }}</p>
  </div>
</template>

<script setup>
defineProps({
  text: { type: String, default: 'Memuat...' }
})
</script>
