<template>
  <div class="h-full w-full glass-panel overflow-hidden flex flex-col">
    <div class="h-full flex flex-col pt-2">
    <div class="flex items-center justify-between mb-6 px-6">
      <h2 class="text-xl font-bold text-gray-800 dark:text-gray-200">All Tasks List</h2>
    </div>
    
    <div class="glass-panel overflow-hidden w-full max-w-6xl mx-auto rounded-[2rem] shadow-2xl bg-white/50 dark:bg-black/20">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="text-gray-600 dark:text-gray-400 text-sm border-b border-gray-200 dark:border-white/10 bg-white/20 dark:bg-black/20">
            <th class="py-4 px-6 w-1/5 font-semibold">Title</th>
            <th class="py-4 px-6 w-1/4 font-semibold">Description</th>
            <th class="py-4 px-6 font-semibold">Urgency</th>
            <th class="py-4 px-6 font-semibold">Status</th>
            <th class="py-4 px-6 font-semibold">Duration</th>
            <th class="py-4 px-6 font-semibold">Est. End</th>
            <th class="py-4 px-6 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="task in tasks" 
            :key="task.id"
            class="border-b border-gray-100 dark:border-white/5 hover:bg-white/60 dark:hover:bg-white/5 transition-colors group cursor-pointer"
            @click="$emit('edit-task', task)"
          >
            <td class="py-4 px-6 font-medium text-gray-800 dark:text-gray-200">
              {{ task.title }}
              <div class="text-[10px] text-gray-500 mt-1">Created: {{ formatDate(task.created_at) }}</div>
            </td>
            <td class="py-4 px-6 text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">{{ task.description }}</td>
            <td class="py-4 px-6">
              <span :class="urgencyBadge(task.urgency).bg + ' ' + urgencyBadge(task.urgency).text" class="px-2 py-0.5 rounded border border-gray-300/30 dark:border-white/10 text-[10px] font-bold uppercase tracking-wider">
                {{ urgencyBadge(task.urgency).label }}
              </span>
            </td>
            <td class="py-4 px-6">
              <span :class="statusBadge(task.status).bg + ' ' + statusBadge(task.status).text" class="px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border border-gray-300/50 dark:border-white/10 shadow-sm">
                {{ statusBadge(task.status).label }}
              </span>
            </td>
            <td class="py-4 px-6 text-sm font-semibold text-blue-700 dark:text-blue-300">{{ task.duration_hours ? task.duration_hours + 'h' : '-' }}</td>
            <td class="py-4 px-6 text-sm font-semibold text-purple-700 dark:text-purple-300">{{ formatTime(task.estimated_end) }}</td>
            <td class="py-4 px-6 text-right">
              <button 
                @click.stop="confirmDelete(task)"
                class="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                title="Delete Task"
              >
                <svg xmlns="http://www.w0.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </td>
          </tr>
          <tr v-if="tasks.length === 0">
            <td colspan="5" class="py-8 text-center text-gray-500">No tasks found. Create one!</td>
          </tr>
        </tbody>
      </table>
    </div>
    </div>
    
    <ConfirmModal ref="confirmDialog" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ConfirmModal from './ConfirmModal.vue'

const emit = defineEmits(['edit-task'])
const tasks = ref([])
const confirmDialog = ref(null)

const loadTasks = async () => {
  try {
    const res = await fetch('http://127.0.0.1:8000/tasks')
    tasks.value = await res.json()
  } catch (err) {
    console.error('API not ready', err)
  }
}

const statusBadge = (status) => {
  const badges = {
    'todo': { label: 'To Do', bg: 'bg-blue-100 dark:bg-blue-500/20', text: 'text-blue-700 dark:text-blue-300' },
    'inprogress': { label: 'In Progress', bg: 'bg-amber-100 dark:bg-amber-500/20', text: 'text-amber-700 dark:text-amber-300' },
    'done': { label: 'Done', bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-300' }
  }
  return badges[status] || badges['todo']
}

const urgencyBadge = (urgency) => {
  const map = {
    'low': { label: 'Low', bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-300' },
    'normal': { label: 'Normal', bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-300' },
    'high': { label: 'High', bg: 'bg-orange-100 dark:bg-orange-900/40', text: 'text-orange-700 dark:text-orange-300' },
    'critical': { label: 'Critical', bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-300' }
  }
  return map[urgency] || map['normal']
}

const confirmDelete = async (task) => {
  const confirmed = await confirmDialog.value.open(`Are you sure you want to delete "${task.title}"?`)
  if (confirmed) {
    try {
      await fetch(`http://127.0.0.1:8000/tasks/${task.id}`, { method: 'DELETE' })
      loadTasks()
    } catch (e) {
      console.error(e)
    }
  }
}

const formatTime = (isoString) => {
  if (!isoString) return '-'
  const date = new Date(isoString)
  return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const formatDate = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleDateString()
}

onMounted(() => {
  loadTasks()
})

defineExpose({ loadTasks })
</script>
