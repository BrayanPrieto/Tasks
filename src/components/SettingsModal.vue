<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-gray-500/20 dark:bg-black/60 backdrop-blur-md" @click="close"></div>
    
    <!-- Modal -->
    <div class="relative glass-panel w-full max-w-md p-8 shadow-2xl border border-gray-200/50 dark:border-white/10 bg-white dark:bg-black/80 rounded-[2rem] flex flex-col max-h-[80vh] animate-[popIn_0.3s_cubic-bezier(0.16,1,0.3,1)]">
      <div class="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-white/10 pb-3">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
        <button @click="close" class="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white focus:outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto">
        <h3 class="font-semibold text-gray-700 dark:text-gray-300 mb-3">Manage Categories</h3>
        
        <div class="space-y-2 mb-4">
          <div v-for="(cat, idx) in categories" :key="idx" class="flex items-center justify-between bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/5 rounded-xl p-3">
            <span class="text-sm font-medium text-gray-800 dark:text-gray-200">{{ cat }}</span>
            <button v-if="cat !== 'General'" @click="removeCategory(idx)" class="text-red-400 hover:text-red-600 transition-colors focus:outline-none" title="Delete Category">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        <form @submit.prevent="addCategory" class="flex gap-2">
          <input 
            v-model="newCategory" 
            class="flex-1 bg-gray-50 dark:bg-black/30 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" 
            placeholder="New category name"
            required
          />
          <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50">
            Add
          </button>
        </form>
      </div>

      <div class="mt-8 pt-6 border-t border-gray-200 dark:border-white/10 flex justify-end">
        <button @click="save" class="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-2.5 rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
          Save Settings
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['saved'])
const isOpen = ref(false)
const categories = ref([])
const newCategory = ref('')

const open = async () => {
  try {
    categories.value = await window.api.getCategories()
  } catch (err) {
    console.error('Failed to load categories', err)
    categories.value = ['General', 'Gestión Digital', 'Gestión Recursos', 'Personal']
  }
  newCategory.value = ''
  isOpen.value = true
}

const close = () => {
  isOpen.value = false
}

const addCategory = () => {
  const cat = newCategory.value.trim()
  if (cat && !categories.value.includes(cat)) {
    categories.value.push(cat)
  }
  newCategory.value = ''
}

const removeCategory = (idx) => {
  categories.value.splice(idx, 1)
}

const save = async () => {
  try {
    await window.api.saveCategories(JSON.parse(JSON.stringify(categories.value)))
    emit('saved')
    close()
  } catch (err) {
    console.error('Failed to save categories', err)
  }
}

defineExpose({ open, close })
</script>

<style scoped>
@keyframes popIn {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
</style>
