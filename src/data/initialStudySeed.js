/**
 * Datos semilla iniciales para el módulo independiente de Estudio Personal (NexusPM)
 * Estos datos son exclusivos para el entorno académico y no tienen ninguna relación con SIGMA.
 */

export const INITIAL_STUDY_SPACE = {
  id: 'study-space-01',
  name: 'Espacio de Estudio e Investigación Académica',
  description: 'Entorno privado e independiente para la planificación, avances y documentación académica.',
  academic_period: 'Semestre Actual / Ciclo Profesional',
  institution: 'Facultad de Ingeniería',
};

export const INITIAL_STUDY_ACTIVITIES = [
  {
    id: 'act-std-001',
    subject: 'Arquitectura de Software y Sistemas Distribuidos',
    title: 'Estudio de Patrones de Microservicios y API Gateways',
    topic: 'Desacoplamiento, Resiliencia y Monitoreo Distribuido',
    start_date: '2026-11-01',
    end_date: '2026-11-15',
    hours: 18,
    objectives: 'Comprender el patrón Circuit Breaker, Service Mesh y balanceo de carga en entornos en la nube.',
    responsible_name: 'Estudiante Principal',
    status: 'en_desarrollo',
    progress: 65,
    priority: 'alta',
  },
  {
    id: 'act-std-002',
    subject: 'Bases de Datos Avanzadas y Seguridad',
    title: 'Modelado Relacional y Políticas RLS en PostgreSQL',
    topic: 'Row Level Security, Roles y Optimización de Consultas SQL',
    start_date: '2026-11-05',
    end_date: '2026-11-20',
    hours: 14,
    objectives: 'Implementar seguridad a nivel de fila y diseñar funciones atómicas SECURITY DEFINER.',
    responsible_name: 'Estudiante Principal',
    status: 'en_desarrollo',
    progress: 40,
    priority: 'alta',
  },
  {
    id: 'act-std-003',
    subject: 'Inteligencia Artificial y Modelos de Lenguaje',
    title: 'Revisión Bibliográfica de RAG y Embeddings Vectoriales',
    topic: 'Búsqueda Semántica e Indexación con pgvector',
    start_date: '2026-11-12',
    end_date: '2026-11-28',
    hours: 20,
    objectives: 'Elaborar marco conceptual sobre técnicas de contextualización y recuperación de información.',
    responsible_name: 'Estudiante Principal',
    status: 'pendiente',
    progress: 10,
    priority: 'media',
  },
  {
    id: 'act-std-004',
    subject: 'Metodología de la Investigación',
    title: 'Redacción del Capítulo de Estado del Arte',
    topic: 'Revisión sistemática de literatura técnica y normas APA 7ma Ed.',
    start_date: '2026-10-20',
    end_date: '2026-11-04',
    hours: 16,
    objectives: 'Sintetizar 15 artículos indexados en IEEE y ScienceDirect con sus matrices de análisis.',
    responsible_name: 'Estudiante Principal',
    status: 'completada',
    progress: 100,
    priority: 'alta',
  },
];

export const INITIAL_STUDY_ADVANCES = [
  {
    id: 'adv-std-001',
    title: 'Análisis Comparativo de Motores de Persistencia y Políticas RLS',
    purpose: 'Documentar el benchmark técnico de seguridad de datos a nivel de fila para la tesina académica.',
    scheduled_date: '2026-11-06',
    objectives: '1. Comparar latencias con y sin RLS activado.\n2. Diseñar políticas declarativas para usuarios anónimos y autenticados.\n3. Redactar conclusiones en formato Markdown.',
    tasks_checklist: [
      { id: 'chk-1', text: 'Configurar entorno de pruebas en PostgreSQL local y nube', completed: true },
      { id: 'chk-2', text: 'Medir tiempo de respuesta con 10,000 registros de prueba', completed: true },
      { id: 'chk-3', text: 'Elaborar diagrama de arquitectura de seguridad', completed: true },
      { id: 'chk-4', text: 'Redactar documento de hallazgos y lecciones aprendidas', completed: false },
    ],
    responsible_names: ['Estudiante Principal'],
    status: 'en_desarrollo',
    observations: 'Se observó que los índices en columnas involucradas en cláusulas USING reducen el impacto en un 70%.',
    results: 'Borrador del informe técnico completado al 80%. Se anexan guías en formato Markdown y PDF de soporte.',
    created_at: '2026-11-04T10:00:00Z',
    updated_at: '2026-11-05T14:30:00Z',
    attachments_count: 2,
  },
  {
    id: 'adv-std-002',
    title: 'Síntesis Bibliográfica sobre Patrones Arquitectónicos Modernos',
    purpose: 'Consolidar la literatura de microservicios vs monolitos modulares para la materia de Arquitectura.',
    scheduled_date: '2026-11-02',
    objectives: 'Analizar artículos científicos de Fowler y Newman sobre límites de contexto (Bounded Contexts).',
    tasks_checklist: [
      { id: 'chk-a', text: 'Lectura comprensiva de los 3 papers seleccionados', completed: true },
      { id: 'chk-b', text: 'Construcción de matriz comparativa de trade-offs', completed: true },
      { id: 'chk-c', text: 'Subir reporte final en PDF y Markdown a la plataforma', completed: true },
    ],
    responsible_names: ['Estudiante Principal'],
    status: 'completado',
    observations: 'La actividad concluyó exitosamente cumpliendo la rúbrica de evaluación docente.',
    results: 'Documento entregable aprobado y calificado con puntaje sobresaliente.',
    created_at: '2026-11-01T09:00:00Z',
    updated_at: '2026-11-03T18:00:00Z',
    attachments_count: 1,
  },
];

export const INITIAL_STUDY_DOCUMENTS = [
  {
    id: 'doc-std-001',
    advance_id: 'adv-std-001',
    name: 'Guia_Diseno_Políticas_RLS.md',
    size: 14200,
    type: 'text/markdown',
    extension: 'md',
    uploaded_by_name: 'Estudiante Principal',
    created_at: '2026-11-04T11:20:00Z',
    content_text: `# Guía de Diseño de Políticas Row Level Security (RLS)

## 1. Introducción
La seguridad a nivel de fila (Row Level Security) permite definir reglas de acceso declarativas directamente en el motor de base de datos PostgreSQL.

## 2. Principios Fundamentales
* **Aislamiento por Usuario**: Cada consulta evalúa la identidad de sesión activa (\`auth.uid()\`).
* **Principio de Mínimo Privilegio**: Toda tabla con RLS activo tiene denegación por defecto (\`default deny\`).
* **Políticas Granulares**: Se deben definir reglas específicas para \`SELECT\`, \`INSERT\`, \`UPDATE\` y \`DELETE\`.

\`\`\`sql
-- Ejemplo de política para lectura aislada
CREATE POLICY "Acceso exclusivo al propietario"
    ON public.study_advances FOR SELECT
    USING (created_by = auth.uid());
\`\`\`

## 3. Conclusiones y Próximos Pasos
Se recomienda siempre indexar las columnas de filtrado de políticas para maximizar el rendimiento.
`,
  },
  {
    id: 'doc-std-002',
    advance_id: 'adv-std-002',
    name: 'Reporte_Matriz_Microservicios_v1.pdf',
    size: 245000,
    type: 'application/pdf',
    extension: 'pdf',
    uploaded_by_name: 'Estudiante Principal',
    created_at: '2026-11-02T16:45:00Z',
    content_text: '',
  },
  {
    id: 'doc-std-003',
    advance_id: 'adv-std-001',
    name: 'Plan_Trabajo_Academico_Sintesis.docx',
    size: 89000,
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    extension: 'docx',
    uploaded_by_name: 'Estudiante Principal',
    created_at: '2026-11-04T14:10:00Z',
    content_text: '',
  },
];
