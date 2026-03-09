<template>
  <div class="flex flex-col min-h-screen">
    <TopBar />
    <main class="flex-1 pb-safe overflow-y-auto">
      <slot />
    </main>
    <BottomNav />
  </div>
</template>

<script setup>
import TopBar from './TopBar.vue'
import BottomNav from './BottomNav.vue'
</script>
