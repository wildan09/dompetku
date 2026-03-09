<template>
  <div class="px-4 py-4 space-y-5 animate-fade-in">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-bold font-display">Wallet</h1>
      <button @click="showForm = true" class="btn-primary text-sm px-4 py-2">+ Tambah</button>
    </div>

    <!-- Total Balance -->
    <div class="glass-card p-5 text-center relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
      <p class="text-xs text-surface-400 mb-1 relative">Total Saldo Semua Wallet</p>
      <p class="text-2xl font-bold font-display text-white relative">{{ formatCurrency(walletsStore.totalBalance) }}</p>
    </div>

    <AppLoader v-if="walletsStore.loading" />
    <EmptyState v-else-if="!walletsStore.wallets.length" icon="💳" title="Belum Ada Wallet" description="Tambah wallet untuk mulai mencatat keuangan." actionLabel="+ Tambah Wallet" @action="showForm = true" />
    <div v-else class="space-y-3">
      <div
        v-for="wallet in walletsStore.wallets"
        :key="wallet.id"
        @click="openWallet(wallet)"
        class="glass-card-hover p-4 flex items-center gap-3 cursor-pointer"
      >
        <div
          class="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
          :style="{ backgroundColor: (wallet.color || '#334155') + '20' }"
        >
          {{ wallet.icon || walletIcons[wallet.type] || '💳' }}
        </div>
        <div class="flex-1">
          <p class="text-sm font-semibold text-white">{{ wallet.name }}</p>
          <p class="text-xs text-surface-400">{{ walletTypeLabels[wallet.type] || wallet.type }}</p>
        </div>
        <div class="text-right">
          <p class="text-sm font-bold text-white">{{ formatCurrency(wallet.balance) }}</p>
          <span v-if="!wallet.is_active" class="text-[10px] text-surface-500">Nonaktif</span>
        </div>
      </div>
    </div>

    <!-- Add/Edit Form -->
    <BottomSheet v-model="showForm" :title="editWallet ? 'Edit Wallet' : 'Tambah Wallet'">
      <div class="space-y-4">
        <div>
          <label class="input-label">Nama Wallet</label>
          <input v-model="form.name" type="text" class="input-field" placeholder="Contoh: BCA, GoPay" />
        </div>
        <div>
          <label class="input-label">Tipe</label>
          <select v-model="form.type" class="input-field">
            <option value="cash">💵 Tunai</option>
            <option value="bank">🏦 Bank</option>
            <option value="ewallet">📱 E-Wallet</option>
            <option value="investment">📊 Investasi</option>
            <option value="other">💳 Lainnya</option>
          </select>
        </div>
        <CurrencyInput v-model="form.balance" label="Saldo Awal" />
        <div>
          <label class="input-label">Warna</label>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="color in colors"
              :key="color"
              @click="form.color = color"
              class="w-8 h-8 rounded-full active:scale-90 transition-all"
              :style="{ backgroundColor: color }"
              :class="{ 'ring-2 ring-white ring-offset-2 ring-offset-background': form.color === color }"
            ></button>
          </div>
        </div>
        <button @click="handleSave" :disabled="!form.name" class="btn-primary w-full" :class="{ 'opacity-50': !form.name }">
          {{ editWallet ? 'Perbarui' : 'Simpan' }}
        </button>
        <button v-if="editWallet" @click="handleDelete" class="btn-danger w-full">🗑️ Hapus Wallet</button>
      </div>
    </BottomSheet>

    <!-- Transfer Sheet -->
    <BottomSheet v-model="showTransfer" title="Transfer Antar Wallet">
      <div class="space-y-4">
        <div>
          <label class="input-label">Dari Wallet</label>
          <select v-model="transfer.from" class="input-field">
            <option v-for="w in walletsStore.wallets" :key="w.id" :value="w.id">{{ w.icon || '💳' }} {{ w.name }}</option>
          </select>
        </div>
        <div>
          <label class="input-label">Ke Wallet</label>
          <select v-model="transfer.to" class="input-field">
            <option v-for="w in walletsStore.wallets.filter(w => w.id !== transfer.from)" :key="w.id" :value="w.id">{{ w.icon || '💳' }} {{ w.name }}</option>
          </select>
        </div>
        <CurrencyInput v-model="transfer.amount" label="Nominal" />
        <button @click="handleTransfer" :disabled="!transfer.from || !transfer.to || !transfer.amount" class="btn-primary w-full">
          🔄 Transfer Sekarang
        </button>
      </div>
    </BottomSheet>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useWalletsStore } from '@/stores/wallets'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { formatCurrency } from '@/utils/currency'
import { walletIcons, walletTypeLabels, colorPresets } from '@/utils/formatters'
import BottomSheet from '@/components/common/BottomSheet.vue'
import CurrencyInput from '@/components/common/CurrencyInput.vue'
import AppLoader from '@/components/common/AppLoader.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const walletsStore = useWalletsStore()
const authStore = useAuthStore()
const toast = useToast()

const showForm = ref(false)
const showTransfer = ref(false)
const editWallet = ref(null)
const colors = colorPresets.slice(0, 12)

const form = reactive({ name: '', type: 'cash', balance: 0, color: '#10B981', icon: '' })
const transfer = reactive({ from: '', to: '', amount: 0 })

function openWallet(wallet) {
  editWallet.value = wallet
  Object.assign(form, { name: wallet.name, type: wallet.type, balance: wallet.balance, color: wallet.color || '#10B981', icon: wallet.icon || '' })
  showForm.value = true
}

async function handleSave() {
  try {
    if (editWallet.value) {
      await walletsStore.updateWallet(editWallet.value.id, {
        name: form.name, type: form.type, color: form.color, icon: form.icon
      })
      toast.success('Wallet diperbarui! ✅')
    } else {
      await walletsStore.addWallet({
        user_id: authStore.user.id,
        name: form.name, type: form.type, balance: form.balance, color: form.color,
      })
      toast.success('Wallet berhasil ditambahkan! ✅')
    }
    showForm.value = false
    editWallet.value = null
  } catch (err) {
    toast.error(err.message)
  }
}

async function handleDelete() {
  if (!editWallet.value || !confirm('Yakin hapus wallet ini?')) return
  await walletsStore.deleteWallet(editWallet.value.id)
  showForm.value = false
  editWallet.value = null
  toast.success('Wallet dihapus')
}

async function handleTransfer() {
  try {
    await walletsStore.transferBetweenWallets(transfer.from, transfer.to, transfer.amount)
    showTransfer.value = false
    toast.success('Transfer berhasil! 🔄')
  } catch (err) {
    toast.error(err.message)
  }
}

onMounted(() => walletsStore.fetchWallets())
</script>
