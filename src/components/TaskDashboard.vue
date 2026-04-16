<template>
  <div class="h-full w-full glass-panel overflow-y-auto p-8 custom-scrollbar">
    <div class="max-w-6xl mx-auto space-y-8">
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Stats Cards -->
        <div class="bg-blue-500/10 dark:bg-blue-500/20 border border-blue-200 dark:border-blue-500/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <h3 class="text-sm font-semibold text-blue-600 dark:text-blue-300 uppercase tracking-widest mb-1">Total Tasks</h3>
          <p class="text-4xl font-extrabold text-blue-800 dark:text-blue-100">{{ totalTasks }}</p>
        </div>
        <div class="bg-green-500/10 dark:bg-green-500/20 border border-green-200 dark:border-green-500/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <h3 class="text-sm font-semibold text-green-600 dark:text-green-300 uppercase tracking-widest mb-1">Completion Rate</h3>
          <p class="text-4xl font-extrabold text-green-800 dark:text-green-100">{{ completionRate }}%</p>
        </div>
        <div class="bg-purple-500/10 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-500/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <h3 class="text-sm font-semibold text-purple-600 dark:text-purple-300 uppercase tracking-widest mb-1">Engaged Limits</h3>
          <p class="text-4xl font-extrabold text-purple-800 dark:text-purple-100">{{ totalHours.toFixed(1) }}h</p>
          <span class="text-xs text-purple-600/70 dark:text-purple-400 mt-1">Total Estimated</span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Chart 1: Status Dist -->
        <div class="bg-white/40 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
          <h3 class="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">Tasks By Status</h3>
          <div class="h-64 flex justify-center">
            <Doughnut v-if="chartDataReady" :data="statusChartData" :options="chartOptions" />
          </div>
        </div>

        <!-- Detail Insights -->
        <div class="bg-white/40 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-sm flex flex-col">
          <h3 class="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">Insights</h3>
          <ul class="space-y-4 flex-1">
            <li class="flex justify-between items-center bg-white/50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5">
              <span class="font-medium text-gray-600 dark:text-gray-300">Pending Operations</span>
              <span class="text-lg font-bold text-gray-800 dark:text-white">{{ stats.todo + stats.inprogress }}</span>
            </li>
            <li class="flex justify-between items-center bg-white/50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5">
              <span class="font-medium text-gray-600 dark:text-gray-300">Finished Successfully</span>
              <span class="text-lg font-bold text-gray-800 dark:text-white">{{ stats.done }}</span>
            </li>
            <li class="flex justify-between items-center bg-white/50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/5">
              <span class="font-medium text-gray-600 dark:text-gray-300">Tasks with Deadline</span>
              <span class="text-lg font-bold text-gray-800 dark:text-white">{{ tasksWithDeadlines }}</span>
            </li>
          </ul>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'vue-chartjs'

ChartJS.register(ArcElement, Tooltip, Legend)

const tasks = ref([])
const chartDataReady = ref(false)

const stats = ref({ todo: 0, inprogress: 0, done: 0 })

const loadTasks = async () => {
  chartDataReady.value = false
  try {
    const data = await window.api.getTasks()
    tasks.value = data
    computeStats(data)
    chartDataReady.value = true
  } catch(e) {
    console.error(e)
  }
}

const computeStats = (data) => {
  stats.value = {
    todo: data.filter(t => t.status === 'todo').length,
    inprogress: data.filter(t => t.status === 'inprogress').length,
    done: data.filter(t => t.status === 'done').length
  }
}

const totalTasks = computed(() => tasks.value.length)

const completionRate = computed(() => {
  if (totalTasks.value === 0) return 0
  return Math.round((stats.value.done / totalTasks.value) * 100)
})

const totalHours = computed(() => {
  return tasks.value.reduce((acc, current) => acc + (current.duration_hours || 0), 0)
})

const tasksWithDeadlines = computed(() => {
  return tasks.value.filter(t => t.estimated_end).length
})

const statusChartData = computed(() => {
  const isDark = document.documentElement.classList.contains('dark')
  const textColor = isDark ? '#fff' : '#1f2937'
  
  return {
    labels: ['To Do', 'In Progress', 'Done'],
    datasets: [
      {
        backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(245, 158, 11, 0.8)', 'rgba(16, 185, 129, 0.8)'],
        borderColor: isDark ? 'rgba(0,0,0,0.1)' : '#ffffff',
        borderWidth: 2,
        data: [stats.value.todo, stats.value.inprogress, stats.value.done]
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: '#8b949e', // Universal legible gray
        padding: 20,
        font: { size: 13, family: "'Inter', sans-serif" }
      }
    }
  }
}

onMounted(() => {
  loadTasks()
})

defineExpose({ loadTasks })
</script>
