<template>
  <div class="px-4 py-4 space-y-5 animate-fade-in">
    <h1 class="text-xl font-bold font-display">Profil</h1>

    <!-- Avatar & Name -->
    <div class="glass-card p-6 text-center">
      <div class="relative w-20 h-20 mx-auto mb-3">
        <div class="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center text-2xl font-bold overflow-hidden">
          <img v-if="authStore.avatarUrl" :src="authStore.avatarUrl" alt="avatar" class="w-full h-full object-cover" />
          <span v-else>{{ getInitials(authStore.displayName) }}</span>
        </div>
        <label class="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center text-xs cursor-pointer hover:bg-primary-600 transition-colors">
          📷
          <input type="file" accept="image/*" class="hidden" @change="handleAvatarUpload" />
        </label>
      </div>
      <h2 class="text-lg font-bold text-white">{{ authStore.displayName }}</h2>
      <p class="text-sm text-surface-400">{{ authStore.user?.email }}</p>
    </div>

    <!-- Edit Profile -->
    <div class="glass-card p-4 space-y-4">
      <h3 class="text-sm font-semibold text-surface-300">Pengaturan Profil</h3>
      <div>
        <label class="input-label">Nama Lengkap</label>
        <input v-model="profileForm.full_name" type="text" class="input-field" />
      </div>
      <div>
        <label class="input-label">Mata Uang</label>
        <select v-model="profileForm.currency" class="input-field">
          <option value="IDR">🇮🇩 IDR - Rupiah</option>
          <option value="USD">🇺🇸 USD - Dollar</option>
          <option value="SGD">🇸🇬 SGD - Singapore Dollar</option>
          <option value="MYR">🇲🇾 MYR - Ringgit</option>
          <option value="EUR">🇪🇺 EUR - Euro</option>
        </select>
      </div>
      <button @click="saveProfile" class="btn-primary w-full text-sm">Simpan Perubahan</button>
    </div>

    <!-- Theme -->
    <div class="glass-card p-4">
      <h3 class="text-sm font-semibold text-surface-300 mb-3">Tampilan</h3>
      <div class="flex items-center justify-between">
        <span class="text-sm text-white">Mode Gelap</span>
        <button
          @click="toggleTheme"
          class="w-12 h-7 rounded-full transition-colors duration-300 relative"
          :class="isDark ? 'bg-primary' : 'bg-surface-600'"
        >
          <div
            class="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300"
            :class="isDark ? 'left-[22px]' : 'left-0.5'"
          ></div>
        </button>
      </div>
    </div>

    <!-- Notification Settings -->
    <div class="glass-card p-4 space-y-3">
      <h3 class="text-sm font-semibold text-surface-300">Notifikasi</h3>
      <div class="flex items-center justify-between" v-for="setting in notifSettings" :key="setting.key">
        <span class="text-sm text-white">{{ setting.label }}</span>
        <button
          @click="setting.value = !setting.value"
          class="w-12 h-7 rounded-full transition-colors duration-300 relative"
          :class="setting.value ? 'bg-primary' : 'bg-surface-600'"
        >
          <div
            class="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300"
            :class="setting.value ? 'left-[22px]' : 'left-0.5'"
          ></div>
        </button>
      </div>
    </div>

    <!-- Export -->
    <div class="glass-card p-4">
      <h3 class="text-sm font-semibold text-surface-300 mb-3">Data</h3>
      <button @click="exportAll" class="btn-secondary w-full text-sm">📤 Export Semua Data ke Excel</button>
    </div>

    <!-- Logout & Delete -->
    <div class="space-y-3">
      <button @click="handleLogout" class="btn-secondary w-full">🚪 Keluar</button>
      <button @click="handleDeleteAccount" class="w-full py-3 rounded-xl text-sm text-danger-400 font-medium hover:bg-danger/10 transition-all">
        Hapus Akun
      </button>
    </div>

    <div class="h-4"></div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTransactionsStore } from '@/stores/transactions'
import { useExport } from '@/composables/useExport'
import { useToast } from '@/composables/useToast'
import { getInitials } from '@/utils/formatters'

const router = useRouter()
const authStore = useAuthStore()
const transactionsStore = useTransactionsStore()
const { exportToExcel } = useExport()
const toast = useToast()

const isDark = ref(document.documentElement.classList.contains('dark'))
const profileForm = reactive({
  full_name: authStore.profile?.full_name || '',
  currency: authStore.profile?.currency || 'IDR',
})

const notifSettings = reactive([
  { key: 'budget_alert', label: 'Peringatan Budget', value: true },
  { key: 'daily_reminder', label: 'Pengingat Harian', value: false },
  { key: 'goal_alert', label: 'Notifikasi Target', value: true },
])

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark')
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

async function saveProfile() {
  try {
    await authStore.updateProfile(profileForm)
    toast.success('Profil diperbarui! ✅')
  } catch (err) {
    toast.error(err.message)
  }
}

async function handleAvatarUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  try {
    await authStore.uploadAvatar(file)
    toast.success('Foto profil diperbarui!')
  } catch (err) {
    toast.error('Gagal upload foto')
  }
}

async function exportAll() {
  await transactionsStore.fetchTransactions()
  exportToExcel(transactionsStore.transactions, {
    income: transactionsStore.totalIncome,
    expense: transactionsStore.totalExpense,
  })
  toast.success('Data diekspor ke Excel! 📊')
}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}

async function handleDeleteAccount() {
  if (!confirm('⚠️ Yakin ingin menghapus akun? Semua data akan hilang dan tidak bisa dikembalikan.')) return
  // In production, this would call a Supabase Edge Function to delete the user
  toast.info('Fitur hapus akun memerlukan verifikasi admin.')
}

onMounted(() => {
  if (authStore.profile) {
    profileForm.full_name = authStore.profile.full_name || ''
    profileForm.currency = authStore.profile.currency || 'IDR'
  }
})
</script>
