import React, { useState } from 'react';
import {
  Award,
  Plus,
  Edit3,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  CheckSquare,
  Square,
  Paperclip,
  FileText,
  X,
  Download,
  Upload,
} from 'lucide-react';
import { usePersonalStudy } from '../../context/PersonalStudyContext';

export default function StudyAdvancesTab() {
  const {
    advances,
    documents,
    canEditStudy,
    addStudyAdvance,
    updateStudyAdvance,
    deleteStudyAdvance,
    toggleAdvanceChecklistItem,
    downloadStudyDocument,
    uploadStudyDocument,
  } = usePersonalStudy();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingAdvance, setEditingAdvance] = useState(null);
  const [statusFilter, setStatusFilter] = useState('todos');

  const filteredAdvances = advances.filter(
    (adv) => statusFilter === 'todos' || adv.status === statusFilter
  );

  const getStatusBadge = (st) => {
    switch (st) {
      case 'completado':
        return {
          label: 'Completado',
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
      {/* Cabecera del Módulo de Avances */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              Gestión Diaria de Avances Académicos
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Avances y Documentación Diaria
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Planificación de actividades, definición de propósitos, checklist de tareas, resultados obtenidos y adjuntos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium"
          >
            <option value="todos">Todos los Estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="en_desarrollo">En desarrollo</option>
            <option value="completado">Completados</option>
          </select>

          {canEditStudy && (
            <button
              onClick={() => {
                setEditingAdvance(null);
                setModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Avance Académico</span>
            </button>
          )}
        </div>
      </div>

      {/* Listado de Avances */}
      {filteredAdvances.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400 space-y-2">
          <Award className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
          <p className="text-sm font-semibold">No hay avances registrados con el filtro actual.</p>
          {canEditStudy && (
            <p className="text-xs">
              Haz clic en "Nuevo Avance Académico" para planificar la jornada de estudio.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAdvances.map((adv) => {
            const stInfo = getStatusBadge(adv.status);
            const advanceDocs = documents.filter((d) => d.advance_id === adv.id);
            const tasks = adv.tasks_checklist || [];
            const doneTasks = tasks.filter((t) => t.completed).length;

            return (
              <div
                key={adv.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                {/* Cabecera del Avance */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${stInfo.className}`}>
                        {stInfo.label}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        Fecha: <strong>{adv.scheduled_date}</strong>
                      </span>
                      <span>•</span>
                      <span className="text-xs text-slate-400">
                        Responsable: <strong>{adv.responsible_names?.join(', ') || 'Equipo'}</strong>
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {adv.title}
                    </h3>
                  </div>

                  {canEditStudy && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          setEditingAdvance(adv);
                          setModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Editar avance"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`¿Eliminar el avance "${adv.title}"?`)) {
                            deleteStudyAdvance(adv.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Eliminar avance"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Contenido: Propósito y Objetivos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {adv.purpose && (
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-1">
                      <p className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                        Descripción y Propósito:
                      </p>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {adv.purpose}
                      </p>
                    </div>
                  )}

                  {adv.objectives && (
                    <div className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-1">
                      <p className="font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider text-[10px]">
                        Objetivos a Alcanzar:
                      </p>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                        {adv.objectives}
                      </p>
                    </div>
                  )}
                </div>

                {/* Checklist interactivo de Actividades / Tareas */}
                {tasks.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>Actividades y Tareas por Realizar:</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-extrabold text-[11px]">
                        {doneTasks} de {tasks.length} completadas ({Math.round((doneTasks / tasks.length) * 100)}%)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {tasks.map((task) => (
                        <button
                          key={task.id}
                          disabled={!canEditStudy}
                          onClick={() => toggleAdvanceChecklistItem(adv.id, task.id)}
                          className={`p-2.5 rounded-xl border text-left text-xs flex items-center gap-2.5 transition-colors ${
                            task.completed
                              ? 'bg-emerald-50/60 dark:bg-emerald-950/25 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 line-through opacity-85'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-300'
                          }`}
                        >
                          {task.completed ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          <span className="truncate">{task.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resultados y Observaciones */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                  {adv.results && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-100 space-y-0.5">
                      <p className="font-bold text-[11px] text-emerald-800 dark:text-emerald-300">
                        Resultados Obtenidos:
                      </p>
                      <p className="leading-relaxed">{adv.results}</p>
                    </div>
                  )}

                  {adv.observations && (
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 space-y-0.5">
                      <p className="font-bold text-[11px] text-slate-500 dark:text-slate-400">
                        Observaciones y Comentarios:
                      </p>
                      <p className="leading-relaxed">{adv.observations}</p>
                    </div>
                  )}
                </div>

                {/* Documentos Adjuntos a este Avance */}
                {advanceDocs.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5" />
                      Documentación Adjunta ({advanceDocs.length})
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      {advanceDocs.map((doc) => (
                        <div
                          key={doc.id}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200"
                        >
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                            {doc.extension}
                          </span>
                          <span className="font-medium truncate max-w-xs">{doc.name}</span>
                          <button
                            onClick={() => downloadStudyDocument(doc)}
                            className="p-0.5 text-slate-400 hover:text-indigo-600"
                            title="Descargar"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para Crear / Editar Avance */}
      {modalOpen && (
        <StudyAdvanceModal
          initialData={editingAdvance}
          onClose={() => {
            setModalOpen(false);
            setEditingAdvance(null);
          }}
          onSave={async (payload) => {
            if (editingAdvance) {
              await updateStudyAdvance(editingAdvance.id, payload);
            } else {
              await addStudyAdvance(payload);
            }
            setModalOpen(false);
            setEditingAdvance(null);
          }}
        />
      )}
    </div>
  );
}

function StudyAdvanceModal({ initialData, onClose, onSave }) {
  const today = new Date().toISOString().split('T')[0];

  const [title, setTitle] = useState(initialData?.title || '');
  const [purpose, setPurpose] = useState(initialData?.purpose || '');
  const [scheduledDate, setScheduledDate] = useState(initialData?.scheduled_date || today);
  const [objectives, setObjectives] = useState(initialData?.objectives || '');
  const [responsibleNames, setResponsibleNames] = useState(
    initialData?.responsible_names?.join(', ') || 'Estudiante Principal'
  );
  const [status, setStatus] = useState(initialData?.status || 'en_desarrollo');
  const [observations, setObservations] = useState(initialData?.observations || '');
  const [results, setResults] = useState(initialData?.results || '');

  // Checklist dinámico
  const [tasks, setTasks] = useState(
    initialData?.tasks_checklist || [
      { id: 't1', text: 'Revisión y comprensión del material teórico', completed: false },
      { id: 't2', text: 'Desarrollo práctico / ejercicios de laboratorio', completed: false },
      { id: 't3', text: 'Redacción de conclusiones y resultados', completed: false },
    ]
  );
  const [newTaskText, setNewTaskText] = useState('');

  // Archivos adjuntos seleccionados
  const [attachments, setAttachments] = useState([]);
  const [saving, setSaving] = useState(false);

  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    setTasks((prev) => [
      ...prev,
      { id: `t-${Date.now()}`, text: newTaskText.trim(), completed: false },
    ]);
    setNewTaskText('');
  };

  const handleRemoveTask = (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      const isText = file.type.includes('text') || file.name.endsWith('.md') || file.name.endsWith('.txt');

      if (isText) {
        reader.readAsText(file);
        reader.onload = () => {
          setAttachments((prev) => [
            ...prev,
            {
              name: file.name,
              size: file.size,
              type: file.type || 'text/plain',
              content_text: reader.result,
            },
          ]);
        };
      } else {
        reader.readAsDataURL(file);
        reader.onload = () => {
          setAttachments((prev) => [
            ...prev,
            {
              name: file.name,
              size: file.size,
              type: file.type || 'application/octet-stream',
              data_url: reader.result,
            },
          ]);
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        title,
        purpose,
        scheduled_date: scheduledDate,
        objectives,
        responsible_names: responsibleNames
          .split(',')
          .map((n) => n.trim())
          .filter(Boolean),
        status,
        observations,
        results,
        tasks_checklist: tasks,
        attachments,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {initialData ? 'Editar Avance Académico' : 'Registrar Nuevo Avance de Estudio'}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Título de la Actividad / Avance *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Análisis de Arquitecturas RLS y Pruebas en PostgreSQL"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Fecha Programada *
              </label>
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Estado de Progreso *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-medium"
              >
                <option value="pendiente">Pendiente</option>
                <option value="en_desarrollo">En desarrollo</option>
                <option value="completado">Completado</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Descripción y Propósito
            </label>
            <textarea
              rows={2}
              placeholder="Explica qué se planifica realizar y cuál es la finalidad de esta actividad..."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Objetivos que se Deben Alcanzar
            </label>
            <textarea
              rows={2}
              placeholder="Metas puntuales de aprendizaje o entregables esperados..."
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          {/* Checklist de Actividades por realizar */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Actividades o Tareas por Realizar (Checklist)
            </label>
            <div className="space-y-1.5 mb-2">
              {tasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <span className="truncate">{t.text}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTask(t.id)}
                    className="p-1 text-slate-400 hover:text-rose-500"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Añadir tarea específica al avance..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTask();
                  }
                }}
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
              <button
                type="button"
                onClick={handleAddTask}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold"
              >
                Añadir
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Resultados Obtenidos (Opcional)
              </label>
              <textarea
                rows={2}
                placeholder="Conclusiones, metas alcanzadas, entregables..."
                value={results}
                onChange={(e) => setResults(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Observaciones y Comentarios
              </label>
              <textarea
                rows={2}
                placeholder="Notas de estudio, dificultades o dudas a resolver..."
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Responsable(s) (separados por coma)
            </label>
            <input
              type="text"
              value={responsibleNames}
              onChange={(e) => setResponsibleNames(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          {/* Adjuntar Archivos */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Adjuntar Archivos (.md, .pdf, .doc, .docx, .txt, etc.)
            </label>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
            {attachments.length > 0 && (
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                {attachments.length} archivo(s) listos para adjuntar
              </p>
            )}
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
              {saving ? 'Guardando...' : 'Guardar Avance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
