<template>
  <div class="relative">
    <label v-if="label" class="input-label">{{ label }}</label>
    <div class="relative">
      <span class="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 text-sm font-medium">Rp</span>
      <input
        type="text"
        :value="displayValue"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        class="input-field pl-10 text-right text-lg font-semibold"
        :placeholder="placeholder"
        inputmode="numeric"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { formatNumber } from '@/utils/currency'

const props = defineProps({
  modelValue: { type: [Number, String], default: 0 },
  label: String,
  placeholder: { type: String, default: '0' },
})

const emit = defineEmits(['update:modelValue'])
const isFocused = ref(false)

const displayValue = computed(() => {
  if (isFocused.value) {
    return props.modelValue ? String(props.modelValue) : ''
  }
  return props.modelValue ? formatNumber(props.modelValue) : ''
})

function handleInput(e) {
  const raw = e.target.value.replace(/[^\d]/g, '')
  emit('update:modelValue', raw ? Number(raw) : 0)
}

function handleFocus() { isFocused.value = true }
function handleBlur() { isFocused.value = false }
</script>
