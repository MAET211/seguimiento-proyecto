import React, { useState, useMemo } from 'react';
import {
  CalendarRange,
  Plus,
  Edit3,
  Trash2,
  User,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  SlidersHorizontal,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import {
  TASK_STATUS_CONFIG,
  PRIORITY_CONFIG,
  formatDate,
  getInitials,
} from '../utils/formatters';

export default function WorkPlanPage() {
  const {
    workPlan,
    profiles,
    currentUser,
    isLeaderOrAdmin,
    addWorkPlanActivity,
    updateWorkPlanActivity,
    deleteWorkPlanActivity,
  } = useProject();

  const [responsibleFilter, setResponsibleFilter] = useState('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [auditBanner, setAuditBanner] = useState(null);

  const filteredActivities = useMemo(() => {
    return workPlan
      .filter((a) => responsibleFilter === 'todos' || a.responsible_id === responsibleFilter)
      .sort((a, b) => (a.start_date > b.start_date ? 1 : -1));
  }, [workPlan, responsibleFilter]);

  // Cálculo del rango temporal total para renderizar el Diagrama de Gantt proporcionalmente
  const ganttTimeline = useMemo(() => {
    if (filteredActivities.length === 0) {
      const now = new Date();
      return { minTime: now.getTime(), maxTime: now.getTime() + 86400000 * 30, totalDays: 30, ticks: [] };
    }

    const startTimestamps = filteredActivities.map((a) => new Date(a.start_date).getTime());
    const endTimestamps = filteredActivities.map((a) => new Date(a.end_date).getTime());

    const minRaw = Math.min(...startTimestamps);
    const maxRaw = Math.max(...endTimestamps);

    // Margen de 3 días antes y 4 días después
    const minTime = minRaw - 3 * 86400000;
    const maxTime = Math.max(maxRaw + 4 * 86400000, minTime + 14 * 86400000);
    const totalMs = maxTime - minTime;
    const totalDays = Math.max(1, Math.round(totalMs / 86400000));

    // Generar 7 marcas de fecha uniformes para la cabecera del Gantt
    const ticks = [];
    for (let i = 0; i <= 6; i++) {
      const t = minTime + (totalMs * i) / 6;
      const d = new Date(t).toISOString().split('T')[0];
      ticks.push({ pct: (i / 6) * 100, label: formatDate(d) });
    }

    const todayMs = new Date().getTime();
    const todayPct =
      todayMs >= minTime && todayMs <= maxTime
        ? ((todayMs - minTime) / totalMs) * 100
        : null;

    return { minTime, maxTime, totalMs, totalDays, ticks, todayPct };
  }, [filteredActivities]);

  return (
    <div className="space-y-6">
      {/* Banner de Auditoría Oficial de Notificaciones por Correo */}
      {auditBanner && (
        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-100 flex items-start justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5 shadow-xs">
              <Mail className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-600/20 text-emerald-800 dark:text-emerald-300">
                  Auditoría Oficial Emitida
                </span>
                <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                  Ref: {auditBanner.code}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Actividad incorporada al Plan de Trabajo: "{auditBanner.name}"
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Se notificó formalmente al correo de cada usuario ({auditBanner.count} integrantes activos) con la auditoría de la plataforma <strong>SIGMA - Sistema de Gestión de Ambulancias</strong> y la firma de la autoridad (Líder del Proyecto).
              </p>
            </div>
          </div>
          <button
            onClick={() => setAuditBanner(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-emerald-500/10 transition-colors"
            title="Cerrar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Cabecera del Módulo */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Plan de Trabajo y Cronograma Interactivo (Gantt)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Planificación de fases, fechas de inicio y finalización, responsables y progreso porcentual en línea de tiempo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={responsibleFilter}
            onChange={(e) => setResponsibleFilter(e.target.value)}
            className="px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium"
          >
            <option value="todos">Todos los responsables</option>
            {profiles
              .filter((p) => p.is_active)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name}
                </option>
              ))}
          </select>

          {isLeaderOrAdmin && (
            <button
              type="button"
              onClick={() => {
                setEditingActivity(null);
                setModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm shadow-indigo-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Actividad en Plan</span>
            </button>
          )}
        </div>
      </div>

      {/* Diagrama de Gantt Visual Interactivo */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <CalendarRange className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Cronograma Visual — Diagrama de Gantt
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Visualización de actividades por rango de fechas, responsable y porcentaje de avance ({ganttTimeline.totalDays} días proyectados)
              </p>
            </div>
          </div>

          {/* Leyenda de colores de estado */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Completada
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              En proceso
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              Pendiente
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-0.5 h-3.5 bg-rose-500 inline-block" />
              Día Actual (Hoy)
            </span>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <div className="min-w-[780px]">
            {/* Escala superior de fechas */}
            <div className="grid grid-cols-12 pb-3 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400">
              <div className="col-span-4 pr-4 uppercase tracking-wider">
                Fase / Actividad y Responsable
              </div>
              <div className="col-span-8 relative h-5">
                {ganttTimeline.ticks.map((tick, idx) => (
                  <span
                    key={idx}
                    style={{ left: `${tick.pct}%` }}
                    className="absolute -translate-x-1/2 whitespace-nowrap"
                  >
                    {tick.label}
                  </span>
                ))}
              </div>
            </div>

            {/* Filas de barras del Gantt */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80 relative">
              {filteredActivities.map((act) => {
                const resp = profiles.find((p) => p.id === act.responsible_id);
                const startMs = new Date(act.start_date).getTime();
                const endMs = Math.max(startMs + 86400000, new Date(act.end_date).getTime());

                const leftPct = Math.max(
                  0,
                  Math.min(95, ((startMs - ganttTimeline.minTime) / ganttTimeline.totalMs) * 100)
                );
                const widthPct = Math.max(
                  4,
                  Math.min(100 - leftPct, ((endMs - startMs) / ganttTimeline.totalMs) * 100)
                );

                const barColor =
                  act.status === 'completada'
                    ? 'bg-emerald-500'
                    : act.status === 'en_proceso'
                    ? 'bg-sky-500'
                    : act.status === 'retrasada'
                    ? 'bg-rose-500'
                    : 'bg-indigo-500';

                return (
                  <div
                    key={act.id}
                    className="grid grid-cols-12 items-center py-3.5 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="col-span-4 pr-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                        {act.phase}
                      </span>
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {act.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <span>{resp?.full_name || 'Equipo'}</span>
                        <span>•</span>
                        <span>
                          {formatDate(act.start_date)} - {formatDate(act.end_date)}
                        </span>
                      </div>
                    </div>

                    {/* Carril de tiempo de la actividad */}
                    <div className="col-span-8 relative h-9 bg-slate-100/80 dark:bg-slate-800/50 rounded-xl flex items-center px-1 overflow-hidden">
                      {/* Línea vertical indicadora del día actual */}
                      {ganttTimeline.todayPct !== null && (
                        <div
                          style={{ left: `${ganttTimeline.todayPct}%` }}
                          className="absolute top-0 bottom-0 w-0.5 bg-rose-500/80 z-10 pointer-events-none"
                          title="Fecha actual"
                        />
                      )}

                      {/* Barra del Gantt */}
                      <div
                        style={{
                          left: `${leftPct}%`,
                          width: `${widthPct}%`,
                        }}
                        onClick={() => {
                          if (isLeaderOrAdmin) {
                            setEditingActivity(act);
                            setModalOpen(true);
                          }
                        }}
                        className={`absolute h-6 rounded-lg shadow-xs ${barColor} text-white text-[11px] font-bold flex items-center justify-between px-2.5 overflow-hidden ${
                          isLeaderOrAdmin ? 'cursor-pointer hover:brightness-110' : ''
                        }`}
                        title={`${act.name} (${act.progress}%) — ${formatDate(act.start_date)} al ${formatDate(act.end_date)}`}
                      >
                        <span className="truncate">{act.name}</span>
                        <span className="ml-1.5 shrink-0">{act.progress}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tabla detallada de Actividades del Plan de Trabajo */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Matriz Detallada del Plan de Trabajo
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 pr-4">Fase y Actividad</th>
                <th className="py-3 px-4">Responsable</th>
                <th className="py-3 px-4">Inicio / Finalización</th>
                <th className="py-3 px-4">Prioridad</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Progreso</th>
                {isLeaderOrAdmin && <th className="py-3 pl-4 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {filteredActivities.map((act) => {
                const resp = profiles.find((p) => p.id === act.responsible_id);
                const statusCfg = TASK_STATUS_CONFIG[act.status] || TASK_STATUS_CONFIG.pendiente;
                const prioCfg = PRIORITY_CONFIG[act.priority] || PRIORITY_CONFIG.media;

                return (
                  <tr key={act.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                    <td className="py-4 pr-4 max-w-xs">
                      <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400">
                        {act.phase}
                      </span>
                      <p className="font-bold text-slate-900 dark:text-white mt-0.5">{act.name}</p>
                      {act.description && (
                        <p className="text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                          {act.description}
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {getInitials(resp?.full_name || 'EQ')}
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {resp?.full_name || 'Por asignar'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 whitespace-nowrap">
                      <p className="font-medium text-slate-700 dark:text-slate-300">
                        Inicio: {formatDate(act.start_date)}
                      </p>
                      <p className="font-semibold text-slate-900 dark:text-white mt-0.5">
                        Fin: {formatDate(act.end_date)}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border ${prioCfg.badgeClass}`}
                      >
                        {prioCfg.label}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusCfg.badgeClass}`}
                      >
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="py-4 px-4 w-36">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${statusCfg.barClass}`}
                            style={{ width: `${act.progress}%` }}
                          />
                        </div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 w-8 text-right">
                          {act.progress}%
                        </span>
                      </div>
                    </td>
                    {isLeaderOrAdmin && (
                      <td className="py-4 pl-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingActivity(act);
                            setModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 mr-1"
                          title="Editar o reprogramar actividad"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`¿Eliminar la actividad "${act.name}" del Plan de Trabajo?`)) {
                              deleteWorkPlanActivity(act.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Eliminar actividad"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Crear / Editar / Reprogramar Actividad del Plan de Trabajo */}
      {modalOpen && (
        <WorkPlanModal
          initialActivity={editingActivity}
          onClose={() => {
            setModalOpen(false);
            setEditingActivity(null);
          }}
          onSave={async (payload) => {
            if (editingActivity) {
              await updateWorkPlanActivity(editingActivity.id, payload);
            } else {
              const res = await addWorkPlanActivity(payload);
              setAuditBanner({
                name: payload.name,
                code: res?.auditCode || 'SIGMA-AUDIT-WP',
                count: res?.recipientCount || profiles.filter((p) => p.is_active).length,
              });
            }
            setModalOpen(false);
            setEditingActivity(null);
          }}
        />
      )}
    </div>
  );
}

function WorkPlanModal({ initialActivity, onClose, onSave }) {
  const { profiles } = useProject();
  const today = new Date().toISOString().split('T')[0];

  const [phase, setPhase] = useState(initialActivity?.phase || 'Fase 3: Desarrollo de Módulos Frontend');
  const [name, setName] = useState(initialActivity?.name || '');
  const [description, setDescription] = useState(initialActivity?.description || '');
  const [responsibleId, setResponsibleId] = useState(
    initialActivity?.responsible_id || profiles[2]?.id || ''
  );
  const [startDate, setStartDate] = useState(initialActivity?.start_date || today);
  const [endDate, setEndDate] = useState(initialActivity?.end_date || today);
  const [priority, setPriority] = useState(initialActivity?.priority || 'alta');
  const [status, setStatus] = useState(initialActivity?.status || 'en_proceso');
  const [progress, setProgress] = useState(initialActivity?.progress ?? 0);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        phase,
        name,
        description,
        responsible_id: responsibleId,
        start_date: startDate,
        end_date: endDate,
        priority,
        status: Number(progress) === 100 ? 'completada' : status,
        progress: Number(progress),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {initialActivity ? 'Editar / Reprogramar Actividad del Plan' : 'Nueva Actividad en el Plan de Trabajo'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Fase o Etapa del Proyecto *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Fase 3: Desarrollo e Integración"
              value={phase}
              onChange={(e) => setPhase(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nombre de la Actividad *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Pruebas de carga y seguridad RLS"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Descripción
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Responsable Principal *
              </label>
              <select
                value={responsibleId}
                onChange={(e) => setResponsibleId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              >
                {profiles
                  .filter((p) => p.is_active)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Prioridad
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="critica">Crítica</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Fecha de Inicio *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Fecha de Finalización *
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Estado
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              >
                <option value="pendiente">Pendiente</option>
                <option value="en_proceso">En proceso</option>
                <option value="completada">Completada</option>
                <option value="retrasada">Retrasada</option>
              </select>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Progreso</span>
                <span className="text-indigo-600 font-bold">{progress}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
                className="w-full accent-indigo-600"
              />
            </div>
          </div>

          {/* Notificación de Auditoría Automática */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-[11px] text-slate-600 dark:text-slate-300 flex items-start gap-2">
            <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <span>
              <strong>Notificación de Auditoría Automática:</strong> Al guardar, se enviará una notificación formal al correo de cada usuario activo con la auditoría oficial de la plataforma SIGMA y firma del Líder del Proyecto.
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {saving ? 'Guardando y Notificando...' : 'Guardar y Notificar al Equipo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
