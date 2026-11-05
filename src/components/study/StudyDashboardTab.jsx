import React from 'react';
import {
  GraduationCap,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Users,
  BookOpen,
  ArrowRight,
  Download,
  Sparkles,
  TrendingUp,
  BookmarkCheck,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { usePersonalStudy } from '../../context/PersonalStudyContext';

export default function StudyDashboardTab({ onNavigateTab }) {
  const {
    activeSpace,
    metrics,
    myStudyRole,
    isStudyOwner,
    downloadStudyDocument,
  } = usePersonalStudy();

  const getPriorityBadge = (prio) => {
    switch (prio) {
      case 'urgente':
      case 'alta':
        return 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'media':
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completada':
      case 'completado':
        return {
          label: 'Completada',
          className:
            'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        };
      case 'en_desarrollo':
        return {
          label: 'En desarrollo',
          className:
            'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-800',
        };
      default:
        return {
          label: 'Pendiente',
          className:
            'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Principal de Bienvenida al Entorno Académico */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-700/50">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
          <GraduationCap className="w-72 h-72 text-white" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 backdrop-blur-md">
              <ShieldCheck className="w-3.5 h-3.5" />
              Espacio Privado e Independiente
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-white/10 text-slate-200">
              Rol: {isStudyOwner ? 'Propietario / Administrador' : myStudyRole?.toUpperCase()}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Panel de Estudio — {activeSpace.name}
          </h1>
          <p className="text-sm text-indigo-100/90 leading-relaxed">
            {activeSpace.description}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-indigo-200">
            <span className="flex items-center gap-1.5 font-medium">
              <BookOpen className="w-4 h-4 text-indigo-300" />
              {activeSpace.academic_period || 'Ciclo Académico'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-4 h-4 text-indigo-300" />
              {metrics.completedStudyHours} de {metrics.totalStudyHours} horas de estudio completadas
            </span>
          </div>
        </div>
      </div>

      {/* 1. Tarjetas Estadísticas de Métricas Principales */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Progreso General */}
        <div className="col-span-2 sm:col-span-1 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">
                Progreso General
              </span>
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {metrics.overallProgress}%
            </p>
          </div>
          <div className="mt-3">
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${metrics.overallProgress}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
              Cumplimiento de objetivos
            </p>
          </div>
        </div>

        {/* Total Actividades */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Total Actividades
            </span>
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {metrics.totalActivities}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Sesiones programadas
            </p>
          </div>
        </div>

        {/* Pendientes */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Pendientes
            </span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {metrics.pendingCount}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Por iniciar
            </p>
          </div>
        </div>

        {/* En Desarrollo */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              En Desarrollo
            </span>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-sky-600 dark:text-sky-400">
              {metrics.inProgressCount}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              En curso activo
            </p>
          </div>
        </div>

        {/* Completadas */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Completadas
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {metrics.completedCount}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Metas alcanzadas
            </p>
          </div>
        </div>
      </div>

      {/* 2. Sección Principal Dividida: Próximas Fechas + Cronograma Resumido */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximas Fechas / Compromisos Próximos */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Próximas Fechas y Compromisos
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Actividades académicas con fecha límite cercana
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('cronograma')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>Ver cronograma</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {metrics.upcomingDeadlines.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No hay actividades pendientes con fecha límite próxima.
              </div>
            ) : (
              <div className="space-y-3">
                {metrics.upcomingDeadlines.map((act) => {
                  const statusInfo = getStatusBadge(act.status);
                  const isClose = act.end_date <= metrics.todayStr;

                  return (
                    <div
                      key={act.id}
                      className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block truncate">
                          {act.subject}
                        </span>
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {act.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className={isClose ? 'text-rose-600 font-bold' : ''}>
                            Límite: {act.end_date}
                          </span>
                          <span>•</span>
                          <span>{act.hours} hrs estimadas</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${getPriorityBadge(
                            act.priority
                          )}`}
                        >
                          {act.priority}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusInfo.className}`}
                        >
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Cronograma Resumido */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <BookmarkCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Cronograma Resumido de Estudio
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Planificación y avance de sesiones académicas
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('cronograma')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <span>Gantt completo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {metrics.summarySchedule.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No hay sesiones registradas en el cronograma académico.
              </div>
            ) : (
              <div className="space-y-3.5">
                {metrics.summarySchedule.map((item) => (
                  <div key={item.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="truncate pr-2">
                        <p className="font-bold text-slate-900 dark:text-white truncate">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {item.subject} • {item.start_date} al {item.end_date}
                        </p>
                      </div>
                      <span className="font-extrabold text-indigo-600 dark:text-indigo-400 shrink-0">
                        {item.progress}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          item.status === 'completada'
                            ? 'bg-emerald-500'
                            : item.status === 'en_desarrollo'
                            ? 'bg-sky-500'
                            : 'bg-amber-400'
                        }`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Sección Inferior: Últimos Avances + Documentos Recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Últimos Avances Registrados (2 columnas) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Últimos Avances Documentados
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Bitácora de actividades desarrolladas, objetivos y resultados
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('avances')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {metrics.recentAdvances.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Aún no se han documentado avances académicos en este espacio.
            </div>
          ) : (
            <div className="space-y-4">
              {metrics.recentAdvances.map((adv) => {
                const completedTasks = (adv.tasks_checklist || []).filter(
                  (t) => t.completed
                ).length;
                const totalTasks = (adv.tasks_checklist || []).length;

                return (
                  <div
                    key={adv.id}
                    className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {adv.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Fecha programada: {adv.scheduled_date} • Responsable:{' '}
                          {adv.responsible_names?.join(', ') || 'Equipo'}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                          getStatusBadge(adv.status).className
                        }`}
                      >
                        {getStatusBadge(adv.status).label}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {adv.purpose || adv.objectives}
                    </p>

                    {adv.results && (
                      <div className="p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/40 text-[11px] text-emerald-900 dark:text-emerald-200">
                        <strong>Resultado obtenido:</strong> {adv.results}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span>
                        Tareas completadas: {completedTasks}/{totalTasks}
                      </span>
                      <span>{adv.attachments_count || 0} archivos adjuntos</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Documentos Recientes y Participantes (1 columna) */}
        <div className="space-y-6">
          {/* Documentos Recientes */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Documentos Recientes
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('documentos')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Ver todos
              </button>
            </div>

            {metrics.recentDocuments.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                No hay archivos adjuntos aún.
              </div>
            ) : (
              <div className="space-y-2">
                {metrics.recentDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <div className="min-w-0 flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                        {doc.extension}
                      </span>
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                        {doc.name}
                      </p>
                    </div>
                    <button
                      onClick={() => downloadStudyDocument(doc)}
                      className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                      title="Descargar archivo"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Participantes Autorizados */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Colaboradores Autorizados
                </h3>
              </div>
              <button
                onClick={() => onNavigateTab('colaboradores')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Gestionar
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 dark:text-white truncate">
                    {activeSpace.owner_name}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {activeSpace.owner_email}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                  Propietario
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
