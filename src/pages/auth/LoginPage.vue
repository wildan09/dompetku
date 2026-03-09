<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-6 py-10">
    <!-- Logo & Title -->
    <div class="text-center mb-10 animate-fade-in">
      <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg glow-primary">
        💰
      </div>
      <h1 class="text-2xl font-bold font-display text-white">DompetKu</h1>
      <p class="text-surface-400 text-sm mt-1">Kelola keuangan dengan cerdas</p>
    </div>

    <!-- Form Card -->
    <div class="glass-card w-full max-w-sm p-6 animate-scale-in">
      <h2 class="text-xl font-bold text-white mb-1 font-display">Masuk</h2>
      <p class="text-sm text-surface-400 mb-6">Selamat datang kembali!</p>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="input-label">Username</label>
          <input
            v-model="username"
            type="text"
            class="input-field"
            placeholder="Masukkan username"
            required
          />
        </div>
        <div>
          <label class="input-label">Password</label>
          <input
            v-model="password"
            type="password"
            class="input-field"
            placeholder="••••••••"
            required
          />
        </div>

        <p v-if="error" class="text-sm text-danger-400 bg-danger/10 px-3 py-2 rounded-lg">
          {{ error }}
        </p>

        <button
          type="submit"
          :disabled="loading"
          class="btn-primary w-full flex items-center justify-center gap-2"
        >
          <span v-if="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          {{ loading ? 'Memproses...' : 'Masuk' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  loading.value = true
  error.value = ''
  try {
    await authStore.login(username.value, password.value)
    router.push('/')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>
