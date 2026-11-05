-- =============================================================================
-- ESQUEMA DE BASE DE DATOS: MÓDULO INDEPENDIENTE DE ESTUDIO PERSONAL
-- =============================================================================
-- Este script crea las tablas, índices y políticas RLS para el entorno de
-- Estudio Personal en Supabase.
--
-- GARANTÍA DE NO INTERFERENCIA:
-- Estas tablas están 100% aisladas de las tablas del proyecto principal SIGMA
-- (profiles, projects, tasks, work_plan_activities, etc.).
-- Ningún integrante del proyecto SIGMA puede consultar ni modificar esta información
-- a menos que sea invitado explícitamente en la tabla study_members.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. TABLA: study_spaces (Espacios privados de estudio)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.study_spaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Espacio de Estudio e Investigación Académica',
    description TEXT DEFAULT 'Entorno privado e independiente para la planificación y documentación académica.',
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
-- 3. TABLA: study_schedule_activities (Cronograma Académico Independiente)
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
    status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'en_desarrollo', 'completada')),
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    priority TEXT NOT NULL DEFAULT 'media' CHECK (priority IN ('baja', 'media', 'alta', 'urgente')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 4. TABLA: study_advances (Avances Académicos Diarios y Resultados)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.study_advances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    space_id UUID NOT NULL REFERENCES public.study_spaces(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    purpose TEXT,
    scheduled_date DATE NOT NULL DEFAULT CURRENT_DATE,
    objectives TEXT,
    tasks_checklist JSONB DEFAULT '[]'::jsonb,
    responsible_names JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'en_desarrollo', 'completado')),
    observations TEXT,
    results TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 5. TABLA: study_documents (Documentación y Recursos Multiformato)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.study_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    space_id UUID NOT NULL REFERENCES public.study_spaces(id) ON DELETE CASCADE,
    advance_id UUID REFERENCES public.study_advances(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    size BIGINT NOT NULL DEFAULT 0,
    type TEXT NOT NULL DEFAULT 'application/octet-stream',
    extension TEXT NOT NULL DEFAULT 'otro',
    data_url TEXT,
    content_text TEXT,
    storage_path TEXT,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    uploaded_by_name TEXT NOT NULL DEFAULT 'Estudiante',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- POLÍTICAS DE SEGURIDAD ROW LEVEL SECURITY (RLS) ESTRICTAS
-- =============================================================================
ALTER TABLE public.study_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_schedule_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_documents ENABLE ROW LEVEL SECURITY;

-- Función de ayuda para verificar si un usuario es miembro autorizado de un espacio
CREATE OR REPLACE FUNCTION public.is_study_member_or_owner(target_space_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.study_spaces
        WHERE id = target_space_id AND owner_id = auth.uid()
    ) OR EXISTS (
        SELECT 1 FROM public.study_members sm
        JOIN public.profiles p ON p.id = auth.uid()
        WHERE sm.space_id = target_space_id
          AND (sm.user_id = auth.uid() OR LOWER(sm.email) = LOWER(p.email))
    );
END;
$$;

-- Políticas en study_spaces
CREATE POLICY "Acceso a espacios propios o autorizados"
    ON public.study_spaces FOR ALL TO authenticated
    USING (owner_id = auth.uid() OR public.is_study_member_or_owner(id))
    WITH CHECK (owner_id = auth.uid());

-- Políticas en study_members
CREATE POLICY "Acceso a lista de miembros del espacio"
    ON public.study_members FOR ALL TO authenticated
    USING (public.is_study_member_or_owner(space_id));

-- Políticas en study_schedule_activities
CREATE POLICY "Acceso a cronograma académico del espacio"
    ON public.study_schedule_activities FOR ALL TO authenticated
    USING (public.is_study_member_or_owner(space_id));

-- Políticas en study_advances
CREATE POLICY "Acceso a avances académicos del espacio"
    ON public.study_advances FOR ALL TO authenticated
    USING (public.is_study_member_or_owner(space_id));

-- Políticas en study_documents
CREATE POLICY "Acceso a documentos académicos del espacio"
    ON public.study_documents FOR ALL TO authenticated
    USING (public.is_study_member_or_owner(space_id));
