<template>
  <div class="px-4 py-4 space-y-4 animate-fade-in">
    <h1 class="text-xl font-bold font-display">Transaksi</h1>

    <!-- Filters -->
    <TransactionFilter @filter="handleFilter" />

    <!-- Transaction List -->
    <TransactionList
      :transactions="transactionsStore.transactions"
      :loading="transactionsStore.loading"
      @select="openEdit"
      @add="showForm = true"
    />

    <!-- FAB -->
    <button
      @click="showForm = true"
      class="fixed bottom-24 right-4 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center text-2xl text-white shadow-lg glow-primary active:scale-90 transition-transform z-30"
      style="right: max(16px, calc((100vw - 430px) / 2 + 16px));"
    >
      +
    </button>

    <!-- Add/Edit Form -->
    <BottomSheet v-model="showForm" :title="editData ? 'Edit Transaksi' : 'Tambah Transaksi'">
      <TransactionForm
        ref="formRef"
        :categories="categories"
        :wallets="walletsStore.wallets"
        :initialData="editData"
        :editMode="!!editData"
        :submitting="submitting"
        @submit="handleSubmit"
        @scan="showScanner = true"
      />

      <!-- Delete Button for Edit -->
      <button
        v-if="editData"
        @click="handleDelete"
        class="btn-danger w-full mt-4"
      >
        🗑️ Hapus Transaksi
      </button>
    </BottomSheet>

    <!-- Scanner -->
    <BottomSheet v-model="showScanner" title="Scan Struk Belanja">
      <ReceiptScanner @apply="handleScanResult" />
    </BottomSheet>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTransactionsStore } from '@/stores/transactions'
import { useWalletsStore } from '@/stores/wallets'
import { useAuthStore } from '@/stores/auth'
import { useCategories } from '@/composables/useCategories'
import { useToast } from '@/composables/useToast'
import TransactionFilter from '@/components/transaction/TransactionFilter.vue'
import TransactionList from '@/components/transaction/TransactionList.vue'
import TransactionForm from '@/components/transaction/TransactionForm.vue'
import ReceiptScanner from '@/components/transaction/ReceiptScanner.vue'
import BottomSheet from '@/components/common/BottomSheet.vue'

const transactionsStore = useTransactionsStore()
const walletsStore = useWalletsStore()
const authStore = useAuthStore()
const { categories, fetchCategories } = useCategories()
const toast = useToast()

const showForm = ref(false)
const showScanner = ref(false)
const editData = ref(null)
const submitting = ref(false)
const formRef = ref(null)

function openEdit(tx) {
  editData.value = tx
  showForm.value = true
}

async function handleFilter(filters) {
  await transactionsStore.fetchTransactions(filters)
}

async function handleSubmit(data) {
  submitting.value = true
  try {
    const payload = {
      user_id: authStore.user.id,
      ...data,
      category_id: data.category_id || null,
      wallet_id: data.wallet_id || null,
    }
    if (editData.value) {
      await transactionsStore.updateTransaction(editData.value.id, payload)
      toast.success('Transaksi diperbarui! ✅')
    } else {
      await transactionsStore.addTransaction(payload)
      toast.success('Transaksi berhasil disimpan! ✅')
    }
    await walletsStore.fetchWallets()
    showForm.value = false
    editData.value = null
  } catch (err) {
    toast.error('Gagal: ' + err.message)
  } finally {
    submitting.value = false
  }
}

async function handleDelete() {
  if (!editData.value || !confirm('Yakin hapus transaksi ini?')) return
  try {
    await transactionsStore.deleteTransaction(editData.value.id)
    await walletsStore.fetchWallets()
    showForm.value = false
    editData.value = null
    toast.success('Transaksi dihapus')
  } catch (err) {
    toast.error('Gagal menghapus')
  }
}

function handleScanResult(result) {
  showScanner.value = false
  showForm.value = true
  if (formRef.value) {
    formRef.value.form.type = 'expense'
    formRef.value.form.amount = result.total_amount || 0
    formRef.value.form.date = result.date || new Date().toISOString().slice(0, 10)
    formRef.value.form.note = result.merchant_name || ''
  }
}

onMounted(async () => {
  await Promise.all([
    transactionsStore.fetchTransactions(),
    walletsStore.fetchWallets(),
    fetchCategories(),
  ])
})
</script>
