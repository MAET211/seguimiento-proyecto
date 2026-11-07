import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Send,
  RotateCcw,
  ExternalLink,
  Calendar,
  AlertCircle,
  FileCheck2,
  SlidersHorizontal,
  Trash2,
  Edit3,
  X,
  Link2,
  UserCheck,
  MessageSquareWarning,
  BellRing,
  Mail,
  ShieldCheck,
  Upload,
  Download,
  FileText,
  Paperclip,
  FileCode,
  Eye,
  File,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import {
  TASK_STATUS_CONFIG,
  PRIORITY_CONFIG,
  formatDate,
  formatDateTime,
  getInitials,
} from '../utils/formatters';

function formatFileSize(bytes) {
  if (!bytes || isNaN(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileExtension(name = '') {
  const parts = (name || '').split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

function decodeBase64Text(dataUrl = '') {
  try {
    const base64 = dataUrl.split(',')[1] || '';
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (m) => m.charCodeAt(0));
    return new TextDecoder('utf-8').decode(bytes);
  } catch (e) {
    return 'No fue posible previsualizar el contenido en texto plano.';
  }
}

function getDeliverableBadgeInfo(ev) {
  const name = ev.file_name || ev.title || ev.evidence_url || '';
  const ext = (ev.file_extension || getFileExtension(name)).toLowerCase();
  const url = ev.evidence_url || ev.data_url || '';
  const isDataUrl = url.startsWith('data:');

  if (['doc', 'docx'].includes(ext)) {
    return {
      label: ext.toUpperCase(),
      bg: 'bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      isDownloadable: true,
    };
  }
  if (ext === 'pdf') {
    return {
      label: 'PDF',
      bg: 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      isPdf: true,
      isDownloadable: true,
      canViewInline: true,
    };
  }
  if (['md', 'markdown'].includes(ext)) {
    return {
      label: 'MD',
      bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      isMarkdown: true,
      isDownloadable: true,
      canViewInline: true,
    };
  }
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
    return {
      label: ext.toUpperCase(),
      bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      isDownloadable: true,
    };
  }
  if (['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif'].includes(ext)) {
    return {
      label: 'IMG',
      bg: 'bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      isDownloadable: true,
      canViewInline: true,
    };
  }
  if (['txt', 'csv', 'json'].includes(ext)) {
    return {
      label: ext.toUpperCase(),
      bg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
      isDownloadable: true,
      canViewInline: true,
    };
  }
  return {
    label: ev.evidence_type === 'pull_request' ? 'PR' : ev.evidence_type === 'commit' ? 'GIT' : 'URL',
    bg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    isDownloadable: isDataUrl,
    canViewInline: false,
  };
}

function DeliverableEvidenceItem({ ev, onPreviewText }) {
  const badge = getDeliverableBadgeInfo(ev);
  const url = ev.evidence_url || ev.data_url || '';
  const isDataUrl = url.startsWith('data:');
  const fileName = ev.file_name || ev.title || (isDataUrl ? 'documento' : 'enlace');

  return (
    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
      <div className="flex items-center gap-2 min-w-0">
        <span
          className={`px-1.5 py-0.5 text-[9px] font-black uppercase rounded-md border tracking-wider shrink-0 ${badge.bg}`}
        >
          {badge.label}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" title={fileName}>
              {ev.title || fileName}
            </p>
            {ev.deliverable_item && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 shrink-0">
                {ev.deliverable_item}
                {ev.deliverable_pct ? ` • ${ev.deliverable_pct}%` : ''}
              </span>
            )}
          </div>
          {(ev.file_size || ev.file_name) && (
            <p className="text-[10px] text-slate-400 truncate">
              {ev.file_name ? ev.file_name : ''}
              {ev.file_size ? ` • ${ev.file_size}` : ''}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {(badge.isMarkdown || badge.canViewInline) && isDataUrl && onPreviewText && (
          <button
            type="button"
            onClick={() => onPreviewText(ev)}
            className="p-1 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800"
            title="Previsualizar archivo"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        )}

        {!isDataUrl && (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="p-1 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800"
            title="Abrir enlace externo"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}

        {isDataUrl && (
          <a
            href={url}
            download={fileName}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-[11px] font-bold transition-colors"
            title={`Descargar ${fileName}`}
          >
            <Download className="w-3 h-3" />
            <span>Descargar</span>
          </a>
        )}
      </div>
    </div>
  );
}

function DeliverableFilesUploader({ stagedEvidences, setStagedEvidences, defaultItemName = '', defaultItemPct = null }) {
  const [activeTab, setActiveTab] = useState('files');
  const [urlTitle, setUrlTitle] = useState('');
  const [urlType, setUrlType] = useState('pull_request');
  const [urlValue, setUrlValue] = useState('');
  const [reading, setReading] = useState(false);

  const handleFileSelect = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;
    setReading(true);

    try {
      const readPromises = selectedFiles.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const ext = getFileExtension(file.name);
            resolve({
              id: `ev-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
              title: file.name,
              file_name: file.name,
              file_size: formatFileSize(file.size),
              file_extension: ext,
              evidence_url: reader.result,
              evidence_type: 'documento',
              deliverable_item: defaultItemName || '',
              deliverable_pct: defaultItemPct || null,
              created_at: new Date().toISOString(),
            });
          };
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(file);
        });
      });

      const results = await Promise.all(readPromises);
      const validResults = results.filter(Boolean);
      setStagedEvidences((prev) => [...prev, ...validResults]);
    } finally {
      setReading(false);
      e.target.value = '';
    }
  };

  const handleAddUrl = (e) => {
    e.preventDefault();
    if (!urlValue.trim()) return;
    const newLinkEv = {
      id: `ev-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      title: urlTitle.trim() || urlValue,
      evidence_url: urlValue.trim(),
      evidence_type: urlType,
      file_name: '',
      file_size: '',
      file_extension: '',
      deliverable_item: defaultItemName || '',
      deliverable_pct: defaultItemPct || null,
      created_at: new Date().toISOString(),
    };
    setStagedEvidences((prev) => [...prev, newLinkEv]);
    setUrlTitle('');
    setUrlValue('');
  };

  const handleRemove = (id) => {
    setStagedEvidences((prev) => prev.filter((ev) => ev.id !== id));
  };

  const handleTitleChange = (id, newTitle) => {
    setStagedEvidences((prev) =>
      prev.map((ev) => (ev.id === id ? { ...ev, title: newTitle } : ev))
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('files')}
          className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'files'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Subir Archivos (Word, PDF, MD, Zip...)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('link')}
          className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'link'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Link2 className="w-3.5 h-3.5" />
          <span>Enlace Web (PR / Commit / Drive)</span>
        </button>
      </div>

      {activeTab === 'files' ? (
        <div>
          <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 hover:border-indigo-400 dark:hover:border-indigo-600 rounded-xl bg-indigo-50/20 dark:bg-indigo-950/10 cursor-pointer transition-colors group">
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.md,.txt,.zip,.rar,.png,.jpg,.jpeg,.xlsx,.pptx"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Upload className="w-4 h-4" />
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {reading ? 'Cargando y procesando archivos...' : 'Haz clic para seleccionar o arrastra archivos aquí'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center mt-0.5">
              Word (.doc, .docx), PDF (.pdf), Markdown (.md), comprimidos (.zip) o imágenes
            </p>
          </label>
        </div>
      ) : (
        <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Título del Enlace
              </label>
              <input
                type="text"
                placeholder="Ej: Pull Request #24 / Demo en línea"
                value={urlTitle}
                onChange={(e) => setUrlTitle(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Tipo
              </label>
              <select
                value={urlType}
                onChange={(e) => setUrlType(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              >
                <option value="pull_request">Pull Request (GitHub)</option>
                <option value="commit">Commit en Repositorio</option>
                <option value="documento">Documento Técnico</option>
                <option value="despliegue">URL de Despliegue</option>
                <option value="enlace">Otro Enlace</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
              URL del Entregable
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://github.com/... o https://drive.google.com/..."
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
              <button
                type="button"
                onClick={handleAddUrl}
                disabled={!urlValue.trim()}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 disabled:opacity-50"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}

      {stagedEvidences.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
            Entregables seleccionados ({stagedEvidences.length}):
          </span>
          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            {stagedEvidences.map((ev, idx) => {
              const badge = getDeliverableBadgeInfo(ev);
              return (
                <div
                  key={ev.id || idx}
                  className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs"
                >
                  <span
                    className={`px-1.5 py-0.5 text-[9px] font-black uppercase rounded border shrink-0 ${badge.bg}`}
                  >
                    {badge.label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={ev.title}
                      onChange={(e) => handleTitleChange(ev.id, e.target.value)}
                      placeholder="Nombre del entregable..."
                      className="w-full px-2 py-1 text-xs rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 font-medium"
                      title="Haz clic para personalizar el nombre del entregable"
                    />
                    {ev.file_size && (
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        {ev.file_name} • {ev.file_size}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemove(ev.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 shrink-0"
                    title="Eliminar este entregable"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function MarkdownPreviewModal({ doc, onClose }) {
  if (!doc) return null;
  const isDataUrl = (doc.evidence_url || '').startsWith('data:');
  const textContent = isDataUrl ? decodeBase64Text(doc.evidence_url) : doc.description || '';

  return (
    <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
              DOCUMENTO
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {doc.title || doc.file_name}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
          {textContent || 'Sin contenido en formato texto.'}
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800 mt-3">
          <span className="text-xs text-slate-400">{doc.file_size || ''}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700"
            >
              Cerrar
            </button>
            <a
              href={doc.evidence_url}
              download={doc.file_name || doc.title}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar Archivo</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const {
    tasks,
    profiles,
    workPlan,
    currentUser,
    isLeaderOrAdmin,
    metrics,
    createTask,
    updateTask,
    updateTaskMemberProgress,
    submitTaskForLeaderReview,
    reviewTaskByLeader,
    adjustTaskProgressAndStatus,
    deleteTask,
  } = useProject();

  // Filtros de búsqueda y tabla/tarjetas
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [priorityFilter, setPriorityFilter] = useState('todas');
  const [assigneeFilter, setAssigneeFilter] = useState(
    currentUser?.role === 'integrante' ? currentUser.id : 'todos'
  );

  // Modales activos
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [progressTask, setProgressTask] = useState(null);
  const [submitReviewTask, setSubmitReviewTask] = useState(null);
  const [leaderReviewTask, setLeaderReviewTask] = useState(null);
  const [adjustTask, setAdjustTask] = useState(null);
  const [reminderTask, setReminderTask] = useState(null);
  const [auditBanner, setAuditBanner] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.instructions || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'todas' || t.priority === priorityFilter;
    const matchesAssignee =
      assigneeFilter === 'todos' || t.assignee_ids?.includes(assigneeFilter);
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
  });

  return (
    <div className="space-y-6">
      {/* Banner de Auditoría Oficial de Notificaciones y Recordatorios */}
      {auditBanner && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-100 flex items-start justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-600 text-slate-950 font-bold shrink-0 mt-0.5 shadow-xs">
              <BellRing className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/25 text-amber-900 dark:text-amber-300">
                  {auditBanner.title}
                </span>
                {auditBanner.code && (
                  <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                    Ref: {auditBanner.code}
                  </span>
                )}
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {auditBanner.message}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {auditBanner.details}
              </p>
            </div>
          </div>
          <button
            onClick={() => setAuditBanner(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-amber-500/10 transition-colors"
            title="Cerrar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Cabecera del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Tareas y Responsabilidades
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Delegación de actividades individuales o grupales, reporte de avances, adjunto de evidencias y flujo de aprobación.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {currentUser?.role === 'integrante' && (
            <button
              type="button"
              onClick={() =>
                setAssigneeFilter(assigneeFilter === currentUser.id ? 'todos' : currentUser.id)
              }
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                assigneeFilter === currentUser.id
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {assigneeFilter === currentUser.id
                ? 'Viendo: Mis tareas asignadas'
                : 'Ver solo mis tareas'}
            </button>
          )}

          {isLeaderOrAdmin && (
            <button
              type="button"
              onClick={() => {
                setEditingTask(null);
                setCreateModalOpen(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm shadow-indigo-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nueva Tarea / Delegación</span>
            </button>
          )}
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Buscar tarea, instrucción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium"
        >
          <option value="todos">Todos los estados ({tasks.length})</option>
          <option value="pendiente">Pendiente ({metrics.pendingTasks})</option>
          <option value="en_proceso">En proceso ({metrics.inProgressTasks})</option>
          <option value="en_revision">En revisión ({metrics.inReviewTasks})</option>
          <option value="completada">Completada ({metrics.completedTasks})</option>
          <option value="devuelta">Devuelta para correcciones ({metrics.returnedTasks})</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium"
        >
          <option value="todas">Todas las prioridades</option>
          <option value="critica">Prioridad Crítica</option>
          <option value="alta">Prioridad Alta</option>
          <option value="media">Prioridad Media</option>
          <option value="baja">Prioridad Baja</option>
        </select>

        <select
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
          className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium"
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
      </div>

      {/* Listado de Tarjetas Detalladas de Tareas */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              No se encontraron tareas con los filtros seleccionados.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('todos');
                setPriorityFilter('todas');
                setAssigneeFilter('todos');
              }}
              className="mt-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const statusCfg = TASK_STATUS_CONFIG[task.status];
            const prioCfg = PRIORITY_CONFIG[task.priority];
            const assignees = profiles.filter((p) => task.assignee_ids?.includes(p.id));
            const isAssignedToMe = task.assignee_ids?.includes(currentUser?.id);
            const canUpdateProgress = isAssignedToMe || isLeaderOrAdmin;
            const isOverdue =
              task.status !== 'completada' && task.due_date && task.due_date < metrics.todayStr;
            const relatedPlan = workPlan.find((w) => w.id === task.work_plan_id);

            return (
              <div
                key={task.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 sm:p-6 shadow-xs transition-all ${
                  task.status === 'en_revision'
                    ? 'border-amber-300 dark:border-amber-700/80'
                    : task.status === 'devuelta'
                    ? 'border-rose-300 dark:border-rose-800/80'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Fila superior: Estado, Prioridad, Fase y Acciones de edición/eliminación */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusCfg?.badgeClass}`}
                    >
                      {statusCfg?.label}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase border ${prioCfg?.badgeClass}`}
                    >
                      Prioridad {prioCfg?.label}
                    </span>
                    {relatedPlan && (
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {relatedPlan.phase}
                      </span>
                    )}
                    {isOverdue && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Vencida
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      Asignada: <strong>{formatDate(task.assigned_at)}</strong>
                    </span>
                    <span>•</span>
                    <span
                      className={
                        isOverdue ? 'text-rose-600 dark:text-rose-400 font-bold' : 'font-semibold'
                      }
                    >
                      Fecha límite: {formatDate(task.due_date)}
                    </span>

                    {isLeaderOrAdmin && (
                      <div className="flex items-center gap-1 ml-2">
                        {assignees.length > 0 && task.status !== 'completada' && (
                          <button
                            type="button"
                            onClick={() => setReminderTask(task)}
                            className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                            title="Emitir recordatorio oficial por correo al desarrollador"
                          >
                            <BellRing className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTask(task);
                            setCreateModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Editar tarea"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`¿Eliminar la tarea "${task.title}"?`)) {
                              deleteTask(task.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Eliminar tarea"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cuerpo principal de la tarea */}
                <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-3">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      {task.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {task.description}
                    </p>

                    {task.instructions && (
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 text-xs space-y-1">
                        <p className="font-bold text-slate-700 dark:text-slate-200">
                          Instrucciones técnicas / Criterios de entrega:
                        </p>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                          {task.instructions}
                        </p>
                      </div>
                    )}

                    {/* Recursos o enlaces de referencia */}
                    {task.reference_links && task.reference_links.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-xs font-semibold text-slate-500">Referencias:</span>
                        {task.reference_links.map((ref, idx) => (
                          <a
                            key={idx}
                            href={ref.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60 hover:underline"
                          >
                            <Link2 className="w-3 h-3" />
                            <span>{ref.label || ref.url}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Retroalimentación del líder si fue revisada o devuelta */}
                    {task.leader_feedback && (
                      <div
                        className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                          task.status === 'devuelta'
                            ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                            : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                        }`}
                      >
                        <MessageSquareWarning className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">
                            Observaciones del Líder ({task.status === 'devuelta' ? 'Requiere ajustes' : 'Aprobada'}):
                          </p>
                          <p className="mt-0.5">{task.leader_feedback}</p>
                        </div>
                      </div>
                    )}

                    {/* Resumen de lo realizado y Evidencias / Entregables adjuntos por el integrante */}
                    {(task.deliverable_summary || (task.evidences && task.evidences.length > 0)) && (
                      <div className="p-3.5 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/50 text-xs space-y-2.5">
                        {task.deliverable_summary && (
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              Reporte de avance / entrega del integrante:
                            </span>
                            <p className="text-slate-600 dark:text-slate-300 mt-0.5 whitespace-pre-wrap">
                              {task.deliverable_summary}
                            </p>
                          </div>
                        )}
                        {task.evidences && task.evidences.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <span className="font-bold text-slate-800 dark:text-slate-200 block">
                              Entregables y archivos adjuntos ({task.evidences.length}):
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {task.evidences.map((ev) => (
                                <DeliverableEvidenceItem
                                  key={ev.id}
                                  ev={ev}
                                  onPreviewText={setPreviewDoc}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Columna derecha: Responsables, Barra de Progreso y Botones de Acción */}
                  <div className="flex flex-col justify-between p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 space-y-4">
                    <div className="space-y-3">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                          Responsable(s) Asignado(s)
                        </span>
                        <div className="space-y-1.5">
                          {assignees.map((a) => (
                            <div key={a.id} className="flex items-center gap-2 text-xs">
                              <div className="w-6 h-6 rounded-full bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                                {getInitials(a.full_name)}
                              </div>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {a.full_name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-semibold text-slate-600 dark:text-slate-300">
                            Progreso de la actividad
                          </span>
                          <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                            {task.progress || 0}%
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              statusCfg?.barClass || 'bg-indigo-600'
                            }`}
                            style={{ width: `${task.progress || 0}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Botones de flujo de trabajo según rol y estado */}
                    <div className="space-y-2 pt-2 border-t border-slate-200/70 dark:border-slate-700/70">
                      {isLeaderOrAdmin && assignees.length > 0 && task.status !== 'completada' && (
                        <button
                          type="button"
                          onClick={() => setReminderTask(task)}
                          className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                          title="Enviar recordatorio formal por correo al desarrollador asignado con firma del Líder"
                        >
                          <BellRing className="w-3.5 h-3.5" />
                          <span>Recordar al desarrollador</span>
                        </button>
                      )}

                      {canUpdateProgress && task.status !== 'completada' && (
                        <div className="grid grid-cols-1 gap-2">
                          <button
                            type="button"
                            onClick={() => setProgressTask(task)}
                            className="w-full py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                          >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                            <span>Actualizar Avance (%)</span>
                          </button>

                          {task.status !== 'en_revision' && (
                            <button
                              type="button"
                              onClick={() => setSubmitReviewTask(task)}
                              className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>
                                {task.progress && task.progress > 0
                                  ? `Enviar Siguiente Entregable (${task.progress}%)`
                                  : 'Enviar Entregable para Revisión'}
                              </span>
                            </button>
                          )}
                        </div>
                      )}

                      {isLeaderOrAdmin && task.status === 'en_revision' && (
                        <button
                          type="button"
                          onClick={() => setLeaderReviewTask(task)}
                          className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Revisar Entrega (Aprobar / Devolver)</span>
                        </button>
                      )}

                      {task.status === 'completada' && (
                        <div className="space-y-1.5">
                          <div className="py-1.5 px-3 rounded-xl bg-emerald-100/70 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Actividad Aprobada y Completada (100%)</span>
                          </div>
                          {(isLeaderOrAdmin || canUpdateProgress) && (
                            <button
                              type="button"
                              onClick={() => setAdjustTask(task)}
                              className="w-full py-1.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
                              title="Ajustar porcentaje o reabrir tarea para subir los siguientes entregables"
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                              <span>Ajustar % / Reabrir para más entregables</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal 1: Crear o Editar Tarea (Líder / Admin) */}
      {createModalOpen && (
        <TaskFormModal
          initialTask={editingTask}
          onClose={() => {
            setCreateModalOpen(false);
            setEditingTask(null);
          }}
          onSave={async (payload) => {
            if (editingTask) {
              await updateTask(editingTask.id, payload);
            } else {
              const res = await createTask(payload);
              const assignedDevs = profiles.filter((p) => payload.assignee_ids?.includes(p.id));
              setAuditBanner({
                title: 'Tarea Asignada y Notificada por Correo',
                message: `Tarea "${payload.title}" delegada con éxito`,
                code: res?.emailResults?.[0]?.auditCode || 'SIGMA-AUDIT-TSK',
                details: `Se envió la notificación formal con la auditoría de la plataforma SIGMA y firma del Líder al correo de: ${
                  assignedDevs.map((d) => `${d.full_name} (${d.email})`).join(', ') || 'equipo'
                }.`,
              });
            }
            setCreateModalOpen(false);
            setEditingTask(null);
          }}
        />
      )}

      {/* Modal 2: Actualizar Progreso Parcial y Subir Entregables (Integrante / Líder) */}
      {progressTask && (
        <UpdateProgressModal
          task={progressTask}
          onClose={() => setProgressTask(null)}
          onPreviewDoc={setPreviewDoc}
          onSave={async (data) => {
            await updateTaskMemberProgress(progressTask.id, data);
            setProgressTask(null);
          }}
        />
      )}

      {/* Modal 3: Marcar como Finalizada y Enviar a Revisión con Entregables / Archivos (Integrante) */}
      {submitReviewTask && (
        <SubmitForReviewModal
          task={submitReviewTask}
          onClose={() => setSubmitReviewTask(null)}
          onPreviewDoc={setPreviewDoc}
          onSubmit={async (data) => {
            await submitTaskForLeaderReview(submitReviewTask.id, data);
            setSubmitReviewTask(null);
          }}
        />
      )}

      {/* Modal 4: Revisar, Aprobar o Devolver Tarea con Entregables (Líder / Admin) */}
      {leaderReviewTask && (
        <LeaderReviewModal
          task={leaderReviewTask}
          onClose={() => setLeaderReviewTask(null)}
          onPreviewDoc={setPreviewDoc}
          onDecision={async (data) => {
            await reviewTaskByLeader(leaderReviewTask.id, data);
            setLeaderReviewTask(null);
          }}
        />
      )}

      {/* Modal 4.5: Ajustar Progreso y Reabrir Entregables (Líder / Admin / Integrante) */}
      {adjustTask && (
        <AdjustTaskModal
          task={adjustTask}
          onClose={() => setAdjustTask(null)}
          onSave={async (data) => {
            await adjustTaskProgressAndStatus(adjustTask.id, data);
            setAdjustTask(null);
          }}
        />
      )}

      {/* Modal 5: Recordatorio de Tarea al Desarrollador con Auditoría Oficial (Líder / Admin) */}
      {reminderTask && (
        <TaskReminderModal
          task={reminderTask}
          onClose={() => setReminderTask(null)}
          onReminderSent={({ task, assignee, result }) => {
            setAuditBanner({
              title: 'Recordatorio Formal Emitido al Desarrollador',
              message: `Recordatorio enviado a ${assignee.full_name} (${assignee.email})`,
              code: result.auditCode,
              details: `Se notificó el seguimiento para la tarea "${task.title}". Registro firmado por el Líder y archivado en la auditoría del sistema.`,
            });
          }}
        />
      )}

      {/* Modal 6: Visor de Documentos Markdown y Texto */}
      {previewDoc && (
        <MarkdownPreviewModal
          doc={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
}

function TaskFormModal({ initialTask, onClose, onSave }) {
  const { profiles, workPlan } = useProject();
  const today = new Date().toISOString().split('T')[0];

  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [instructions, setInstructions] = useState(initialTask?.instructions || '');
  const [priority, setPriority] = useState(initialTask?.priority || 'alta');
  const [assignedAt, setAssignedAt] = useState(initialTask?.assigned_at || today);
  const [dueDate, setDueDate] = useState(initialTask?.due_date || today);
  const [workPlanId, setWorkPlanId] = useState(initialTask?.work_plan_id || '');
  const [selectedAssignees, setSelectedAssignees] = useState(
    initialTask?.assignee_ids || [profiles[2]?.id].filter(Boolean)
  );
  const [refLabel, setRefLabel] = useState(initialTask?.reference_links?.[0]?.label || '');
  const [refUrl, setRefUrl] = useState(initialTask?.reference_links?.[0]?.url || '');
  const [saving, setSaving] = useState(false);

  const toggleAssignee = (uid) => {
    setSelectedAssignees((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedAssignees.length === 0) {
      alert('Selecciona al menos un responsable para la tarea.');
      return;
    }
    setSaving(true);
    try {
      const reference_links = refUrl
        ? [{ label: refLabel || 'Recurso de referencia', url: refUrl }]
        : initialTask?.reference_links || [];

      await onSave({
        title,
        description,
        instructions,
        priority,
        assigned_at: assignedAt,
        due_date: dueDate,
        work_plan_id: workPlanId || null,
        assignee_ids: selectedAssignees,
        reference_links,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {initialTask ? 'Editar Tarea y Delegación' : 'Crear y Delegar Nueva Tarea'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Título de la Tarea *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Implementar endpoint y vista de exportación de reportes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Actividad del Plan de Trabajo asociada
              </label>
              <select
                value={workPlanId}
                onChange={(e) => setWorkPlanId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              >
                <option value="">General del proyecto</option>
                {workPlan.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.phase} — {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Prioridad *
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Descripción de la Actividad *
            </label>
            <textarea
              rows={2}
              required
              placeholder="Explica el objetivo funcional de la tarea..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Instrucciones Específicas para el Integrante
            </label>
            <textarea
              rows={2}
              placeholder="Criterios de aceptación, estándares de código, rama donde hacer Pull Request..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Fecha de Asignación *
              </label>
              <input
                type="date"
                required
                value={assignedAt}
                onChange={(e) => setAssignedAt(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Fecha Límite de Entrega *
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
          </div>

          {/* Selección de uno o varios responsables */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Responsable o Responsables (Delegación Individual o Grupal) *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              {profiles
                .filter((p) => p.is_active)
                .map((member) => {
                  const checked = selectedAssignees.includes(member.id);
                  return (
                    <label
                      key={member.id}
                      className={`flex items-center gap-2.5 p-2 rounded-lg text-xs cursor-pointer border transition-colors ${
                        checked
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200 font-semibold'
                          : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-900'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleAssignee(member.id)}
                        className="rounded text-indigo-600"
                      />
                      <div className="truncate">
                        <p className="truncate">{member.full_name}</p>
                        <p className="text-[10px] text-slate-500 truncate">{member.specialty}</p>
                      </div>
                    </label>
                  );
                })}
            </div>
          </div>

          {/* Recurso o enlace de referencia */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nombre del Recurso de Referencia
              </label>
              <input
                type="text"
                placeholder="Ej: Prototipo Figma / Documentación API"
                value={refLabel}
                onChange={(e) => setRefLabel(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                URL del Recurso de Referencia
              </label>
              <input
                type="url"
                placeholder="https://github.com/..."
                value={refUrl}
                onChange={(e) => setRefUrl(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
          </div>

          {/* Aviso de Auditoría y Notificación por Correo */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-[11px] text-slate-600 dark:text-slate-300 flex items-start gap-2">
            <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <span>
              <strong>Notificación de Asignación Automática:</strong> Al delegar esta tarea, el desarrollador seleccionado recibirá una notificación formal en su correo registrado con la auditoría de la plataforma SIGMA y firma de la autoridad (Líder del Proyecto).
            </span>
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
              {saving ? 'Guardando...' : initialTask ? 'Guardar Cambios' : 'Delegar y Notificar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UpdateProgressModal({ task, onClose, onSave, onPreviewDoc }) {
  const [progress, setProgress] = useState(task.progress || 0);
  const [status, setStatus] = useState(
    task.status === 'pendiente' ? 'en_proceso' : task.status
  );
  const [summary, setSummary] = useState(task.deliverable_summary || '');
  const [stagedEvidences, setStagedEvidences] = useState([]);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        progress: Number(progress),
        status,
        deliverable_summary: summary,
        evidences: stagedEvidences,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Actualizar Progreso y Subir Entregables
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-3 truncate">
          {task.title}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>Porcentaje de Avance</span>
              <span className="text-indigo-600 font-bold">{progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Estado de Ejecución
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            >
              <option value="pendiente">Pendiente</option>
              <option value="en_proceso">En proceso</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notas de Avance Realizado
            </label>
            <textarea
              rows={2}
              placeholder="Describe los avances logrados hasta el momento..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          {/* Entregables previamente registrados */}
          {task.evidences && task.evidences.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">
                Entregables ya registrados en esta actividad ({task.evidences.length}):
              </span>
              <div className="grid grid-cols-1 gap-1.5 max-h-32 overflow-y-auto">
                {task.evidences.map((ev) => (
                  <DeliverableEvidenceItem key={ev.id} ev={ev} onPreviewText={onPreviewDoc} />
                ))}
              </div>
            </div>
          )}

          {/* Subida de nuevos entregables / documentos */}
          <div className="p-3.5 rounded-xl bg-indigo-50/30 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40 space-y-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Adjuntar Archivos / Entregables de Avance (Word, PDF, Markdown, Zip)
            </span>
            <DeliverableFilesUploader
              stagedEvidences={stagedEvidences}
              setStagedEvidences={setStagedEvidences}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
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
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{saving ? 'Guardando...' : 'Guardar Avance y Entregables'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SubmitForReviewModal({ task, onClose, onSubmit, onPreviewDoc }) {
  const currentProgress = task.progress || 0;
  const existingEvidences = task.evidences || [];
  const nextNum = existingEvidences.length + 1;

  // Número estimado de entregables para la tarea (1, 2, 3 o 4)
  const [totalItems, setTotalItems] = useState(3);
  const [itemNumber, setItemNumber] = useState(Math.min(nextNum, 3));
  const [customItemTitle, setCustomItemTitle] = useState('');

  const computeSuggestedPct = (num, tot) => {
    if (tot === 1 || num >= tot) return 100;
    if (tot === 3) {
      if (num === 1) return 33;
      if (num === 2) return 66;
      return 100;
    }
    if (tot === 2) {
      return num === 1 ? 50 : 100;
    }
    if (tot === 4) {
      if (num === 1) return 25;
      if (num === 2) return 50;
      if (num === 3) return 75;
      return 100;
    }
    return Math.min(100, Math.round((num / tot) * 100));
  };

  const [percentage, setPercentage] = useState(() => computeSuggestedPct(Math.min(nextNum, 3), 3));
  const [summary, setSummary] = useState(task.deliverable_summary || '');
  const [stagedEvidences, setStagedEvidences] = useState([]);
  const [saving, setSaving] = useState(false);

  const activeItemLabel = customItemTitle.trim() || `Entregable ${itemNumber} de ${totalItems}`;

  const handleTotalChange = (tot) => {
    setTotalItems(tot);
    const validNum = Math.min(itemNumber, tot);
    setItemNumber(validNum);
    setPercentage(computeSuggestedPct(validNum, tot));
  };

  const handleItemNumChange = (num) => {
    setItemNumber(num);
    setPercentage(computeSuggestedPct(num, totalItems));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        deliverable_summary: summary,
        evidences: stagedEvidences.map((ev, idx) => ({
          ...ev,
          deliverable_item: ev.deliverable_item || activeItemLabel,
          deliverable_pct: Number(percentage),
        })),
        progress: Number(percentage),
        deliverable_item: activeItemLabel,
        is_final: Number(percentage) >= 100,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Enviar Entregable y Reportar Avance para Revisión
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Selecciona el ítem de entregable y el porcentaje de avance correspondiente.
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1">
          {/* Bloque: Configuración de Entregables e Ítem */}
          <div className="p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/70 dark:border-purple-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-950 dark:text-purple-200 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>¿Cuántos entregables componen esta actividad?</span>
              </span>
              <span className="text-[11px] font-extrabold text-purple-700 dark:text-purple-300">
                Total: {totalItems} entregable(s)
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {[
                { count: 1, label: '1 (100%)' },
                { count: 2, label: '2 (50% c/u)' },
                { count: 3, label: '3 (33% c/u)' },
                { count: 4, label: '4 (25% c/u)' },
              ].map((opt) => (
                <button
                  key={opt.count}
                  type="button"
                  onClick={() => handleTotalChange(opt.count)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all text-center ${
                    totalItems === opt.count
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-purple-100 dark:border-purple-900/40 hover:bg-purple-100/50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {totalItems > 1 && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Ítem que estás presentando en esta entrega:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from({ length: totalItems }).map((_, i) => {
                    const num = i + 1;
                    const isSelected = itemNumber === num;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleItemNumChange(num)}
                        className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-indigo-50'
                        }`}
                      >
                        Entregable {num} de {totalItems}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Título o especificación del entregable (opcional)
              </label>
              <input
                type="text"
                placeholder={`Ej: ${activeItemLabel} - Mapear leyes, decretos y resoluciones`}
                value={customItemTitle}
                onChange={(e) => setCustomItemTitle(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-medium"
              />
            </div>

            {/* Selector del porcentaje a acreditar */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                  Porcentaje de avance a acreditar con esta entrega:
                </span>
                <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                  {percentage}%
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                {[25, 33, 50, 66, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setPercentage(pct)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      percentage === pct
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-indigo-50'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
                <div className="flex items-center gap-1 ml-auto">
                  <span className="text-xs text-slate-500 font-medium">Libre:</span>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={percentage}
                    onChange={(e) => setPercentage(Math.max(1, Math.min(100, Number(e.target.value))))}
                    className="w-16 px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-center"
                  />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">%</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/40 text-[11px] text-slate-600 dark:text-slate-300">
                {percentage < 100 ? (
                  <p className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-medium">
                    <span>🟡</span>
                    <span>
                      <strong>Entrega Parcial ({percentage}%):</strong> Al ser aprobada por el líder, la actividad avanzará al <strong>{percentage}%</strong> y continuará en estado <strong>En Proceso</strong> para que puedas presentar los entregables restantes.
                    </span>
                  </p>
                ) : (
                  <p className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-medium">
                    <span>🟢</span>
                    <span>
                      <strong>Entrega Final (100%):</strong> Al ser aprobada por el líder, la actividad quedará completada y culminada al <strong>100%</strong>.
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Descripción detallada de lo realizado *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Detalla los cambios implementados, avances y resultados correspondientes a este entregable..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          {/* Entregables acumulados previamente si existen */}
          {task.evidences && task.evidences.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">
                Entregables adjuntos previamente ({task.evidences.length}):
              </span>
              <div className="grid grid-cols-1 gap-1.5 max-h-28 overflow-y-auto">
                {task.evidences.map((ev) => (
                  <DeliverableEvidenceItem key={ev.id} ev={ev} onPreviewText={onPreviewDoc} />
                ))}
              </div>
            </div>
          )}

          {/* Subida de entregables / archivos / enlaces */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Adjuntar Archivos y Entregables (Word, PDF, Markdown, Zip, etc.)
              </p>
              <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                {stagedEvidences.length} archivo(s) por adjuntar
              </span>
            </div>
            <DeliverableFilesUploader
              stagedEvidences={stagedEvidences}
              setStagedEvidences={setStagedEvidences}
              defaultItemName={activeItemLabel}
              defaultItemPct={percentage}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-1.5 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {saving
                  ? 'Enviando...'
                  : percentage < 100
                  ? `Enviar Entregable Parcial (${percentage}%) a Revisión`
                  : 'Enviar Entrega Final (100%) a Revisión'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LeaderReviewModal({ task, onClose, onDecision, onPreviewDoc }) {
  const [feedback, setFeedback] = useState(task.leader_feedback || '');
  const proposedPct = task.progress || 33;
  const [approvedProgress, setApprovedProgress] = useState(proposedPct);
  const [saving, setSaving] = useState(false);

  const handleAction = async (decision, customProgress = null) => {
    if (decision === 'devolver' && !feedback.trim()) {
      alert('Por favor indica las observaciones o correcciones requeridas al devolver la tarea.');
      return;
    }
    setSaving(true);
    try {
      const finalApprovedPct = customProgress !== null ? customProgress : approvedProgress;
      await onDecision({
        decision: decision === 'devolver' ? 'devolver' : 'aprobar',
        leader_feedback: feedback,
        approved_progress: finalApprovedPct,
        is_final: decision === 'aprobar_final' || finalApprovedPct >= 100,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Revisión de Entrega por el Líder
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 overflow-y-auto pr-1">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
            <p className="font-bold text-slate-900 dark:text-white">{task.title}</p>
            <p className="text-slate-600 dark:text-slate-300">
              <strong>Resumen reportado por el integrante:</strong>{' '}
              {task.deliverable_summary || 'Sin descripción adicional.'}
            </p>
          </div>

          {/* Entregables y archivos adjuntos para revisión */}
          {task.evidences && task.evidences.length > 0 && (
            <div className="p-3.5 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/50 space-y-2">
              <span className="font-bold text-xs text-indigo-900 dark:text-indigo-200 block">
                Entregables y Archivos para Revisión ({task.evidences.length}):
              </span>
              <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto">
                {task.evidences.map((ev) => (
                  <DeliverableEvidenceItem
                    key={ev.id}
                    ev={ev}
                    onPreviewText={onPreviewDoc}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sección de Aprobación y Validación de Porcentaje */}
          <div className="p-3.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900/50 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-950 dark:text-purple-200 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600" />
                <span>Porcentaje de Avance a Acreditar</span>
              </span>
              <span className="text-xs font-extrabold text-purple-700 dark:text-purple-300">
                {approvedProgress}%
              </span>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Avance propuesto por el integrante: <strong>{task.progress || 33}%</strong>. Confirma o ajusta el porcentaje de avance para esta entrega:
            </p>

            <div className="flex flex-wrap items-center gap-1.5">
              {[25, 33, 50, 66, 75, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setApprovedProgress(pct)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    approvedProgress === pct
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-purple-50'
                  }`}
                >
                  {pct}%
                </button>
              ))}
              <div className="flex items-center gap-1 ml-auto">
                <span className="text-xs text-slate-500 font-medium">Libre:</span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={approvedProgress}
                  onChange={(e) => setApprovedProgress(Math.max(1, Math.min(100, Number(e.target.value))))}
                  className="w-16 px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-center"
                />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">%</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-purple-100 dark:border-purple-900/40 text-[11px] text-slate-600 dark:text-slate-300">
              {approvedProgress < 100 ? (
                <p className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-medium">
                  <span>ℹ️</span>
                  <span>
                    <strong>Aprobación Parcial ({approvedProgress}%):</strong> La tarea quedará en estado <strong>En Proceso</strong> acreditando {approvedProgress}% de avance, manteniéndose abierta para recibir los siguientes entregables.
                  </span>
                </p>
              ) : (
                <p className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-medium">
                  <span>✅</span>
                  <span>
                    <strong>Aprobación Final (100%):</strong> La tarea se marcará formalmente como <strong>Completada</strong>.
                  </span>
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Retroalimentación / Comentarios del Líder
            </label>
            <textarea
              rows={3}
              placeholder="Escribe tus comentarios de aprobación o detalla las correcciones solicitadas..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => handleAction('devolver')}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Devolver para Correcciones</span>
          </button>
          {approvedProgress < 100 ? (
            <button
              type="button"
              disabled={saving}
              onClick={() => handleAction('aprobar', approvedProgress)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Aprobar Entrega Parcial ({approvedProgress}%)</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={saving}
              onClick={() => handleAction('aprobar_final', 100)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Aprobar y Completar Tarea (100%)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function AdjustTaskModal({ task, onClose, onSave }) {
  const [progress, setProgress] = useState(task.progress || 33);
  const [status, setStatus] = useState(task.status || 'en_proceso');
  const [feedback, setFeedback] = useState(task.leader_feedback || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        progress: Number(progress),
        status,
        leader_feedback: feedback,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Ajustar Progreso y Reabrir Entregables
            </h3>
            <p className="text-xs text-slate-500">
              Modifica el porcentaje o reabre la tarea para siguientes entregables
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate">
            {task.title}
          </p>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>Porcentaje de Avance Real:</span>
              <span className="font-extrabold text-indigo-600 text-sm">{progress}%</span>
            </div>
            <div className="flex gap-1.5 mb-2">
              {[25, 33, 50, 66, 75, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setProgress(pct)}
                  className={`flex-1 py-1 rounded-lg text-xs font-bold ${
                    progress === pct
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Estado de la Actividad
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-semibold"
            >
              <option value="en_proceso">En proceso (Abierta para más entregables)</option>
              <option value="en_revision">En revisión del líder</option>
              <option value="completada">Completada (100%)</option>
              <option value="pendiente">Pendiente</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nota / Observación de ajuste
            </label>
            <input
              type="text"
              placeholder="Ej: Se reabre la tarea al 33% para recibir el entregable 2 de 3"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
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
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {saving ? 'Guardando...' : 'Aplicar Ajuste'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TaskReminderModal({ task, onClose, onReminderSent }) {
  const { profiles, currentUser, sendTaskReminder } = useProject();
  const assignees = profiles.filter((p) => task.assignee_ids?.includes(p.id));
  const [selectedAssigneeId, setSelectedAssigneeId] = useState(
    assignees[0]?.id || ''
  );
  const [customNote, setCustomNote] = useState('');
  const [sending, setSending] = useState(false);
  const [sentAudit, setSentAudit] = useState(null);

  const selectedAssignee =
    profiles.find((p) => p.id === selectedAssigneeId) || assignees[0];

  const handleSendReminder = async (e) => {
    e.preventDefault();
    if (!selectedAssigneeId) {
      alert('Selecciona al desarrollador al que deseas enviar el recordatorio.');
      return;
    }
    setSending(true);
    try {
      const result = await sendTaskReminder({
        taskId: task.id,
        assigneeId: selectedAssigneeId,
        customNote,
      });
      setSentAudit(result);
      if (onReminderSent) {
        onReminderSent({
          task,
          assignee: selectedAssignee,
          result,
        });
      }
    } catch (err) {
      alert('Error enviando recordatorio: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Recordatorio de Tarea al Desarrollador
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Emisión de recordatorio formal con auditoría oficial y firma del Líder
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {sentAudit ? (
          <div className="py-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/15 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                ¡Recordatorio Emitido con Éxito!
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-md mx-auto">
                Se notificó a <strong>{selectedAssignee?.full_name}</strong> al correo:{' '}
                <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                  {selectedAssignee?.email}
                </span>
                .
              </p>
              <div className="mt-4 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-1.5 font-mono">
                <p>
                  <strong>Código de Auditoría:</strong> {sentAudit.auditCode}
                </p>
                <p>
                  <strong>Fecha y Hora:</strong> {sentAudit.timestamp}
                </p>
                <p>
                  <strong>Autoridad Emisora:</strong> {currentUser?.full_name} (Líder / Administrador)
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
              {sentAudit.mailtoUrl && (
                <a
                  href={sentAudit.mailtoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Abrir copia en cliente de correo</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSendReminder} className="space-y-4 mt-4">
            {/* Resumen de la tarea */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Tarea Seleccionada
                </span>
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                  Progreso actual: {task.progress || 0}%
                </span>
              </div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                {task.title}
              </p>
              <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                <span>
                  Límite: <strong>{formatDate(task.due_date)}</strong>
                </span>
                <span>•</span>
                <span>
                  Prioridad: <strong>{task.priority?.toUpperCase()}</strong>
                </span>
              </div>
            </div>

            {/* Desarrollador destinatario */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Desarrollador a Recordar *
              </label>
              <select
                value={selectedAssigneeId}
                onChange={(e) => setSelectedAssigneeId(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-medium"
              >
                {assignees.map((dev) => (
                  <option key={dev.id} value={dev.id}>
                    {dev.full_name} ({dev.email}) — {dev.specialty || 'Desarrollador'}
                  </option>
                ))}
              </select>
            </div>

            {/* Instrucción o nota puntual del líder */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mensaje o Instrucción Puntual del Líder (Opcional)
              </label>
              <textarea
                rows={3}
                placeholder="Ej: Estimado desarrollador, le recuerdo que la entrega está fijada para esta semana. Por favor reporte avances y adjunte las evidencias pendientes..."
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>

            {/* Cuadro de Auditoría */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Auditoría Institucional de SIGMA:</p>
                <p className="mt-0.5 text-[11px] leading-relaxed opacity-90">
                  El recordatorio será firmado por <strong>{currentUser?.full_name}</strong> como Líder de Proyecto / Administrador General, asignándole un código de trazabilidad único registrado en el historial oficial del sistema.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={sending}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <BellRing className="w-3.5 h-3.5" />
                <span>
                  {sending ? 'Emitiendo Recordatorio...' : 'Emitir Recordatorio Oficial'}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
