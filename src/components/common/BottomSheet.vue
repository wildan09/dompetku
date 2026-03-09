<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="sheet-overlay" @click="close"></div>
    </Transition>
    <Transition name="slide-up">
      <div v-if="modelValue" class="sheet-content">
        <div class="sheet-handle" @click="close"></div>
        <div class="px-5 pb-6">
          <div v-if="title" class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-white font-display">{{ title }}</h3>
            <button @click="close" class="w-8 h-8 rounded-lg bg-surface-800 flex items-center justify-center text-surface-400 hover:text-white transition-all active:scale-90">
              ✕
            </button>
          </div>
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  modelValue: Boolean,
  title: String,
})

const emit = defineEmits(['update:modelValue'])

function close() {
  emit('update:modelValue', false)
}
</script>
