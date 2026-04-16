<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop blur layer -->
    <div class="absolute inset-0 bg-gray-500/20 dark:bg-black/60 backdrop-blur-md" @click="close"></div>
    
    <!-- Modal content -->
    <div class="relative glass-panel w-full max-w-lg p-8 animate-[popIn_0.3s_cubic-bezier(0.16,1,0.3,1)] shadow-2xl border border-gray-200/50 dark:border-white/10 bg-white dark:bg-black/80 rounded-[2rem]">
      <h2 class="text-2xl font-bold mb-6 text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/10 pb-3">
        {{ form.id ? 'Edit Task' : 'Create New Task' }}
      </h2>
      
      <form @submit.prevent="save">
        <div class="space-y-5">
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Title</label>
            <input 
              v-model="form.title" 
              required 
              class="w-full bg-gray-50 dark:bg-black/30 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              placeholder="What do you need to do?"
            />
          </div>
          <div class="grid grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Status</label>
              <select 
                v-model="form.status" 
                class="w-full bg-gray-50 dark:bg-black/30 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none cursor-pointer"
              >
                <option value="todo" class="bg-white dark:bg-gray-800 text-gray-800 dark:text-white">To Do</option>
                <option value="inprogress" class="bg-white dark:bg-gray-800 text-gray-800 dark:text-white">In Progress</option>
                <option value="done" class="bg-white dark:bg-gray-800 text-gray-800 dark:text-white">Done</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Urgency</label>
              <select 
                v-model="form.urgency" 
                class="w-full bg-gray-50 dark:bg-black/30 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all appearance-none cursor-pointer"
              >
                <option value="low" class="bg-white dark:bg-gray-800 text-gray-800 dark:text-white">Low</option>
                <option value="normal" class="bg-white dark:bg-gray-800 text-gray-800 dark:text-white">Normal</option>
                <option value="high" class="bg-white dark:bg-gray-800 text-gray-800 dark:text-white">High</option>
                <option value="critical" class="bg-white dark:bg-gray-800 text-gray-800 dark:text-white">Critical</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Category</label>
              <select 
                v-model="form.category" 
                class="w-full bg-gray-50 dark:bg-black/30 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all appearance-none cursor-pointer"
              >
                <option v-for="cat in dynamicCategories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Description</label>
            <textarea 
              v-model="form.description" 
              class="w-full bg-gray-50 dark:bg-black/30 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none h-28"
              placeholder="Add details, links, or notes..."
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Estimated End</label>
              <input 
                type="datetime-local" 
                v-model="form.estimated_end" 
                class="w-full bg-gray-50 dark:bg-black/30 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all dark:[color-scheme:dark]"
              />
            </div>
            
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Duration (Hours)</label>
              <input 
                type="number" 
                step="0.1"
                v-model="form.duration_hours" 
                class="w-full bg-gray-50 dark:bg-black/30 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                placeholder="e.g. 2.5"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5 ml-1">Reminder Date (Optional)</label>
            <input 
              type="datetime-local" 
              v-model="form.reminder" 
              class="w-full bg-gray-50 dark:bg-black/30 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all dark:[color-scheme:dark]"
            />
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-white/10">
          <button 
            type="button" 
            @click="close"
            class="px-5 py-2.5 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10 transition-all focus:outline-none"
          >
            Cancel
          </button>
          <button 
            type="submit"
            class="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl transition-all shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
          >
            Save Task
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['saved'])

const isOpen = ref(false)
const form = ref({
  id: null,
  title: '',
  description: '',
  status: 'todo',
  urgency: 'normal',
  category: 'General',
  reminder: '',
  estimated_end: '',
  duration_hours: null
})

const dynamicCategories = ref(['General'])

const open = async (task = null) => {
  try {
    dynamicCategories.value = await window.api.getCategories()
  } catch(e) {}
  
  if (task) {
    form.value = { ...task }
  } else {
    form.value = {
      id: null,
      title: '',
      description: '',
      status: 'todo',
      urgency: 'normal',
      category: 'General',
      reminder: '',
      estimated_end: '',
      duration_hours: null
    }
  }
  isOpen.value = true
}

const close = () => {
  isOpen.value = false
}

const save = async () => {
  try {
    if (form.value.id) {
      await window.api.updateTask(form.value.id, JSON.parse(JSON.stringify(form.value)))
    } else {
      await window.api.createTask(JSON.parse(JSON.stringify(form.value)))
    }
  } catch (err) {
    console.error('Failed to save task via IPC:', err)
  }
  
  emit('saved')
  close()
}

defineExpose({ open, close })
</script>

<style scoped>
@keyframes popIn {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
</style>
