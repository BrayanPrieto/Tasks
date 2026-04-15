const { app, BrowserWindow, Notification } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let pythonProcess;
let reminderInterval;

const isDev = process.env.NODE_ENV === 'development';

// 1. Spawn Python Backend
function startPythonAPI() {
  const scriptPath = path.join(__dirname, '../api/main.py');
  
  // In production, you might compile python to exe, so check if it exists:
  // For now, we spawn standard python
  pythonProcess = spawn('python', ['-m', 'uvicorn', 'api.main:app', '--port', '8000', '--host', '127.0.0.1'], {
    cwd: path.join(__dirname, '..')
  });

  pythonProcess.stdout.on('data', (data) => {
    console.log(`Python: ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Python Error: ${data}`);
  });
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
    show: false // Wait until ready-to-show
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  setupReminders();
}

app.whenReady().then(() => {
  startPythonAPI();
  
  // Wait a split second for python to boot before creating window
  setTimeout(createWindow, 1500);

  app.setLoginItemSettings({
    openAtLogin: true,
    openAsHidden: true
  });

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('will-quit', () => {
  if (pythonProcess) {
    pythonProcess.kill();
  }
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Reminders Checker (Runs every minute calling python backend via HTTP directly in node, or rely on Vue)
function setupReminders() {
  const checkReminders = async () => {
    try {
      // In electron 29+ we can fetch
      const res = await fetch('http://127.0.0.1:8000/tasks');
      const tasks = await res.json();
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

  // Check every minute
  reminderInterval = setInterval(checkReminders, 60 * 1000);
}
