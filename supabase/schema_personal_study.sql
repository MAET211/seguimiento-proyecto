-- =============================================================================
-- ESQUEMA DE BASE DE DATOS: MÓDULO INDEPENDIENTE DE ESTUDIO PERSONAL (NEXUSPM)
-- =============================================================================
-- Este script crea las tablas, índices, políticas RLS y almacenamiento privado
-- para el entorno de Estudio Personal en Supabase.
--
-- GARANTÍA DE AISLAMIENTO:
-- 1. Administrador General (role = 'admin' en profiles): Acceso administrativo global a ambos entornos.
-- 2. Integrantes del proyecto SIGMA: Acceso exclusivo a SIGMA. No tienen acceso a estas tablas a menos que
--    exista una invitación autorizada en study_members.
-- 3. Participantes de Estudio Personal: Acceso exclusivo a este espacio académico según su rol
--    ('admin', 'editor', 'lector').
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. TABLA: study_spaces (Espacios privados de estudio)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.study_spaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Espacio de Estudio e Investigación Académica',
    description TEXT DEFAULT 'Entorno privado e independiente para la planificación, avances y documentación académica.',
    academic_period TEXT DEFAULT 'Ciclo Profesional Actual',
    institution TEXT DEFAULT 'Facultad de Ingeniería',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 2. TABLA: study_members (Colaboradores y roles RBAC: admin, editor, lector)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.study_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    space_id UUID NOT NULL REFERENCES public.study_spaces(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'lector' CHECK (role IN ('admin', 'editor', 'lector')),
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(space_id, email)
);

-- -----------------------------------------------------------------------------
-- 3. TABLA: study_invitations (Invitaciones controladas para el espacio académico)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.study_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    space_id UUID NOT NULL REFERENCES public.study_spaces(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'lector' CHECK (role IN ('admin', 'editor', 'lector')),
    invited_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'aceptada' CHECK (status IN ('pendiente', 'aceptada', 'cancelada')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 4. TABLA: study_schedule_activities (Cronograma Académico Independiente)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.study_schedule_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    space_id UUID NOT NULL REFERENCES public.study_spaces(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    title TEXT NOT NULL,
    topic TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    hours NUMERIC NOT NULL DEFAULT 4,
    objectives TEXT,
    responsible_name TEXT NOT NULL DEFAULT 'Estudiante',
    status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'en_desarrollo', 'completada', 'retrasada')),
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    priority TEXT NOT NULL DEFAULT 'media' CHECK (priority IN ('baja', 'media', 'alta', 'urgente')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 5. TABLA: study_advances (Avances Académicos Diarios y Planificación)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.study_advances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    space_id UUID NOT NULL REFERENCES public.study_spaces(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES public.study_schedule_activities(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    purpose TEXT,
    scheduled_date DATE NOT NULL DEFAULT CURRENT_DATE,
    delivery_date DATE,
    objectives TEXT,
    responsible_names JSONB DEFAULT '[]'::jsonb,
    priority TEXT NOT NULL DEFAULT 'media' CHECK (priority IN ('baja', 'media', 'alta', 'urgente')),
    status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'en_desarrollo', 'completado')),
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    observations TEXT,
    results TEXT,
    conclusions TEXT,
    difficulties TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 6. TABLA: study_advance_tasks (Checklist de tareas de cada avance)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.study_advance_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advance_id UUID NOT NULL REFERENCES public.study_advances(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    assigned_to TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 7. TABLA: study_documents (Bóveda de Documentación y Recursos)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.study_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    space_id UUID NOT NULL REFERENCES public.study_spaces(id) ON DELETE CASCADE,
    advance_id UUID REFERENCES public.study_advances(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    size BIGINT NOT NULL DEFAULT 0,
    type TEXT NOT NULL DEFAULT 'application/octet-stream',
    extension TEXT NOT NULL DEFAULT 'otro',
    subject TEXT,
    storage_path TEXT,
    data_url TEXT,
    content_text TEXT,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    uploaded_by_name TEXT NOT NULL DEFAULT 'Estudiante',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 8. TABLA: study_comments (Comentarios y Bitácora de Avances)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.study_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    advance_id UUID NOT NULL REFERENCES public.study_advances(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 9. TABLA: study_activity_history (Trazabilidad y Auditoría de Estudio)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.study_activity_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    space_id UUID NOT NULL REFERENCES public.study_spaces(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- POLÍTICAS DE SEGURIDAD ROW LEVEL SECURITY (RLS) ESTRICTAS
-- =============================================================================
ALTER TABLE public.study_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_schedule_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_advance_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_activity_history ENABLE ROW LEVEL SECURITY;

-- Función de seguridad de verificación de autorización
CREATE OR REPLACE FUNCTION public.is_study_member_or_admin(target_space_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- 1. El Administrador General de NexusPM (role = 'admin') tiene acceso global
    SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid() AND is_active = true;
    IF user_role = 'admin' THEN
        RETURN TRUE;
    END IF;

    -- 2. Propietario del espacio
    IF EXISTS (SELECT 1 FROM public.study_spaces WHERE id = target_space_id AND owner_id = auth.uid()) THEN
        RETURN TRUE;
    END IF;

    -- 3. Miembro autorizado con invitación aceptada
    RETURN EXISTS (
        SELECT 1 FROM public.study_members sm
        JOIN public.profiles p ON p.id = auth.uid()
        WHERE sm.space_id = target_space_id
          AND (sm.user_id = auth.uid() OR LOWER(sm.email) = LOWER(p.email))
    );
END;
$$;

-- Políticas para study_spaces
DROP POLICY IF EXISTS "Acceso a espacios propios o autorizados" ON public.study_spaces;
CREATE POLICY "Acceso a espacios propios o autorizados"
    ON public.study_spaces FOR ALL TO authenticated
    USING (owner_id = auth.uid() OR public.is_study_member_or_admin(id))
    WITH CHECK (owner_id = auth.uid() OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- Políticas para study_members
DROP POLICY IF EXISTS "Acceso a lista de miembros del espacio" ON public.study_members;
CREATE POLICY "Acceso a lista de miembros del espacio"
    ON public.study_members FOR ALL TO authenticated
    USING (public.is_study_member_or_admin(space_id));

-- Políticas para study_invitations
DROP POLICY IF EXISTS "Acceso a invitaciones de estudio" ON public.study_invitations;
CREATE POLICY "Acceso a invitaciones de estudio"
    ON public.study_invitations FOR ALL TO authenticated
    USING (public.is_study_member_or_admin(space_id));

-- Políticas para study_schedule_activities
DROP POLICY IF EXISTS "Acceso a cronograma académico del espacio" ON public.study_schedule_activities;
CREATE POLICY "Acceso a cronograma académico del espacio"
    ON public.study_schedule_activities FOR ALL TO authenticated
    USING (public.is_study_member_or_admin(space_id));

-- Políticas para study_advances
DROP POLICY IF EXISTS "Acceso a avances académicos del espacio" ON public.study_advances;
CREATE POLICY "Acceso a avances académicos del espacio"
    ON public.study_advances FOR ALL TO authenticated
    USING (public.is_study_member_or_admin(space_id));

-- Políticas para study_advance_tasks
DROP POLICY IF EXISTS "Acceso a tareas de avances" ON public.study_advance_tasks;
CREATE POLICY "Acceso a tareas de avances"
    ON public.study_advance_tasks FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.study_advances sa
            WHERE sa.id = advance_id AND public.is_study_member_or_admin(sa.space_id)
        )
    );

-- Políticas para study_documents
DROP POLICY IF EXISTS "Acceso a documentos académicos del espacio" ON public.study_documents;
CREATE POLICY "Acceso a documentos académicos del espacio"
    ON public.study_documents FOR ALL TO authenticated
    USING (public.is_study_member_or_admin(space_id));

-- Políticas para study_comments
DROP POLICY IF EXISTS "Acceso a comentarios de avances" ON public.study_comments;
CREATE POLICY "Acceso a comentarios de avances"
    ON public.study_comments FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.study_advances sa
            WHERE sa.id = advance_id AND public.is_study_member_or_admin(sa.space_id)
        )
    );

-- Políticas para study_activity_history
DROP POLICY IF EXISTS "Acceso a historial de actividades de estudio" ON public.study_activity_history;
CREATE POLICY "Acceso a historial de actividades de estudio"
    ON public.study_activity_history FOR ALL TO authenticated
    USING (public.is_study_member_or_admin(space_id));
