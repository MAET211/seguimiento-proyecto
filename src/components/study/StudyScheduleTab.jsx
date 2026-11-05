import React, { useState, useMemo } from 'react';
import {
  CalendarRange,
  Plus,
  Edit3,
  Trash2,
  BookOpen,
  Clock,
  CheckCircle2,
  Sparkles,
  X,
  Target,
  SlidersHorizontal,
} from 'lucide-react';
import { usePersonalStudy } from '../../context/PersonalStudyContext';

export default function StudyScheduleTab() {
  const {
    activities,
    canEditStudy,
    addStudyActivity,
    updateStudyActivity,
    deleteStudyActivity,
  } = usePersonalStudy();

  const [subjectFilter, setSubjectFilter] = useState('todas');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  const subjects = useMemo(() => {
    return Array.from(new Set(activities.map((a) => a.subject).filter(Boolean)));
  }, [activities]);

  const filteredActivities = useMemo(() => {
    return activities
      .filter((a) => subjectFilter === 'todas' || a.subject === subjectFilter)
      .sort((a, b) => (a.start_date > b.start_date ? 1 : -1));
  }, [activities, subjectFilter]);

  // Cálculo proporcional de la línea de tiempo para el Diagrama de Gantt Académico
  const ganttTimeline = useMemo(() => {
    if (filteredActivities.length === 0) {
      const now = new Date();
      return { minTime: now.getTime(), maxTime: now.getTime() + 86400000 * 30, totalDays: 30, ticks: [] };
    }

    const startTimestamps = filteredActivities.map((a) => new Date(a.start_date).getTime());
    const endTimestamps = filteredActivities.map((a) => new Date(a.end_date).getTime());

    const minRaw = Math.min(...startTimestamps);
    const maxRaw = Math.max(...endTimestamps);

    const minTime = minRaw - 2 * 86400000;
    const maxTime = Math.max(maxRaw + 3 * 86400000, minTime + 14 * 86400000);
    const totalMs = maxTime - minTime;
    const totalDays = Math.max(1, Math.round(totalMs / 86400000));

    const ticks = [];
    for (let i = 0; i <= 6; i++) {
      const t = minTime + (totalMs * i) / 6;
      const d = new Date(t).toISOString().split('T')[0];
      ticks.push({ pct: (i / 6) * 100, label: d });
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
      {/* Cabecera del Cronograma Académico */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              Cronograma Académico Independiente
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Cronograma y Planificación de Estudio
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Organización de materias, temas, fechas, horas de dedicación y objetivos de aprendizaje en Gantt.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium"
          >
            <option value="todas">Todas las Materias / Ejes</option>
            {subjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>

          {canEditStudy && (
            <button
              onClick={() => {
                setEditingActivity(null);
                setModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Sesión / Actividad</span>
            </button>
          )}
        </div>
      </div>

      {/* Visualización Gantt */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <CalendarRange className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Diagrama de Gantt Académico
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Visualización temporal de materias y progreso ({ganttTimeline.totalDays} días proyectados)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              Completada
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              En desarrollo
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              Pendiente
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-0.5 h-3.5 bg-rose-500 inline-block" />
              Hoy
            </span>
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <div className="min-w-[760px]">
            {/* Fechas superiores */}
            <div className="grid grid-cols-12 pb-3 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400">
              <div className="col-span-4 pr-4 uppercase tracking-wider">
                Materia / Actividad Académica
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

            {/* Filas */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800 relative">
              {filteredActivities.map((act) => {
                const startMs = new Date(act.start_date).getTime();
                const endMs = Math.max(startMs + 86400000, new Date(act.end_date).getTime());

                const leftPct = Math.max(
                  0,
                  Math.min(95, ((startMs - ganttTimeline.minTime) / ganttTimeline.totalMs) * 100)
                );
                const widthPct = Math.max(
                  5,
                  Math.min(100 - leftPct, ((endMs - startMs) / ganttTimeline.totalMs) * 100)
                );

                const barColor =
                  act.status === 'completada'
                    ? 'bg-emerald-500'
                    : act.status === 'en_desarrollo'
                    ? 'bg-sky-500'
                    : 'bg-amber-500';

                return (
                  <div
                    key={act.id}
                    className="grid grid-cols-12 items-center py-3.5 hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="col-span-4 pr-4">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block truncate">
                        {act.subject}
                      </span>
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {act.title}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {act.start_date} al {act.end_date} • {act.hours} hrs
                      </p>
                    </div>

                    <div className="col-span-8 relative h-9 bg-slate-100/80 dark:bg-slate-800/50 rounded-xl flex items-center px-1 overflow-hidden">
                      {ganttTimeline.todayPct !== null && (
                        <div
                          style={{ left: `${ganttTimeline.todayPct}%` }}
                          className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-10 pointer-events-none"
                          title="Fecha actual"
                        />
                      )}

                      <div
                        style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                        onClick={() => {
                          if (canEditStudy) {
                            setEditingActivity(act);
                            setModalOpen(true);
                          }
                        }}
                        className={`absolute h-6 rounded-lg ${barColor} text-white text-[11px] font-bold flex items-center justify-between px-2.5 overflow-hidden shadow-xs ${
                          canEditStudy ? 'cursor-pointer hover:brightness-110' : ''
                        }`}
                        title={`${act.title} (${act.progress}%)`}
                      >
                        <span className="truncate">{act.title}</span>
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

      {/* Tabla Detallada de Actividades del Cronograma */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Matriz de Actividades y Sesiones de Aprendizaje
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 pr-4">Materia y Actividad</th>
                <th className="py-3 px-4">Objetivos</th>
                <th className="py-3 px-4">Fechas y Horas</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Progreso</th>
                {canEditStudy && <th className="py-3 pl-4 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredActivities.map((act) => (
                <tr key={act.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                  <td className="py-3.5 pr-4 max-w-xs">
                    <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400">
                      {act.subject}
                    </span>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">{act.title}</p>
                    {act.topic && <p className="text-slate-500 text-[11px] mt-0.5">{act.topic}</p>}
                  </td>
                  <td className="py-3.5 px-4 max-w-sm">
                    <p className="text-slate-600 dark:text-slate-300 line-clamp-2">
                      {act.objectives || 'Sin objetivos especificados'}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <p className="text-slate-700 dark:text-slate-300">
                      {act.start_date} al {act.end_date}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                      {act.hours} horas estimadas
                    </p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        act.status === 'completada'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : act.status === 'en_desarrollo'
                          ? 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950/60 dark:text-sky-300'
                          : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {act.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 w-32">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            act.status === 'completada' ? 'bg-emerald-500' : 'bg-indigo-600'
                          }`}
                          style={{ width: `${act.progress}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px]">
                        {act.progress}%
                      </span>
                    </div>
                  </td>
                  {canEditStudy && (
                    <td className="py-3.5 pl-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setEditingActivity(act);
                          setModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 mr-1"
                        title="Editar actividad"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`¿Eliminar la actividad "${act.title}" del cronograma?`)) {
                            deleteStudyActivity(act.id);
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Crear / Editar Actividad del Cronograma */}
      {modalOpen && (
        <StudyActivityModal
          initialData={editingActivity}
          onClose={() => {
            setModalOpen(false);
            setEditingActivity(null);
          }}
          onSave={async (payload) => {
            if (editingActivity) {
              await updateStudyActivity(editingActivity.id, payload);
            } else {
              await addStudyActivity(payload);
            }
            setModalOpen(false);
            setEditingActivity(null);
          }}
        />
      )}
    </div>
  );
}

function StudyActivityModal({ initialData, onClose, onSave }) {
  const today = new Date().toISOString().split('T')[0];

  const [subject, setSubject] = useState(initialData?.subject || '');
  const [title, setTitle] = useState(initialData?.title || '');
  const [topic, setTopic] = useState(initialData?.topic || '');
  const [startDate, setStartDate] = useState(initialData?.start_date || today);
  const [endDate, setEndDate] = useState(initialData?.end_date || today);
  const [hours, setHours] = useState(initialData?.hours || 4);
  const [objectives, setObjectives] = useState(initialData?.objectives || '');
  const [priority, setPriority] = useState(initialData?.priority || 'alta');
  const [status, setStatus] = useState(initialData?.status || 'pendiente');
  const [progress, setProgress] = useState(initialData?.progress ?? 0);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        subject,
        title,
        topic,
        start_date: startDate,
        end_date: endDate,
        hours: Number(hours),
        objectives,
        priority,
        status: Number(progress) === 100 ? 'completada' : status,
        progress: Number(progress),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {initialData ? 'Editar Actividad Académica' : 'Nueva Actividad en el Cronograma'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 mt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Materia / Eje Temático *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Arquitectura de Software / Inteligencia Artificial"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Título de la Actividad *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Análisis de Microservicios y Balanceo de Carga"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tema / Unidad Específica
            </label>
            <input
              type="text"
              placeholder="Ej: Patrón Circuit Breaker y Service Mesh"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Objetivos de Aprendizaje
            </label>
            <textarea
              rows={2}
              placeholder="¿Qué conceptos o competencias se desarrollarán?"
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Inicio *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Fin *
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Horas Est.
              </label>
              <input
                type="number"
                min="1"
                max="200"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
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
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-medium"
              >
                <option value="pendiente">Pendiente</option>
                <option value="en_desarrollo">En desarrollo</option>
                <option value="completada">Completada</option>
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

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
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
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {saving ? 'Guardando...' : 'Guardar Actividad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
