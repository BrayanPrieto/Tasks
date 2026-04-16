const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getTasks: () => ipcRenderer.invoke('get-tasks'),
  createTask: (task) => ipcRenderer.invoke('create-task', task),
  updateTask: (id, task) => ipcRenderer.invoke('update-task', id, task),
  deleteTask: (id) => ipcRenderer.invoke('delete-task', id),
  getCategories: () => ipcRenderer.invoke('get-categories'),
  saveCategories: (categories) => ipcRenderer.invoke('save-categories', categories)
});
