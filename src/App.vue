<template>
  <div class="app-container">
    <!-- Toast Notifications -->
    <TransitionGroup name="slide-down">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="['toast-' + toast.type]"
      >
        {{ toast.message }}
      </div>
    </TransitionGroup>

    <!-- Offline Banner -->
    <Transition name="slide-down">
      <div v-if="isOffline" class="fixed top-0 left-1/2 -translate-x-1/2 max-w-[430px] w-full z-[99] bg-amber-500/90 text-white text-center py-2 text-sm font-medium backdrop-blur-md">
        ⚡ Koneksi terputus
      </div>
    </Transition>

    <!-- Auth Layout -->
    <template v-if="$route.meta.layout === 'auth'">
      <router-view v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </router-view>
    </template>

    <!-- App Layout -->
    <template v-else>
      <AppShell>
        <router-view v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </router-view>
      </AppShell>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import AppShell from '@/components/layout/AppShell.vue'

const authStore = useAuthStore()
const { toasts } = useToast()
const isOffline = ref(!navigator.onLine)

const handleOnline = () => { isOffline.value = false }
const handleOffline = () => { isOffline.value = true }

onMounted(async () => {
  await authStore.init()
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
})

onUnmounted(() => {
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
})
</script>
