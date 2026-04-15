<template>
  <div class="h-screen w-screen flex overflow-hidden app-bg font-sans transition-colors duration-500 bg-gray-50 dark:bg-black/95 text-gray-800 dark:text-gray-100">
    
    <!-- Collapsible Sidebar -->
    <aside 
      :class="[
        'flex flex-col border-r border-gray-200 dark:border-white/5 transition-all duration-300 relative glass-panel z-40 bg-white/80 dark:bg-black/40',
        isSidebarOpen ? 'w-64' : 'w-20'
      ]"
    >
      <!-- Logo & Hamburger -->
      <div class="flex items-center justify-between p-4 mb-4 border-b border-gray-200/50 dark:border-white/5 h-20">
        <div v-if="isSidebarOpen" class="flex items-baseline gap-2 overflow-hidden px-1">
          <h1 class="text-3xl font-black tracking-tighter text-blue-600 dark:text-blue-400">Tasks</h1>
        </div>
        <button 
          @click="toggleSidebar"
          class="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors mx-auto shrink-0 text-gray-500 dark:text-gray-300 focus:outline-none"
          :title="isSidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'"
        >
          <svg xmlns="http://www.w0.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <!-- Nav Links -->
      <nav class="flex-1 px-3 space-y-2 overflow-y-auto">
        <button 
          v-for="item in navItems" 
          :key="item.id"
          @click="currentTab = item.id"
          :class="[
            'w-full flex items-center p-3.5 rounded-xl transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-blue-500/30',
            currentTab === item.id 
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 font-semibold' 
              : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-white/5'
          ]"
          :title="item.label"
        >
          <span class="shrink-0" v-html="item.icon"></span>
          <span v-if="isSidebarOpen" class="ml-3 truncate text-sm font-medium">{{ item.label }}</span>
        </button>
      </nav>

      <!-- Sidebar Footer (Theme) -->
      <div class="p-4 border-t border-gray-200/50 dark:border-white/5 flex justify-center">
        <button 
          @click="toggleTheme" 
          class="flex items-center gap-3 p-3 w-full rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-colors justify-center focus:outline-none"
          :title="isDark ? 'Turn on light mode' : 'Turn on dark mode'"
        >
          <svg v-if="isDark" xmlns="http://www.w0.org/2000/svg" class="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <svg v-else xmlns="http://www.w0.org/2000/svg" class="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          <span v-if="isSidebarOpen" class="text-sm font-semibold">Theme</span>
        </button>
      </div>
    </aside>

    <!-- Main View -->
    <main class="flex-1 flex flex-col h-full overflow-hidden relative">
      <!-- Top Bar -->
      <header class="h-20 px-8 flex items-center justify-between border-b border-gray-200/50 dark:border-white/5 bg-white/40 dark:bg-black/20 backdrop-blur-md z-10 shrink-0">
        <h2 class="text-2xl font-extrabold text-gray-800 dark:text-gray-100 flex items-center gap-3">
          <span v-html="currentTabIcon" class="text-blue-500 opacity-80"></span>
          {{ currentTabTitle }}
        </h2>
        
        <button 
          @click="openModal()"
          class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl transition-all shadow-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
        >
          <svg xmlns="http://www.w0.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Task
        </button>
      </header>

      <!-- Content Area -->
      <div class="flex-1 overflow-hidden relative p-4 lg:p-6 w-full h-full">
        <Transition name="fade" mode="out-in">
        <KanbanBoard 
          v-if="currentTab === 'kanban'" 
          ref="kanban" 
          @edit-task="openModal" 
        />
        <TaskTable 
          v-else-if="currentTab === 'table'" 
          ref="table"
          @edit-task="openModal" 
        />
        <TaskDashboard 
          v-else-if="currentTab === 'dashboard'" 
          ref="dashboard"
        />
      </Transition>
      </div>
    </main>

    <!-- Task Modal -->
    <TaskModal ref="taskModal" @saved="refreshViews" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import KanbanBoard from './components/KanbanBoard.vue'
import TaskTable from './components/TaskTable.vue'
import TaskDashboard from './components/TaskDashboard.vue'
import TaskModal from './components/TaskModal.vue'

const currentTab = ref('kanban')
const isSidebarOpen = ref(false) // Default to closed

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
  localStorage.setItem('isSidebarOpen', isSidebarOpen.value)
}

const navItems = [
  { id: 'kanban', label: 'Kanban Board', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>' },
  { id: 'table', label: 'Table View', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>' },
  { id: 'dashboard', label: 'Dashboard', icon: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>' }
]

const currentTabTitle = computed(() => navItems.find(i => i.id === currentTab.value)?.label || 'Tasks')
const currentTabIcon = computed(() => navItems.find(i => i.id === currentTab.value)?.icon || '')

const kanban = ref(null)
const table = ref(null)
const dashboard = ref(null)
const taskModal = ref(null)

const isDark = ref(false) // Default to light mode

const toggleTheme = () => {
  isDark.value = !isDark.value
  updateTheme()
}

const updateTheme = () => {
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}

onMounted(() => {
  // Restore theme from settings
  if (localStorage.getItem('theme') === 'dark') {
    isDark.value = true
  } else {
    isDark.value = false
    // Initialize user settings with default if not present
    if (!localStorage.getItem('theme')) localStorage.setItem('theme', 'light')
  }
  updateTheme()

  // Restore sidebar from settings
  const storedSidebar = localStorage.getItem('isSidebarOpen')
  if (storedSidebar !== null) {
    isSidebarOpen.value = storedSidebar === 'true'
  } else {
    isSidebarOpen.value = false
    localStorage.setItem('isSidebarOpen', 'false')
  }
})

const openModal = (task = null) => {
  taskModal.value.open(task)
}

const refreshViews = () => {
  if (currentTab.value === 'kanban' && kanban.value) {
    kanban.value.loadTasks()
  } else if (currentTab.value === 'table' && table.value) {
    table.value.loadTasks()
  } else if (currentTab.value === 'dashboard' && dashboard.value) {
    dashboard.value.loadTasks()
  }
}
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
</style>
