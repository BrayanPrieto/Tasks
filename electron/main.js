const { app, BrowserWindow, Notification, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let reminderInterval;

const isDev = process.env.NODE_ENV === 'development';

// 1. Setup Local JSON Database and Settings
const dbPath = path.join(app.getPath('userData'), 'database.json');
const settingsPath = path.join(app.getPath('userData'), 'settings.json');

function initDB() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify([]), 'utf8');
  }
  if (!fs.existsSync(settingsPath)) {
    fs.writeFileSync(settingsPath, JSON.stringify({
      categories: ['General', 'Gestión Digital', 'Gestión Recursos', 'Personal']
    }), 'utf8');
  }
}

function getTasks() {
  try {
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function getSettings() {
  try {
    const data = fs.readFileSync(settingsPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { categories: ['General'] };
  }
}

function saveSettings(settings) {
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
}

function saveTasks(tasks) {
  fs.writeFileSync(dbPath, JSON.stringify(tasks, null, 2), 'utf8');
}

// IPC Handlers
ipcMain.handle('get-categories', () => {
  return getSettings().categories || [];
});

ipcMain.handle('save-categories', (event, categories) => {
  const current = getSettings();
  current.categories = categories;
  saveSettings(current);
  return current.categories;
});

ipcMain.handle('get-tasks', () => {
  return getTasks();
});

ipcMain.handle('create-task', (event, taskData) => {
  const tasks = getTasks();
  const newTask = {
    ...taskData,
    id: Date.now(),
    created_at: new Date().toISOString()
  };
  // Default values if not provided
  newTask.status = newTask.status || 'todo';
  newTask.category = newTask.category || 'General';
  newTask.urgency = newTask.urgency || 'normal';

  tasks.unshift(newTask); // Add to beginning
  saveTasks(tasks);
  return newTask;
});

ipcMain.handle('update-task', (event, id, taskData) => {
  const tasks = getTasks();
  const index = tasks.findIndex(t => t.id === id);
  if (index !== -1) {
    tasks[index] = { ...tasks[index], ...taskData, id };
    saveTasks(tasks);
    return tasks[index];
  }
  throw new Error('Task not found');
});

ipcMain.handle('delete-task', (event, id) => {
  const tasks = getTasks();
  const index = tasks.findIndex(t => t.id === id);
  if (index !== -1) {
    tasks.splice(index, 1);
    saveTasks(tasks);
    return { message: 'Success' };
  }
  throw new Error('Task not found');
});

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js') // Added preload bridge
    },
    autoHideMenuBar: true,
    show: false
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  setupReminders();
}

app.whenReady().then(() => {
  initDB();
  createWindow();

  app.setLoginItemSettings({
    openAtLogin: true,
    openAsHidden: true
  });

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Reminders Checker (Runs every minute directly in node)
function setupReminders() {
  const checkReminders = () => {
    try {
      const tasks = getTasks();
      const now = new Date();
      
      tasks.forEach(task => {
        if (task.reminder && task.status !== 'done') {
          const reminderTime = new Date(task.reminder);
          if (reminderTime.getFullYear() === now.getFullYear() &&
              reminderTime.getMonth() === now.getMonth() &&
              reminderTime.getDate() === now.getDate() &&
              reminderTime.getHours() === now.getHours() &&
              reminderTime.getMinutes() === now.getMinutes()) {
            
            if (Notification.isSupported()) {
              new Notification({
                title: 'Task Reminder',
                body: task.title,
                urgency: 'critical'
              }).show();
            }
          }
        }
      });
    } catch (err) {
      console.error('Failed to check reminders', err);
    }
  };

  reminderInterval = setInterval(checkReminders, 60 * 1000);
}
