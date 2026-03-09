<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-6 py-10">
    <div class="text-center mb-8 animate-fade-in">
      <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg glow-primary">
        💰
      </div>
      <h1 class="text-2xl font-bold font-display text-white">Buat Akun</h1>
      <p class="text-surface-400 text-sm mt-1">Mulai kelola keuanganmu sekarang</p>
    </div>

    <div class="glass-card w-full max-w-sm p-6 animate-scale-in">
      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="input-label">Nama Lengkap</label>
          <input v-model="fullName" type="text" class="input-field" placeholder="John Doe" required />
        </div>
        <div>
          <label class="input-label">Email</label>
          <input v-model="email" type="email" class="input-field" placeholder="email@contoh.com" required />
        </div>
        <div>
          <label class="input-label">Password</label>
          <input v-model="password" type="password" class="input-field" placeholder="Min. 6 karakter" required minlength="6" />
        </div>
        <div>
          <label class="input-label">Konfirmasi Password</label>
          <input v-model="confirmPassword" type="password" class="input-field" placeholder="Ulangi password" required />
        </div>

        <p v-if="error" class="text-sm text-danger-400 bg-danger/10 px-3 py-2 rounded-lg">{{ error }}</p>

        <button type="submit" :disabled="loading" class="btn-primary w-full flex items-center justify-center gap-2">
          <span v-if="loading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          {{ loading ? 'Memproses...' : 'Daftar Sekarang' }}
        </button>
      </form>

      <p class="text-center text-sm text-surface-400 mt-6">
        Sudah punya akun?
        <router-link to="/login" class="text-primary font-semibold hover:underline">Masuk</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const fullName = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')

async function handleRegister() {
  error.value = ''
  if (password.value !== confirmPassword.value) {
    error.value = 'Password tidak cocok'
    return
  }
  if (password.value.length < 6) {
    error.value = 'Password minimal 6 karakter'
    return
  }
  loading.value = true
  try {
    await authStore.register(email.value, password.value, fullName.value)
    router.push('/')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>
