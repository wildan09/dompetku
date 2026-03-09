<template>
  <div class="px-4 py-4 space-y-5 animate-fade-in">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-bold font-display">Target Tabungan</h1>
      <button @click="showForm = true" class="btn-primary text-sm px-4 py-2">+ Tambah</button>
    </div>

    <AppLoader v-if="savingsStore.loading" />
    <EmptyState v-else-if="!savingsStore.goals.length" icon="🎯" title="Belum Ada Target" description="Buat target tabungan untuk mencapai impianmu." actionLabel="+ Buat Target" @action="showForm = true" />
    <div v-else class="space-y-3">
      <GoalCard
        v-for="goal in savingsStore.goals"
        :key="goal.id"
        :goal="goal"
        @click="openGoal(goal)"
      />
    </div>

    <!-- Add Goal Form -->
    <BottomSheet v-model="showForm" title="Tambah Target Tabungan">
      <div class="space-y-4">
        <div>
          <label class="input-label">Nama Target</label>
          <input v-model="form.name" type="text" class="input-field" placeholder="Contoh: Liburan Bali" />
        </div>
        <CurrencyInput v-model="form.target_amount" label="Target Nominal" />
        <div>
          <label class="input-label">Deadline (opsional)</label>
          <input v-model="form.deadline" type="date" class="input-field" />
        </div>
        <div>
          <label class="input-label">Icon</label>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="icon in goalIcons"
              :key="icon"
              @click="form.icon = icon"
              class="w-10 h-10 rounded-xl bg-surface-800 flex items-center justify-center text-lg active:scale-90 transition-all"
              :class="{ 'ring-2 ring-primary': form.icon === icon }"
            >
              {{ icon }}
            </button>
          </div>
        </div>
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
        <button @click="handleAdd" :disabled="!form.name || !form.target_amount" class="btn-primary w-full" :class="{ 'opacity-50': !form.name || !form.target_amount }">
          Simpan Target
        </button>
      </div>
    </BottomSheet>

    <!-- Goal Detail / Add Funds -->
    <BottomSheet v-model="showDetail" :title="selectedGoal?.name || 'Detail'">
      <div v-if="selectedGoal" class="space-y-4">
        <GoalCard :goal="selectedGoal" />
        <CurrencyInput v-model="addAmount" label="Tambah Dana" />
        <button
          @click="handleAddFunds"
          :disabled="!addAmount || addAmount <= 0"
          class="btn-primary w-full"
          :class="{ 'opacity-50': !addAmount || addAmount <= 0 }"
        >
          💰 Tambah Dana
        </button>
        <button @click="handleDelete" class="btn-danger w-full">🗑️ Hapus Target</button>
      </div>
    </BottomSheet>

    <!-- Confetti Effect -->
    <Transition name="fade">
      <div v-if="showConfetti" class="fixed inset-0 z-[99] pointer-events-none flex items-center justify-center">
        <div class="text-6xl animate-bounce-in">🎉</div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useSavingsStore } from '@/stores/savings'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { colorPresets } from '@/utils/formatters'
import GoalCard from '@/components/savings/GoalCard.vue'
import BottomSheet from '@/components/common/BottomSheet.vue'
import CurrencyInput from '@/components/common/CurrencyInput.vue'
import AppLoader from '@/components/common/AppLoader.vue'
import EmptyState from '@/components/common/EmptyState.vue'

const savingsStore = useSavingsStore()
const authStore = useAuthStore()
const toast = useToast()

const showForm = ref(false)
const showDetail = ref(false)
const showConfetti = ref(false)
const selectedGoal = ref(null)
const addAmount = ref(0)

const form = reactive({
  name: '', target_amount: 0, deadline: '', icon: '🎯', color: '#10B981'
})

const goalIcons = ['🎯', '🏠', '🚗', '✈️', '💍', '📱', '🎓', '🏖️', '🎮', '💼', '❤️', '🎉']
const colors = colorPresets.slice(0, 12)

function openGoal(goal) {
  selectedGoal.value = goal
  addAmount.value = 0
  showDetail.value = true
}

async function handleAdd() {
  try {
    await savingsStore.addGoal({
      user_id: authStore.user.id,
      name: form.name,
      target_amount: form.target_amount,
      deadline: form.deadline || null,
      icon: form.icon,
      color: form.color,
    })
    showForm.value = false
    Object.assign(form, { name: '', target_amount: 0, deadline: '', icon: '🎯', color: '#10B981' })
    toast.success('Target berhasil dibuat! 🎯')
  } catch (err) {
    toast.error(err.message)
  }
}

async function handleAddFunds() {
  if (!selectedGoal.value) return
  try {
    const result = await savingsStore.addFunds(selectedGoal.value.id, addAmount.value)
    selectedGoal.value = result
    addAmount.value = 0
    toast.success('Dana berhasil ditambahkan! 💰')

    if (result.is_completed) {
      showConfetti.value = true
      setTimeout(() => { showConfetti.value = false }, 3000)
      toast.success('🎉 Selamat! Target tercapai!')
    }
  } catch (err) {
    toast.error(err.message)
  }
}

async function handleDelete() {
  if (!selectedGoal.value || !confirm('Yakin hapus target ini?')) return
  await savingsStore.deleteGoal(selectedGoal.value.id)
  showDetail.value = false
  selectedGoal.value = null
  toast.success('Target dihapus')
}

onMounted(() => savingsStore.fetchGoals())
</script>
