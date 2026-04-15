<template>
  <div v-if="isOpen" class="fixed inset-0 z-[60] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-gray-900/20 dark:bg-black/40 backdrop-blur-sm" @click="close"></div>
    
    <div class="relative glass-panel w-full max-w-sm p-6 animate-[popIn_0.2s_ease-out] shadow-xl border border-gray-200/60 dark:border-white/10 bg-white/95 dark:bg-zinc-900/90 rounded-2xl">
      <div class="flex items-center gap-3 mb-4 text-red-500">
        <svg xmlns="http://www.w0.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Confirm Action</h3>
      </div>
      
      <p class="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed">
        {{ message }}
      </p>

      <div class="flex justify-end gap-3">
        <button 
          @click="close"
          class="px-4 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5 transition-colors focus:outline-none"
        >
          Cancel
        </button>
        <button 
          @click="confirm"
          class="px-4 py-2 text-sm font-medium rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['confirm'])
const isOpen = ref(false)
const message = ref('')

let resolvePromise = null

const open = (msg) => {
  message.value = msg
  isOpen.value = true
  return new Promise((resolve) => {
    resolvePromise = resolve
  })
}

const close = () => {
  isOpen.value = false
  if (resolvePromise) resolvePromise(false)
}

const confirm = () => {
  isOpen.value = false
  if (resolvePromise) resolvePromise(true)
}

defineExpose({ open })
</script>

<style scoped>
@keyframes popIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
