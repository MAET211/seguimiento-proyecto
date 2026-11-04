# NexusPM — Plataforma Web Colaborativa de Gestión de Proyectos

Plataforma web completa para la **planificación, organización, delegación de actividades, cronograma Gantt interactivo, trazabilidad de novedades y seguimiento en tiempo real** de un proyecto de software.

Diseñada con **React + Vite + Tailwind CSS + Supabase (PostgreSQL & Auth)** y preparada para publicarse gratuitamente como aplicación estática en **GitHub Pages** mediante **GitHub Actions**.

---

## 1. Arquitectura y Estructura del Proyecto

```text
seguimiento_proyecto/
├── .github/
│   └── workflows/
│       └── deploy.yml              # Workflow CI/CD para publicar en GitHub Pages
├── supabase/
│   └── schema.sql                  # Esquema PostgreSQL completo (11 tablas, triggers y políticas RLS)
├── src/
│   ├── components/
│   │   └── Layout.jsx              # Barra lateral, notificaciones, modo claro/oscuro y asistente Supabase
│   ├── context/
│   │   └── ProjectContext.jsx      # Sincronización en tiempo real con Supabase, Auth y trazabilidad
│   ├── data/
│   │   └── initialProjectSeed.js   # Estructura semilla inicial para verificación y primer despliegue
│   ├── lib/
│   │   └── supabase.js             # Cliente oficial de @supabase/supabase-js
│   ├── pages/
│   │   ├── AuthPage.jsx            # Inicio de sesión, registro controlado y recuperación de clave
│   │   ├── DashboardPage.jsx       # Panel principal con métricas reales, entregas y resumen del equipo
│   │   ├── TasksPage.jsx           # Módulo "Tareas y responsabilidades" + flujo de revisión y evidencias
│   │   ├── WorkPlanPage.jsx        # Módulo "Plan de trabajo" con Cronograma Visual Diagrama de Gantt
│   │   ├── ChangelogPage.jsx       # Módulo "Novedades" manuales y bitácora automática de eventos
│   │   ├── RepositoriesPage.jsx    # Módulo "Repositorios y recursos" categorizados
│   │   └── AdminTeamPage.jsx       # Gestión de usuarios, roles, permisos y configuración del proyecto
│   ├── utils/
│   │   └── formatters.js           # Formateadores de fechas, estados, prioridades y colores por rol
│   ├── App.jsx                     # Enrutamiento HashRouter compatible con GitHub Pages y rutas protegidas
│   ├── index.css                   # Estilos globales con Tailwind CSS y soporte de modo oscuro
│   └── main.jsx                    # Punto de entrada de React
├── .env.example                    # Plantilla de variables de entorno públicas de Supabase
├── .gitignore                      # Exclusión de node_modules, dist y archivos .env privados
├── index.html                      # Plantilla HTML principal
├── package.json                    # Dependencias y scripts de compilación
└── vite.config.js                  # Configuración de Vite con ruta base adaptable a GitHub Pages
```

---

## 2. Módulos y Roles Implementados

### Roles del Sistema
1. **Administrador (`admin`)**:
   - Gestiona cuentas de usuario (crear/invitar, editar rol, activar o desactivar cuentas).
   - Supervisa todos los módulos y administra la configuración general.
2. **Líder del Proyecto (`lider`)**:
   - Configura los datos maestros del proyecto y registra integrantes con sus responsabilidades.
   - Crea y administra el **Plan de Trabajo** y el **Diagrama de Gantt interactivo**.
   - Delega tareas individuales o grupales con prioridad, instrucciones y fechas límite.
   - Recibe notificaciones de entregas, revisa evidencias y **aprueba** o **devuelve tareas para correcciones**.
3. **Integrantes (`integrante`)**:
   - Inician sesión con su propia cuenta.
   - Consultan sus tareas asignadas, instrucciones, referencias y fechas de entrega.
   - Actualizan el porcentaje de avance, adjuntan evidencias (commits, PRs, enlaces) y marcan actividades como **finalizadas para revisión**.
   - Registran novedades en la bitácora y consultan el cronograma general del proyecto.

---

## 3. Ejecución en Entorno Local

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
3. Compilar para producción (genera la carpeta `./dist` lista para GitHub Pages):
   ```bash
   npm run build
   ```

---

## 4. Configuración de Base de Datos y Autenticación en Supabase

1. Crea un proyecto gratuito en [Supabase](https://supabase.com/).
2. En el menú lateral izquierdo de Supabase, abre **SQL Editor** → **New Query**.
3. Copia todo el contenido del archivo [`supabase/schema.sql`](./supabase/schema.sql), pégalo en el editor y haz clic en **Run**.
   - Esto creará las 11 tablas relacionales (`profiles`, `invitations`, `projects`, `project_members`, `work_plan_activities`, `tasks`, `task_assignees`, `task_evidences`, `changelog_entries`, `repositories_resources`, `notifications`), el trigger automático de creación de perfiles y las políticas **Row Level Security (RLS)** por rol.
4. Ve a **Project Settings** → **API** y copia:
   - `Project URL`
   - `anon` / `public` key (**Nunca** utilices la clave `service_role` en el frontend).
5. Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`:
   ```env
   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu_clave_anon_publica
   VITE_BASE_PATH=./
   ```
   *(También puedes ingresar estas credenciales directamente desde el botón **"Supabase Conectado / Pre-conexión Supabase"** ubicado en la esquina inferior izquierda de la plataforma).*

---

## 5. Instrucciones para Migrar a GitHub y Publicar en GitHub Pages

1. Inicializa el repositorio Git (si aún no está inicializado) y sube el código a GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: plataforma colaborativa de gestion de proyectos con Supabase"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
   git push -u origin main
   ```
2. En tu repositorio de GitHub, ve a **Settings** → **Secrets and variables** → **Actions** y agrega dos *Repository secrets*:
   - `VITE_SUPABASE_URL`: La URL de tu proyecto Supabase.
   - `VITE_SUPABASE_ANON_KEY`: Tu clave pública `anon` de Supabase.
3. En tu repositorio de GitHub, ve a **Settings** → **Pages**:
   - En **Build and deployment** → **Source**, selecciona **GitHub Actions**.
4. El workflow [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml) compilará y publicará automáticamente la plataforma en tu URL de GitHub Pages cada vez que hagas `push` a la rama `main`.
