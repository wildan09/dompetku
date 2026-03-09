<template>
  <div
    class="glass-card-hover p-4 cursor-pointer"
    @click="$emit('click', goal)"
  >
    <div class="flex items-center gap-3 mb-3">
      <div class="w-11 h-11 rounded-xl flex items-center justify-center text-xl" :style="{ backgroundColor: (goal.color || '#10B981') + '20' }">
        {{ goal.icon || '🎯' }}
      </div>
      <div class="flex-1">
        <p class="text-sm font-semibold text-white">{{ goal.name }}</p>
        <p class="text-xs text-surface-400">
          {{ goal.is_completed ? '✅ Tercapai!' : remaining !== null ? `${remaining} hari lagi` : 'Tanpa batas waktu' }}
        </p>
      </div>
      <span class="text-sm font-bold" :class="goal.is_completed ? 'text-primary' : 'text-surface-300'">
        {{ percent }}%
      </span>
    </div>

    <!-- Progress -->
    <div class="progress-bar mb-2">
      <div
        class="progress-fill bg-gradient-to-r from-primary-600 to-primary"
        :style="{ width: percent + '%' }"
      ></div>
    </div>

    <div class="flex justify-between text-xs text-surface-400">
      <span>{{ formatCurrency(goal.current_amount) }}</span>
      <span>{{ formatCurrency(goal.target_amount) }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatCurrency } from '@/utils/currency'
import { daysRemaining } from '@/utils/date'
import { calcPercentage } from '@/utils/formatters'

const props = defineProps({
  goal: { type: Object, required: true }
})

defineEmits(['click'])

const percent = computed(() => calcPercentage(Number(props.goal.current_amount), Number(props.goal.target_amount)))
const remaining = computed(() => daysRemaining(props.goal.deadline))
</script>
