-- =============================================================================
-- PLATAFORMA WEB COLABORATIVA DE GESTIÓN DE PROYECTOS (SUPABASE POSTGRESQL)
-- =============================================================================
-- Este script crea todas las tablas, funciones, triggers y políticas RLS
-- necesarias para el funcionamiento completo y seguro de la plataforma en Supabase.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. TABLA: profiles (Usuarios y roles del sistema: admin, lider, integrante)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'integrante' CHECK (role IN ('admin', 'lider', 'integrante')),
    specialty TEXT DEFAULT 'Desarrollador de Software',
    avatar_url TEXT,
    phone TEXT,
    github_username TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 2. TABLA: invitations (Registro controlado exclusivamente por Líder / Admin)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'integrante' CHECK (role IN ('admin', 'lider', 'integrante')),
    specialty TEXT DEFAULT 'Desarrollador',
    invited_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'aceptada' CHECK (status IN ('pendiente', 'aceptada', 'cancelada')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 3. TABLA: projects (Configuración del proyecto y metadatos)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT DEFAULT 'PRJ-001',
    description TEXT NOT NULL,
    objectives TEXT,
    leader_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '90 days'),
    status TEXT NOT NULL DEFAULT 'en_ejecucion' CHECK (status IN ('planificacion', 'en_ejecucion', 'en_pausa', 'completado')),
    repository_main_url TEXT,
    methodology TEXT DEFAULT 'Scrum / Ágil',
    version TEXT DEFAULT '1.0.0',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 4. TABLA: project_members (Integrantes del proyecto y responsabilidades)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.project_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_role TEXT NOT NULL DEFAULT 'Integrante',
    responsibilities TEXT NOT NULL DEFAULT 'Desarrollo y entrega de módulos asignados',
    weekly_hours INTEGER DEFAULT 20,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- -----------------------------------------------------------------------------
-- 5. TABLA: work_plan_activities (Módulo Plan de Trabajo y Cronograma / Gantt)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.work_plan_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    phase TEXT NOT NULL DEFAULT 'Fase 1: Planificación',
    name TEXT NOT NULL,
    description TEXT,
    responsible_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    priority TEXT NOT NULL DEFAULT 'media' CHECK (priority IN ('baja', 'media', 'alta', 'critica')),
    status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'en_proceso', 'en_revision', 'completada', 'retrasada')),
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    dependencies TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 6. TABLA: tasks (Módulo Tareas y Responsabilidades / Delegaciones)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    work_plan_id UUID REFERENCES public.work_plan_activities(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    instructions TEXT,
    reference_links JSONB DEFAULT '[]'::jsonb,
    priority TEXT NOT NULL DEFAULT 'media' CHECK (priority IN ('baja', 'media', 'alta', 'critica')),
    status TEXT NOT NULL DEFAULT 'pendiente' CHECK (
        status IN ('pendiente', 'en_proceso', 'en_revision', 'completada', 'devuelta')
    ),
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    assigned_at DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    completed_at TIMESTAMPTZ,
    deliverable_summary TEXT,
    deliverable_links JSONB DEFAULT '[]'::jsonb,
    leader_feedback TEXT,
    reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 7. TABLA: task_assignees (Asignaciones individuales o grupales de tareas)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.task_assignees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(task_id, user_id)
);

-- -----------------------------------------------------------------------------
-- 8. TABLA: task_evidences (Evidencias y entregas adjuntas a tareas)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.task_evidences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    evidence_url TEXT NOT NULL,
    evidence_type TEXT DEFAULT 'enlace' CHECK (evidence_type IN ('commit', 'pull_request', 'documento', 'imagen', 'despliegue', 'enlace')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 9. TABLA: changelog_entries (Módulo de Novedades y Trazabilidad Automática)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.changelog_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    author_name TEXT,
    task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    commit_or_pr_url TEXT,
    evidence_url TEXT,
    entry_type TEXT NOT NULL DEFAULT 'manual' CHECK (
        entry_type IN ('manual', 'asignacion', 'cambio_estado', 'aprobacion', 'devolucion', 'cronograma', 'finalizacion', 'repositorio')
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 10. TABLA: repositories_resources (Módulo de Repositorios y Recursos)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.repositories_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (
        category IN (
            'repo_principal',
            'repo_secundario',
            'rama',
            'pull_request',
            'issue',
            'documentacion',
            'diseno_prototipo',
            'requerimientos'
        )
    ),
    url TEXT NOT NULL,
    branch_or_tag TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 11. TABLA: notifications (Módulo de Notificaciones en Tiempo Real)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT NOT NULL DEFAULT 'sistema' CHECK (
        notification_type IN (
            'nueva_tarea',
            'cambio_fecha',
            'comentario_lider',
            'revision_enviada',
            'tarea_aprobada',
            'tarea_devuelta',
            'nueva_novedad',
            'cronograma',
            'sistema'
        )
    ),
    related_task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- FUNCIONES DE SEGURIDAD Y TRIGGERS DE AUTENTICACIÓN
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid() AND is_active = true;
$$;

-- Trigger para auto-confirmar cuentas creadas por el Líder / Admin sin esperar email
CREATE OR REPLACE FUNCTION public.auto_confirm_new_users()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    NEW.email_confirmed_at := COALESCE(NEW.email_confirmed_at, NOW());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_auto_confirm ON auth.users;
CREATE TRIGGER on_auth_user_auto_confirm
    BEFORE INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_new_users();

-- Trigger para asignar el rol estrictamente desde la invitación del Líder/Admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    inv_record RECORD;
    assigned_role TEXT := 'integrante';
    assigned_specialty TEXT := 'Integrante del Equipo';
    assigned_name TEXT;
    total_profiles INT;
BEGIN
    SELECT * INTO inv_record FROM public.invitations WHERE LOWER(email) = LOWER(NEW.email) LIMIT 1;
    SELECT COUNT(*) INTO total_profiles FROM public.profiles;

    IF total_profiles = 0 THEN
        assigned_role := 'lider';
        assigned_specialty := 'Líder del Proyecto';
    ELSIF inv_record IS NOT NULL THEN
        assigned_role := inv_record.role;
        assigned_specialty := COALESCE(inv_record.specialty, 'Integrante del Equipo');
        UPDATE public.invitations SET status = 'aceptada' WHERE id = inv_record.id;
    END IF;

    assigned_name := COALESCE(
        inv_record.full_name,
        NEW.raw_user_meta_data->>'full_name',
        SPLIT_PART(NEW.email, '@', 1)
    );

    INSERT INTO public.profiles (id, email, full_name, role, specialty, is_active)
    VALUES (NEW.id, NEW.email, assigned_name, assigned_role, assigned_specialty, true)
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
        role = EXCLUDED.role;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- POLÍTICAS DE SEGURIDAD ROW LEVEL SECURITY (RLS)
-- =============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_plan_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_evidences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.changelog_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repositories_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Perfiles visibles para usuarios autenticados"
    ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuarios editan su propio perfil o Admin/Lider gestiona perfiles"
    ON public.profiles FOR UPDATE TO authenticated
    USING (auth.uid() = id OR public.get_my_role() IN ('admin', 'lider'))
    WITH CHECK (auth.uid() = id OR public.get_my_role() IN ('admin', 'lider'));

CREATE POLICY "Permitir inserción de perfil propio o por Admin/Lider"
    ON public.profiles FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = id OR public.get_my_role() IN ('admin', 'lider'));

CREATE POLICY "Invitaciones visibles para usuarios autenticados"
    ON public.invitations FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin y Líder gestionan invitaciones"
    ON public.invitations FOR ALL TO authenticated
    USING (public.get_my_role() IN ('admin', 'lider'))
    WITH CHECK (public.get_my_role() IN ('admin', 'lider'));

CREATE POLICY "Proyectos visibles para usuarios autenticados"
    ON public.projects FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin y Líder crean y actualizan proyectos"
    ON public.projects FOR ALL TO authenticated
    USING (public.get_my_role() IN ('admin', 'lider'))
    WITH CHECK (public.get_my_role() IN ('admin', 'lider'));

CREATE POLICY "Miembros de proyecto visibles para todos los autenticados"
    ON public.project_members FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin y Líder gestionan miembros del proyecto"
    ON public.project_members FOR ALL TO authenticated
    USING (public.get_my_role() IN ('admin', 'lider'))
    WITH CHECK (public.get_my_role() IN ('admin', 'lider'));

CREATE POLICY "Plan de trabajo visible para todo el equipo"
    ON public.work_plan_activities FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin y Líder gestionan el plan de trabajo"
    ON public.work_plan_activities FOR ALL TO authenticated
    USING (public.get_my_role() IN ('admin', 'lider'))
    WITH CHECK (public.get_my_role() IN ('admin', 'lider'));

CREATE POLICY "Tareas visibles para todos los usuarios autenticados"
    ON public.tasks FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin y Líder crean tareas"
    ON public.tasks FOR INSERT TO authenticated
    WITH CHECK (public.get_my_role() IN ('admin', 'lider'));

CREATE POLICY "Actualización de tareas por Líder, Admin o Integrante asignado"
    ON public.tasks FOR UPDATE TO authenticated
    USING (
        public.get_my_role() IN ('admin', 'lider')
        OR EXISTS (
            SELECT 1 FROM public.task_assignees ta
            WHERE ta.task_id = tasks.id AND ta.user_id = auth.uid()
        )
    )
    WITH CHECK (
        public.get_my_role() IN ('admin', 'lider')
        OR EXISTS (
            SELECT 1 FROM public.task_assignees ta
            WHERE ta.task_id = tasks.id AND ta.user_id = auth.uid()
        )
    );

CREATE POLICY "Admin y Líder eliminan tareas"
    ON public.tasks FOR DELETE TO authenticated
    USING (public.get_my_role() IN ('admin', 'lider'));

CREATE POLICY "Asignaciones visibles para todos"
    ON public.task_assignees FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin y Líder gestionan asignaciones de tareas"
    ON public.task_assignees FOR ALL TO authenticated
    USING (public.get_my_role() IN ('admin', 'lider'))
    WITH CHECK (public.get_my_role() IN ('admin', 'lider'));

CREATE POLICY "Evidencias visibles para todos los autenticados"
    ON public.task_evidences FOR SELECT TO authenticated USING (true);

CREATE POLICY "Integrantes y líderes registran evidencias"
    ON public.task_evidences FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id OR public.get_my_role() IN ('admin', 'lider'));

CREATE POLICY "Autor, Líder o Admin eliminan evidencias"
    ON public.task_evidences FOR DELETE TO authenticated
    USING (auth.uid() = user_id OR public.get_my_role() IN ('admin', 'lider'));

CREATE POLICY "Novedades visibles para todo el equipo"
    ON public.changelog_entries FOR SELECT TO authenticated USING (true);

CREATE POLICY "Cualquier integrante autenticado puede registrar novedades"
    ON public.changelog_entries FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Admin, Líder o Autor eliminan novedades"
    ON public.changelog_entries FOR DELETE TO authenticated
    USING (auth.uid() = author_id OR public.get_my_role() IN ('admin', 'lider'));

CREATE POLICY "Repositorios y recursos visibles para todo el equipo"
    ON public.repositories_resources FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin, Líder e Integrantes pueden aportar recursos o enlaces"
    ON public.repositories_resources FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Admin y Líder actualizan repositorios y recursos"
    ON public.repositories_resources FOR UPDATE TO authenticated
    USING (public.get_my_role() IN ('admin', 'lider') OR auth.uid() = created_by);

CREATE POLICY "Admin y Líder eliminan repositorios y recursos"
    ON public.repositories_resources FOR DELETE TO authenticated
    USING (public.get_my_role() IN ('admin', 'lider') OR auth.uid() = created_by);

CREATE POLICY "Usuarios leen sus propias notificaciones"
    ON public.notifications FOR SELECT TO authenticated
    USING (auth.uid() = user_id OR public.get_my_role() = 'admin');

CREATE POLICY "Usuarios autenticados generan notificaciones para el equipo"
    ON public.notifications FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Usuarios marcan como leídas sus notificaciones"
    ON public.notifications FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios eliminan sus notificaciones"
    ON public.notifications FOR DELETE TO authenticated
    USING (auth.uid() = user_id OR public.get_my_role() = 'admin');
