<template>
  <nav class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 bg-surface-900/95 backdrop-blur-xl border-t border-surface-800/50">
    <div class="flex items-center justify-around py-1" style="padding-bottom: max(8px, env(safe-area-inset-bottom));">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="nav-item group"
        :class="{ 'active': isActive(item.path) }"
      >
        <span class="nav-icon" :class="{ 'active-icon': isActive(item.path) }">{{ item.icon }}</span>
        <span class="nav-label" :class="{ 'text-primary': isActive(item.path) }">{{ item.label }}</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'

const route = useRoute()

const navItems = [
  { path: '/', icon: '🏠', label: 'Beranda' },
  { path: '/transactions', icon: '💳', label: 'Transaksi' },
  { path: '/budget', icon: '📊', label: 'Budget' },
  { path: '/savings', icon: '🎯', label: 'Tabungan' },
  { path: '/profile', icon: '👤', label: 'Profil' },
]

function isActive(path) {
  return route.path === path
}
</script>

<style scoped>
.nav-item {
  @apply flex flex-col items-center gap-0.5 py-2 px-3 min-w-[60px] rounded-xl
  transition-all duration-200;
}
.nav-item:active {
  transform: scale(0.9);
}
.nav-icon {
  @apply text-xl transition-transform duration-200;
}
.active-icon {
  transform: translateY(-2px) scale(1.1);
}
.nav-label {
  @apply text-[10px] font-medium text-surface-400 transition-colors duration-200;
}
.active .nav-label {
  @apply text-primary font-semibold;
}
</style>
