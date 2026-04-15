# Tasks - Hybrid Engine

Una aplicación de escritorio moderna para la gestión de tareas, construida con arquitectura híbrida: **Vue 3 + Tailwind (Frontend)** empaquetado en **Electron** que se comunica con una API liviana en **Python (FastAPI + SQLite)** para persistencia nativa.

## Requisitos

- **Node.js**: v18+
- **Python**: 3.10+

## Instalación y Preparación

1. Clona el repositorio e instala las dependencias de Node:
   ```bash
   npm install
   ```
2. Instala las dependencias de Python (Asegúrate de instalarlas a nivel de sistema o crear un entorno virtual equivalente donde Electron pueda lanzar `python`/`python3`):
   ```bash
   pip install fastapi uvicorn pydantic appdirs
   ```

## Comandos Principales

### Entorno de Desarrollo (Development Mode)
Este comando levantará **simultáneamente** Vite (Frontend en Vue), inicializará FastAPI (Backend Python), y conectará la ventana gráfica de Electron:

```bash
npm run dev
```

### Compilar Ejecutable de Windows (.exe)
Para distribuir la aplicación o instalarla nativamente en tu sistema de manera independiente sin requerir consola (Producción):

```bash
npm run build
```

El proceso tomará unos minutos y generará un archivo autoinstalador dentro de la carpeta `/dist-electron`. Simplemente busca el archivo `Tasks Setup X.X.X.exe` (ej. `1.0.0.exe`) y ejecútalo para instalar en tu perfil. El acceso directo se agregará al sistema.

---
**Nota sobre persistencia:**  
La base de datos SQLite siempre se alojará y guardará de manera permanente en los directorios de usuario del sistema operativo local para que nunca pierdas tu progreso. En Windows, esto será bajo `%AppData%/tasks/database.sqlite`.
