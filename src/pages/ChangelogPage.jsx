import React, { useState } from 'react';
import {
  History,
  Plus,
  GitCommit,
  ExternalLink,
  Search,
  CheckCircle2,
  RotateCcw,
  Calendar,
  FileCheck,
  UserCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { formatDateTime, getInitials } from '../utils/formatters';

const ENTRY_TYPE_BADGE = {
  manual: {
    label: 'Modificación de Integrante',
    badgeClass: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
  },
  asignacion: {
    label: 'Asignación Automática',
    badgeClass: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800',
  },
  cambio_estado: {
    label: 'Avance de Actividad',
    badgeClass: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  },
  finalizacion: {
    label: 'Entrega a Revisión',
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
  aprobacion: {
    label: 'Aprobación del Líder',
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
  devolucion: {
    label: 'Devolución para Ajustes',
    badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  },
  cronograma: {
    label: 'Actualización de Cronograma',
    badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  },
  repositorio: {
    label: 'Recurso / Repositorio',
    badgeClass: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200 dark:border-teal-800',
  },
};

export default function ChangelogPage() {
  const { changelog, tasks, profiles, currentUser, addManualChangelog } = useProject();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('todos');
  const [authorFilter, setAuthorFilter] = useState('todos');
  const [modalOpen, setModalOpen] = useState(false);

  const filteredEntries = changelog.filter((entry) => {
    const matchesSearch =
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (entry.author_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      typeFilter === 'todos'
        ? true
        : typeFilter === 'manuales'
        ? entry.entry_type === 'manual'
        : typeFilter === 'automaticos'
        ? entry.entry_type !== 'manual'
        : entry.entry_type === typeFilter;
    const matchesAuthor = authorFilter === 'todos' || entry.author_id === authorFilter;
    return matchesSearch && matchesType && matchesAuthor;
  });

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Novedades y Trazabilidad del Proyecto
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Registro cronológico de modificaciones por integrante, enlaces a commits/PRs, evidencias y bitácora automática de eventos.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm shadow-indigo-500/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Novedad / Cambio</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Buscar en la bitácora de novedades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium"
        >
          <option value="todos">Todos los registros ({changelog.length})</option>
          <option value="manuales">Modificaciones reportadas por integrantes</option>
          <option value="automaticos">Eventos automáticos del sistema</option>
          <option value="finalizacion">Entregas enviadas a revisión</option>
          <option value="aprobacion">Aprobaciones del Líder</option>
          <option value="cronograma">Cambios de Cronograma</option>
        </select>

        <select
          value={authorFilter}
          onChange={(e) => setAuthorFilter(e.target.value)}
          className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium"
        >
          <option value="todos">Todos los autores del equipo</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.full_name}
            </option>
          ))}
        </select>
      </div>

      {/* Línea de Tiempo Cronológica */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="relative pl-6 sm:pl-8 border-l-2 border-indigo-200 dark:border-indigo-900/70 space-y-6">
          {filteredEntries.length === 0 ? (
            <p className="text-sm text-slate-400 py-8">
              No se encontraron registros de novedades con los filtros actuales.
            </p>
          ) : (
            filteredEntries.map((entry) => {
              const typeCfg = ENTRY_TYPE_BADGE[entry.entry_type] || ENTRY_TYPE_BADGE.manual;
              const relatedTask = tasks.find((t) => t.id === entry.task_id);

              return (
                <div key={entry.id} className="relative group">
                  {/* Punto en la línea de tiempo */}
                  <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white dark:border-slate-900 shadow-xs" />

                  <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${typeCfg.badgeClass}`}
                        >
                          {typeCfg.label}
                        </span>
                        {relatedTask && (
                          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            Tarea: {relatedTask.title}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-medium text-slate-400">
                        {formatDateTime(entry.created_at)}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mt-2">
                      {entry.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {entry.description}
                    </p>

                    <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] flex items-center justify-center">
                          {getInitials(entry.author_name || 'SIS')}
                        </div>
                        <span className="text-slate-600 dark:text-slate-300">
                          Registrado por:{' '}
                          <strong className="text-slate-900 dark:text-white">
                            {entry.author_name || 'Sistema'}
                          </strong>
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        {entry.commit_or_pr_url && (
                          <a
                            href={entry.commit_or_pr_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                          >
                            <GitCommit className="w-3.5 h-3.5" />
                            <span>Commit / Pull Request</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {entry.evidence_url && entry.evidence_url !== entry.commit_or_pr_url && (
                          <a
                            href={entry.evidence_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold hover:underline"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>Ver Evidencia</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal para Registrar Nueva Novedad Manual */}
      {modalOpen && (
        <NewChangelogModal
          tasks={tasks}
          currentUser={currentUser}
          onClose={() => setModalOpen(false)}
          onSave={async (payload) => {
            await addManualChangelog(payload);
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function NewChangelogModal({ tasks, currentUser, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskId, setTaskId] = useState('');
  const [commitUrl, setCommitUrl] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        title,
        description,
        task_id: taskId || null,
        commit_or_pr_url: commitUrl,
        evidence_url: evidenceUrl,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Registrar Novedad o Modificación Realizada
            </h3>
            <p className="text-xs text-slate-500">
              Autor: <strong>{currentUser?.full_name}</strong>
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Título del Cambio / Novedad *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Refactorización de consultas RLS y paginación en tabla de tareas"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tarea Relacionada (Opcional)
            </label>
            <select
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            >
              <option value="">General del proyecto (Sin tarea específica)</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Descripción Detallada de la Modificación *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Explica los archivos modificados, funcionalidades agregadas o problemas solucionados..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Enlace al Commit, Pull Request o Repositorio
            </label>
            <input
              type="url"
              placeholder="https://github.com/organizacion/proyecto/commit/..."
              value={commitUrl}
              onChange={(e) => setCommitUrl(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Enlace a Evidencia Opcional (Captura, Despliegue, Documento)
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
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
              {saving ? 'Registrando...' : 'Publicar Novedad'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
