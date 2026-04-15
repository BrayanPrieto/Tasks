<template>
  <div class="flex h-full gap-6 overflow-x-auto pb-4 custom-scrollbar w-full">
    <div 
      v-for="column in columns" 
      :key="column.id" 
      class="glass-panel flex flex-col flex-1 min-w-[280px] relative overflow-hidden"
    >
      <!-- Glass ambient header -->
      <div class="p-5 border-b border-gray-200/50 dark:border-white/5 flex items-center justify-between bg-white/20 dark:bg-black/10 z-10 transition-colors">
        <div class="flex items-center gap-3">
          <div :class="['w-2 h-2 rounded-full', column.dotColor]"></div>
          <h2 :class="['font-bold text-lg', column.color]">{{ column.title }}</h2>
        </div>
        <span class="text-xs font-bold py-1.5 px-3 rounded-full bg-gray-200/80 text-gray-700 dark:bg-white/10 dark:text-white backdrop-blur-sm transition-colors min-w-[32px] text-center">
          {{ tasksByStatus(column.id).length > 99 ? '99+' : tasksByStatus(column.id).length }}
        </span>
      </div>
      
      <div class="flex-1 overflow-y-auto p-4 z-10 custom-scrollbar">
        <VueDraggableNext
          class="h-full min-h-[150px] space-y-4"
          :list="tasksByStatus(column.id)"
          group="tasks"
          @change="(e) => handleChange(e, column.id)"
        >
          <div 
            v-for="element in tasksByStatus(column.id)" 
            :key="element.id" 
            class="group cursor-grab active:cursor-grabbing p-3.5 rounded-xl border border-gray-200/80 dark:border-white/10 backdrop-blur-sm hover:scale-[1.02] transform transition-all shadow-sm hover:shadow-xl flex flex-col relative min-h-[120px] bg-white/60 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10"
            @dblclick="$emit('edit-task', element)"
          >
            <div class="flex justify-between items-start mb-1 gap-2">
              <h3 class="font-semibold text-gray-800 dark:text-gray-100 leading-tight line-clamp-2 text-sm flex-1">{{ element.title }}</h3>
              <span v-if="element.urgency && element.urgency !== 'normal'" :class="urgencyBadge(element.urgency).text" class="text-[10px] uppercase font-bold tracking-widest shrink-0 mt-0.5" :title="'Urgency: '+ element.urgency">
                {{ element.urgency === 'critical' ? '⚡ CRIT' : element.urgency === 'high' ? '🔥 HIGH' : '🧊 LOW' }}
              </span>
            </div>
            <p v-if="element.description" class="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">{{ element.description }}</p>
            
            <div class="flex flex-col gap-1 mt-auto pt-3 border-t border-gray-200/80 dark:border-white/5 transition-colors">
              <div v-if="element.duration_hours" class="text-xs text-blue-700 dark:text-blue-300 font-semibold opacity-90">
                ⏱ {{ element.duration_hours }}h required
              </div>
              <div class="flex items-center justify-between w-full">
                <div v-if="element.estimated_end" class="flex items-center text-xs text-green-700 dark:text-green-300 font-semibold px-2 py-0.5 bg-green-500/10 rounded border border-green-500/20">
                  🎯 Limit: {{ formatTime(element.estimated_end) }}
                </div>
                <div v-else-if="element.reminder" class="flex items-center text-xs text-purple-700 dark:text-purple-300 font-semibold px-2 py-0.5 bg-purple-500/10 rounded border border-purple-500/20">
                  ⏰ {{ formatTime(element.reminder) }}
                </div>
                <div v-else class="text-[10px] text-gray-500 dark:text-gray-500 italic font-medium">No dates</div>
                
                <button 
                  @click.stop="confirmDelete(element)"
                  class="opacity-0 group-hover:opacity-100 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 p-1 hover:bg-red-500/20 rounded transition-all"
                  title="Delete Task"
                >
                  <svg xmlns="http://www.w0.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </VueDraggableNext>
      </div>
    </div>
    
    <ConfirmModal ref="confirmDialog" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { VueDraggableNext } from 'vue-draggable-next'
import ConfirmModal from './ConfirmModal.vue'

const emit = defineEmits(['edit-task'])
const confirmDialog = ref(null)

const columns = [
  { id: 'todo', title: 'To Do', color: 'text-blue-700 dark:text-blue-100', dotColor: 'bg-blue-600 dark:bg-blue-400' },
  { id: 'inprogress', title: 'In Progress', color: 'text-amber-600 dark:text-amber-100', dotColor: 'bg-amber-500 dark:bg-amber-400' },
  { id: 'done', title: 'Done', color: 'text-emerald-700 dark:text-emerald-100', dotColor: 'bg-emerald-500 dark:bg-emerald-400' }
]

const tasks = ref([])

const loadTasks = async () => {
  try {
    const res = await fetch('http://127.0.0.1:8000/tasks')
    tasks.value = await res.json()
  } catch(err) {
    console.log("Waiting for python api...", err);
    setTimeout(loadTasks, 1000); // Retry if python is booting
  }
}

const tasksByStatus = (status) => {
  return tasks.value.filter(t => t.status === status)
}

const handleChange = async (e, targetStatus) => {
  if (e.added) {
    const task = e.added.element
    task.status = targetStatus
    try {
      await fetch(`http://127.0.0.1:8000/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task)
      })
      loadTasks()
    } catch(err) {
      console.error(err)
    }
  }
}

const confirmDelete = async (task) => {
  const confirmed = await confirmDialog.value.open(`Are you sure you want to delete "${task.title}"?`)
  if (confirmed) {
    try {
      await fetch(`http://127.0.0.1:8000/tasks/${task.id}`, { method: 'DELETE' })
      loadTasks()
    } catch (err) {
      console.error(err)
    }
  }
}

const formatTime = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const urgencyBadge = (urgency) => {
  const map = {
    'low': { text: 'text-gray-400 dark:text-gray-500' },
    'high': { text: 'text-orange-500' },
    'critical': { text: 'text-red-500 animate-pulse' }
  }
  return map[urgency] || map['low']
}

onMounted(() => {
  loadTasks()
})

defineExpose({ loadTasks })
</script>

<style scoped>
.task-card::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(to bottom right, rgba(255,255,255,0.2), rgba(255,255,255,0));
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  pointer-events: none;
}
</style>
