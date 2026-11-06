-- =============================================================================
-- ESQUEMA DE BASE DE DATOS: MÓDULO INDEPENDIENTE DE ESTUDIO PERSONAL (NEXUSPM)
-- =============================================================================
-- Compatible con despliegue en GitHub Pages, cliente web y Supabase Realtime.
-- Soporta identidades tipo texto (act-std-..., usr-...) y UUIDs nativos.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA: study_spaces (Espacios privados de estudio)
CREATE TABLE IF NOT EXISTS public.study_spaces (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    owner_id TEXT NOT NULL DEFAULT 'usr-admin-01',
    owner_name TEXT NOT NULL DEFAULT 'Miguel Estrada torrente',
    owner_email TEXT NOT NULL DEFAULT 'miguelestrada@proyecto.com',
    name TEXT NOT NULL DEFAULT 'Espacio de Estudio e Investigación Académica',
    description TEXT DEFAULT 'Entorno privado e independiente para la planificación, avances y documentación académica.',
    academic_period TEXT DEFAULT 'Ciclo Profesional Actual',
    institution TEXT DEFAULT 'Facultad de Ingeniería',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TABLA: study_members (Colaboradores y roles RBAC: admin, editor, lector)
CREATE TABLE IF NOT EXISTS public.study_members (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    space_id TEXT NOT NULL DEFAULT 'study-space-01',
    user_id TEXT,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'lector' CHECK (role IN ('admin', 'editor', 'lector')),
    is_owner BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    assigned_password TEXT,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(space_id, email)
);

-- 3. TABLA: study_schedule_activities (Cronograma Académico Independiente)
CREATE TABLE IF NOT EXISTS public.study_schedule_activities (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    space_id TEXT NOT NULL DEFAULT 'study-space-01',
    subject TEXT NOT NULL,
    title TEXT NOT NULL,
    topic TEXT DEFAULT '',
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '14 days'),
    hours NUMERIC NOT NULL DEFAULT 4,
    objectives TEXT DEFAULT '',
    responsible_name TEXT NOT NULL DEFAULT 'Estudiante',
    status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'en_desarrollo', 'completada', 'retrasada')),
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    priority TEXT NOT NULL DEFAULT 'media' CHECK (priority IN ('baja', 'media', 'alta', 'urgente')),
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. TABLA: study_advances (Avances Académicos Diarios y Planificación)
CREATE TABLE IF NOT EXISTS public.study_advances (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    space_id TEXT NOT NULL DEFAULT 'study-space-01',
    activity_id TEXT,
    title TEXT NOT NULL,
    purpose TEXT DEFAULT '',
    scheduled_date DATE NOT NULL DEFAULT CURRENT_DATE,
    delivery_date DATE,
    objectives TEXT DEFAULT '',
    tasks_checklist JSONB DEFAULT '[]'::jsonb,
    responsible_names JSONB DEFAULT '[]'::jsonb,
    priority TEXT NOT NULL DEFAULT 'media' CHECK (priority IN ('baja', 'media', 'alta', 'urgente')),
    status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'en_desarrollo', 'completado')),
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    observations TEXT DEFAULT '',
    results TEXT DEFAULT '',
    conclusions TEXT DEFAULT '',
    difficulties TEXT DEFAULT '',
    attachments_count INTEGER NOT NULL DEFAULT 0,
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TABLA: study_documents (Documentación y Recursos Académicos)
CREATE TABLE IF NOT EXISTS public.study_documents (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    space_id TEXT NOT NULL DEFAULT 'study-space-01',
    advance_id TEXT,
    name TEXT NOT NULL,
    size BIGINT NOT NULL DEFAULT 0,
    type TEXT NOT NULL DEFAULT 'application/octet-stream',
    extension TEXT NOT NULL DEFAULT 'otro',
    subject TEXT DEFAULT '',
    storage_path TEXT,
    data_url TEXT,
    content_text TEXT,
    uploaded_by TEXT,
    uploaded_by_name TEXT NOT NULL DEFAULT 'Estudiante',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- POLÍTICAS DE SEGURIDAD (RLS) - Permitir tanto autenticados como anónimos autorizados
-- =============================================================================
ALTER TABLE public.study_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_schedule_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_advances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "study_spaces_all" ON public.study_spaces;
CREATE POLICY "study_spaces_all" ON public.study_spaces FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "study_members_all" ON public.study_members;
CREATE POLICY "study_members_all" ON public.study_members FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "study_schedule_activities_all" ON public.study_schedule_activities;
CREATE POLICY "study_schedule_activities_all" ON public.study_schedule_activities FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "study_advances_all" ON public.study_advances;
CREATE POLICY "study_advances_all" ON public.study_advances FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "study_documents_all" ON public.study_documents;
CREATE POLICY "study_documents_all" ON public.study_documents FOR ALL TO authenticated, anon USING (true) WITH CHECK (true);

-- =============================================================================
-- PUBLICACIÓN EN TIEMPO REAL (SUPABASE REALTIME)
-- =============================================================================
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.study_spaces;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.study_members;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.study_schedule_activities;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.study_advances;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.study_documents;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- =============================================================================
-- REGISTROS INICIALES: Espacio limpio y participantes autorizados
-- =============================================================================
INSERT INTO public.study_spaces (id, owner_id, owner_name, owner_email, name, description)
VALUES (
    'study-space-01',
    'usr-admin-01',
    'Miguel Estrada torrente',
    'miguelestrada@proyecto.com',
    'Espacio de Estudio e Investigación Académica',
    'Entorno privado e independiente para la planificación, avances y documentación académica.'
)
ON CONFLICT (id) DO UPDATE SET
    owner_name = EXCLUDED.owner_name,
    owner_email = EXCLUDED.owner_email;

-- Propietario Principal (Miguel) y Colaborador Editor (Covaleda)
INSERT INTO public.study_members (id, space_id, user_id, email, full_name, role, is_owner, is_active, assigned_password)
VALUES 
(
    'mem-usr-admin-01',
    'study-space-01',
    'usr-admin-01',
    'miguelestrada@proyecto.com',
    'Miguel Estrada torrente',
    'admin',
    true,
    true,
    '123456'
),
(
    'mem-covaleda-01',
    'study-space-01',
    'usr-covaleda-01',
    'covaleda@gmail.com',
    'Covaleda',
    'editor',
    false,
    true,
    '123456'
)
ON CONFLICT (space_id, email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    is_owner = EXCLUDED.is_owner,
    is_active = EXCLUDED.is_active,
    assigned_password = EXCLUDED.assigned_password;
