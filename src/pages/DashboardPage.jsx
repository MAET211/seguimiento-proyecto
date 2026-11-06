import React from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ListTodo,
  TrendingUp,
  Calendar,
  Users,
  GitCommit,
  ArrowUpRight,
  Award,
  Layers,
  Eye,
  FolderGit2,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import {
  ROLE_CONFIG,
  TASK_STATUS_CONFIG,
  PRIORITY_CONFIG,
  formatDate,
  formatDateTime,
  getInitials,
} from '../utils/formatters';

export default function DashboardPage() {
  const {
    project,
    profiles,
    projectMembers,
    tasks,
    changelog,
    metrics,
    currentUser,
  } = useProject();

  const leaderProfile =
    profiles.find((p) => p.id === project?.leader_id) ||
    profiles.find((p) => p.role === 'admin') ||
    profiles.find((p) => p.role === 'lider') ||
    profiles.find((p) => p.email?.toLowerCase() === 'miguelestrada@proyecto.com');

  // Próximas fechas de entrega (tareas no completadas ordenadas por due_date ascendente)
  const upcomingDeliverables = [...tasks]
    .filter((t) => t.status !== 'completada')
    .sort((a, b) => (a.due_date > b.due_date ? 1 : -1))
    .slice(0, 5);

  // Últimas novedades registradas
  const recentChangelog = changelog.slice(0, 5);

  // Resumen de actividad y carga por integrante del equipo
  const teamActivitySummary = profiles
    .filter((p) => p.is_active)
    .map((member) => {
      const assigned = tasks.filter((t) => t.assignee_ids?.includes(member.id));
      const completed = assigned.filter((t) => t.status === 'completada').length;
      const inReview = assigned.filter((t) => t.status === 'en_revision').length;
      const memberMeta = projectMembers.find((m) => m.user_id === member.id);
      const avgProgress =
        assigned.length > 0
          ? Math.round(
              assigned.reduce(
                (acc, t) => acc + (t.status === 'completada' ? 100 : Number(t.progress || 0)),
                0
              ) / assigned.length
            )
          : 100;

      return {
        ...member,
        project_role: memberMeta?.project_role || member.specialty,
        responsibilities: memberMeta?.responsibilities || 'Integrante activo del proyecto',
        totalAssigned: assigned.length,
        completed,
        inReview,
        avgProgress,
      };
    });

  return (
    <div className="space-y-6">
      {/* Cabecera Principal del Proyecto */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {project?.code || 'PRJ-001'}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                En Ejecución Activa
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Metodología: <strong className="text-slate-700 dark:text-slate-200">{project?.methodology}</strong>
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                • Versión: <strong className="text-slate-700 dark:text-slate-200">{project?.version}</strong>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {project?.name}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {project?.description}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Líder del Proyecto:{' '}
                <strong className="text-slate-900 dark:text-white">
                  {leaderProfile?.full_name || 'Miguel Estrada torrente'}
                </strong>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Periodo: <strong>{formatDate(project?.start_date)}</strong> al{' '}
                <strong>{formatDate(project?.end_date)}</strong>
              </span>
              {project?.repository_main_url && (
                <a
                  href={project.repository_main_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <FolderGit2 className="w-4 h-4" />
                  Repositorio Principal
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>

          {/* Tarjeta circular / destacada de porcentaje de avance */}
          <div className="lg:w-72 shrink-0 p-5 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-md shadow-indigo-500/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-100">
                Porcentaje de Avance
              </span>
              <TrendingUp className="w-5 h-5 text-indigo-200" />
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-4xl font-extrabold">{metrics.overallProgress}%</span>
              <span className="text-xs text-indigo-100">
                {metrics.completedTasks} de {metrics.totalTasks} completadas
              </span>
            </div>
            <div className="mt-3 w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${metrics.overallProgress}%` }}
              />
            </div>
            <p className="mt-2.5 text-[11px] text-indigo-100/90">
              Calculado dinámicamente a partir del estado y progreso real de las actividades.
            </p>
          </div>
        </div>
      </div>

      {/* Tarjetas de Indicadores Clave de Actividades */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Total Actividades"
          value={metrics.totalTasks}
          subtitle="Registradas en el proyecto"
          icon={Layers}
          colorClass="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800/70"
        />
        <MetricCard
          title="Pendientes"
          value={metrics.pendingTasks}
          subtitle="Por iniciar ejecución"
          icon={ListTodo}
          colorClass="text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700"
        />
        <MetricCard
          title="En Proceso"
          value={metrics.inProgressTasks}
          subtitle="En desarrollo activo"
          icon={Clock}
          colorClass="text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-800/70"
        />
        <MetricCard
          title="En Revisión"
          value={metrics.inReviewTasks}
          subtitle="Esperando aval del líder"
          icon={Eye}
          colorClass="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800/70"
        />
        <MetricCard
          title="Completadas"
          value={metrics.completedTasks}
          subtitle="Aprobadas por el líder"
          icon={CheckCircle2}
          colorClass="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/70"
        />
        <MetricCard
          title="Vencidas"
          value={metrics.overdueTasks}
          subtitle="Fecha límite superada"
          icon={AlertTriangle}
          colorClass="text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800/70"
        />
      </div>

      {/* Grilla central: Próximas Fechas de Entrega + Últimas Novedades Registradas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximas Fechas de Entrega */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Próximas Fechas de Entrega
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Actividades activas ordenadas por fecha límite
                  </p>
                </div>
              </div>
              <Link
                to="/tareas"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                Ver todas
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {upcomingDeliverables.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  ¡Todas las tareas están completadas!
                </p>
              ) : (
                upcomingDeliverables.map((task) => {
                  const isOverdue = task.due_date < metrics.todayStr;
                  const statusCfg = TASK_STATUS_CONFIG[task.status];
                  const prioCfg = PRIORITY_CONFIG[task.priority];
                  const assignees = profiles.filter((p) => task.assignee_ids?.includes(p.id));

                  return (
                    <div
                      key={task.id}
                      className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to="/tareas"
                          className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400"
                        >
                          {task.title}
                        </Link>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border shrink-0 ${statusCfg?.badgeClass}`}
                        >
                          {statusCfg?.label}
                        </span>
                      </div>

                      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${prioCfg?.badgeClass}`}
                          >
                            {prioCfg?.label}
                          </span>
                          <span className="text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                            {assignees.map((a) => a.full_name.split(' ')[0]).join(', ')}
                          </span>
                        </div>

                        <span
                          className={`font-semibold text-xs ${
                            isOverdue
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {isOverdue ? 'Vencida: ' : 'Entrega: '}
                          {formatDate(task.due_date)}
                        </span>
                      </div>

                      <div className="mt-2 w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${statusCfg?.barClass || 'bg-indigo-500'}`}
                          style={{ width: `${task.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Últimas Novedades Registradas */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <GitCommit className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Últimas Novedades Registradas
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Bitácora cronológica de cambios, entregas y eventos
                  </p>
                </div>
              </div>
              <Link
                to="/novedades"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                Bitácora completa
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {recentChangelog.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {entry.title}
                    </span>
                    <span className="text-[11px] text-slate-400 shrink-0">
                      {formatDateTime(entry.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                    {entry.description}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>
                      Autor: <strong className="text-slate-700 dark:text-slate-200">{entry.author_name}</strong>
                    </span>
                    {entry.commit_or_pr_url && (
                      <a
                        href={entry.commit_or_pr_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                      >
                        Ver Commit / PR
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Líder, Integrantes y Resumen de Actividad Reciente del Equipo */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Líder, Integrantes y Resumen de Actividad del Equipo
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Responsabilidades específicas y rendimiento actual por integrante
              </p>
            </div>
          </div>
          <Link
            to="/administracion"
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Gestionar integrantes y roles →
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 pr-4">Integrante</th>
                <th className="py-3 px-4">Rol del Sistema</th>
                <th className="py-3 px-4">Responsabilidad Específica</th>
                <th className="py-3 px-4 text-center">Tareas Asignadas</th>
                <th className="py-3 px-4 text-center">Completadas</th>
                <th className="py-3 pl-4">Avance Individual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {teamActivitySummary.map((m) => {
                const roleCfg = ROLE_CONFIG[m.role];
                const isMe = m.id === currentUser?.id;
                return (
                  <tr
                    key={m.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 ${
                      isMe ? 'bg-indigo-50/30 dark:bg-indigo-950/20' : ''
                    }`}
                  >
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0">
                          {getInitials(m.full_name)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            {m.full_name}
                            {isMe && (
                              <span className="px-1.5 py-0.2 rounded-md text-[10px] bg-indigo-600 text-white">
                                Tú
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {m.project_role}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${roleCfg?.badgeClass}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${roleCfg?.dotClass}`} />
                        {roleCfg?.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs text-slate-600 dark:text-slate-300">
                      {m.responsibilities}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-800 dark:text-slate-200">
                      {m.totalAssigned}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {m.completed}
                      </span>
                      {m.inReview > 0 && (
                        <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-semibold">
                          +{m.inReview} rev.
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 pl-4 w-44">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full"
                            style={{ width: `${m.avgProgress}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-700 dark:text-slate-200 w-9 text-right">
                          {m.avgProgress}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle, icon: Icon, colorClass }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{title}</span>
        <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${colorClass}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-3">
        <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{value}</span>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">{subtitle}</p>
      </div>
    </div>
  );
}
