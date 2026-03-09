<template>
  <div class="space-y-4">
    <!-- Type Toggle -->
    <div class="flex bg-surface-800 rounded-xl p-1 gap-1">
      <button
        v-for="t in types"
        :key="t.value"
        @click="form.type = t.value"
        class="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
        :class="form.type === t.value ? t.activeClass : 'text-surface-400'"
      >
        {{ t.label }}
      </button>
    </div>

    <!-- Amount -->
    <CurrencyInput v-model="form.amount" label="Nominal" placeholder="0" />

    <!-- Category -->
    <div>
      <label class="input-label">Kategori</label>
      <div class="grid grid-cols-4 gap-2 max-h-[140px] overflow-y-auto">
        <button
          v-for="cat in filteredCategories"
          :key="cat.id"
          @click="form.category_id = cat.id"
          class="flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 active:scale-90"
          :class="form.category_id === cat.id ? 'bg-primary/20 ring-1 ring-primary' : 'bg-surface-800'"
        >
          <span class="text-lg">{{ cat.icon || '📦' }}</span>
          <span class="text-[10px] text-surface-300 truncate w-full text-center">{{ cat.name }}</span>
        </button>
      </div>
    </div>

    <!-- Wallet -->
    <div>
      <label class="input-label">Wallet</label>
      <select v-model="form.wallet_id" class="input-field">
        <option value="">Pilih wallet</option>
        <option v-for="w in wallets" :key="w.id" :value="w.id">
          {{ w.icon || '💳' }} {{ w.name }}
        </option>
      </select>
    </div>

    <!-- Transfer Target Wallet -->
    <div v-if="form.type === 'transfer'">
      <label class="input-label">Wallet Tujuan</label>
      <select v-model="form.target_wallet_id" class="input-field">
        <option value="">Pilih wallet tujuan</option>
        <option v-for="w in wallets.filter(w => w.id !== form.wallet_id)" :key="w.id" :value="w.id">
          {{ w.icon || '💳' }} {{ w.name }}
        </option>
      </select>
    </div>

    <!-- Date -->
    <div>
      <label class="input-label">Tanggal</label>
      <input v-model="form.date" type="date" class="input-field" />
    </div>

    <!-- Note -->
    <div>
      <label class="input-label">Catatan</label>
      <input v-model="form.note" type="text" class="input-field" placeholder="Tambahkan catatan..." />
    </div>

    <!-- Receipt Scanner Button -->
    <button
      v-if="form.type === 'expense'"
      @click="$emit('scan')"
      class="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 flex items-center justify-center gap-2 text-sm font-medium text-purple-300 hover:border-purple-400/50 transition-all active:scale-95"
    >
      📷 Scan Struk Belanja <span class="badge-ai">AI</span>
    </button>

    <!-- Submit -->
    <button
      @click="handleSubmit"
      :disabled="!isValid || submitting"
      class="btn-primary w-full flex items-center justify-center gap-2"
      :class="{ 'opacity-50 cursor-not-allowed': !isValid || submitting }"
    >
      <span v-if="submitting" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
      {{ submitting ? 'Menyimpan...' : (editMode ? 'Perbarui Transaksi' : 'Simpan Transaksi') }}
    </button>
  </div>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'
import CurrencyInput from '@/components/common/CurrencyInput.vue'
import { toDateInputValue } from '@/utils/date'

const props = defineProps({
  categories: { type: Array, default: () => [] },
  wallets: { type: Array, default: () => [] },
  initialData: { type: Object, default: null },
  editMode: Boolean,
  submitting: Boolean,
})

const emit = defineEmits(['submit', 'scan'])

const form = reactive({
  type: props.initialData?.type || 'expense',
  amount: props.initialData?.amount || 0,
  category_id: props.initialData?.category_id || '',
  wallet_id: props.initialData?.wallet_id || '',
  target_wallet_id: '',
  date: props.initialData?.date || toDateInputValue(),
  note: props.initialData?.note || '',
})

const types = [
  { value: 'income', label: '💰 Masuk', activeClass: 'bg-primary text-white' },
  { value: 'expense', label: '💸 Keluar', activeClass: 'bg-danger text-white' },
  { value: 'transfer', label: '🔄 Transfer', activeClass: 'bg-blue-500 text-white' },
]

const filteredCategories = computed(() => {
  if (form.type === 'transfer') return []
  return props.categories.filter(c => c.type === form.type)
})

const isValid = computed(() => {
  if (!form.amount || form.amount <= 0) return false
  if (form.type !== 'transfer' && !form.category_id) return false
  if (!form.wallet_id) return false
  if (form.type === 'transfer' && !form.target_wallet_id) return false
  return true
})

watch(() => props.initialData, (val) => {
  if (val) {
    Object.assign(form, {
      type: val.type || 'expense',
      amount: val.amount || 0,
      category_id: val.category_id || '',
      wallet_id: val.wallet_id || '',
      date: val.date || toDateInputValue(),
      note: val.note || '',
    })
  }
}, { immediate: true })

function handleSubmit() {
  emit('submit', { ...form })
}

// Expose form for receipt scanner auto-fill
defineExpose({ form })
</script>
