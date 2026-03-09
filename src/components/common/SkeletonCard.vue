<template>
  <div class="space-y-3">
    <div v-for="i in count" :key="i" class="glass-card p-4 space-y-3">
      <div class="flex items-center gap-3">
        <div class="skeleton w-10 h-10 rounded-full"></div>
        <div class="flex-1 space-y-2">
          <div class="skeleton h-3 w-2/3 rounded"></div>
          <div class="skeleton h-2.5 w-1/3 rounded"></div>
        </div>
        <div class="skeleton h-4 w-20 rounded"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  count: { type: Number, default: 3 }
})
</script>
