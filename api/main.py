from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import sqlite3
import os
import appdirs

app = FastAPI()

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Definir la ruta de la base de datos de manera persistente (AppData)
user_data_dir = appdirs.user_data_dir("tasks")
os.makedirs(user_data_dir, exist_ok=True)
db_path = os.path.join(user_data_dir, "database.sqlite")

def get_db_connection():
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def add_column_if_not_exists(conn, table, col_name, col_type):
    try:
        conn.execute(f"ALTER TABLE {table} ADD COLUMN {col_name} {col_type}")
    except sqlite3.OperationalError:
        pass # Ignorar si ya existe

# Inicializar Base de Datos
def init_db():
    conn = get_db_connection()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT DEFAULT 'todo',
            reminder TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    add_column_if_not_exists(conn, "tasks", "estimated_end", "TEXT")
    add_column_if_not_exists(conn, "tasks", "duration_hours", "REAL")
    add_column_if_not_exists(conn, "tasks", "urgency", "TEXT DEFAULT 'normal'")
    conn.commit()
    conn.close()

init_db()

# Modelos
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    status: Optional[str] = "todo"
    reminder: Optional[str] = None
    estimated_end: Optional[str] = None
    duration_hours: Optional[float] = None
    urgency: Optional[str] = "normal"

class TaskUpdate(TaskCreate):
    id: int

class TaskResponse(TaskCreate):
    id: int
    created_at: str

# Endpoints
@app.get("/tasks", response_model=List[TaskResponse])
def get_tasks():
    conn = get_db_connection()
    tasks = conn.execute("SELECT * FROM tasks ORDER BY created_at DESC").fetchall()
    conn.close()
    return [dict(t) for t in tasks]

@app.post("/tasks", response_model=TaskResponse)
def create_task(task: TaskCreate):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO tasks (title, description, status, reminder, estimated_end, duration_hours, urgency) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (task.title, task.description, task.status, task.reminder, task.estimated_end, task.duration_hours, task.urgency)
    )
    task_id = cur.lastrowid
    conn.commit()
    new_task = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
    conn.close()
    return dict(new_task)

@app.put("/tasks/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task: TaskUpdate):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        "UPDATE tasks SET title = ?, description = ?, status = ?, reminder = ?, estimated_end = ?, duration_hours = ?, urgency = ? WHERE id = ?",
        (task.title, task.description, task.status, task.reminder, task.estimated_end, task.duration_hours, task.urgency, task_id)
    )
    if cur.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Task not found")
    conn.commit()
    updated_task = conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone()
    conn.close()
    return dict(updated_task)

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
    if cur.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Task not found")
    conn.commit()
    conn.close()
    return {"message": "Success"}
