<template>
  <header class="sticky top-0 z-30 px-4 py-3 bg-background/80 backdrop-blur-xl border-b border-surface-800/50">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <!-- Avatar -->
        <div
          class="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center text-sm font-bold overflow-hidden"
        >
          <img v-if="authStore.avatarUrl" :src="authStore.avatarUrl" alt="avatar" class="w-full h-full object-cover" />
          <span v-else>{{ initials }}</span>
        </div>
        <div>
          <p class="text-xs text-surface-400">{{ greeting }}</p>
          <p class="text-sm font-semibold text-white">{{ authStore.displayName }}</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <!-- Theme Toggle -->
        <button
          @click="toggleTheme"
          class="w-9 h-9 rounded-xl bg-surface-800 flex items-center justify-center text-surface-300 hover:text-white transition-all duration-200 active:scale-90"
        >
          <span v-if="isDark">🌙</span>
          <span v-else>☀️</span>
        </button>
        <!-- Notification -->
        <button
          @click="$router.push('/profile')"
          class="w-9 h-9 rounded-xl bg-surface-800 flex items-center justify-center text-surface-300 hover:text-white transition-all duration-200 active:scale-90"
        >
          🔔
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getGreeting, getInitials } from '@/utils/formatters'

const authStore = useAuthStore()
const greeting = computed(() => getGreeting())
const initials = computed(() => getInitials(authStore.displayName))

const isDark = ref(document.documentElement.classList.contains('dark'))

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark')
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}
</script>
