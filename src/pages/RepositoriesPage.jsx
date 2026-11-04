import React, { useState } from 'react';
import {
  GitBranch,
  GitPullRequest,
  FolderGit2,
  BookOpen,
  Figma,
  FileText,
  AlertCircle,
  Plus,
  Search,
  ExternalLink,
  Trash2,
  X,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { REPO_CATEGORY_CONFIG, formatDateTime } from '../utils/formatters';

const CATEGORY_ICON = {
  repo_principal: FolderGit2,
  repo_secundario: FolderGit2,
  rama: GitBranch,
  pull_request: GitPullRequest,
  issue: AlertCircle,
  documentacion: BookOpen,
  diseno_prototipo: Figma,
  requerimientos: FileText,
};

export default function RepositoriesPage() {
  const {
    repositories,
    profiles,
    currentUser,
    isLeaderOrAdmin,
    addRepositoryResource,
    deleteRepositoryResource,
  } = useProject();

  const [categoryFilter, setCategoryFilter] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const filteredResources = repositories.filter((res) => {
    const matchesCat = categoryFilter === 'todas' || res.category === categoryFilter;
    const matchesSearch =
      res.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (res.branch_or_tag || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Repositorios y Recursos del Proyecto
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Directorio centralizado de repositorios de GitHub, ramas activas, Pull Requests, Issues, documentación, prototipos y requerimientos.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm shadow-indigo-500/20 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Recurso / Enlace</span>
        </button>
      </div>

      {/* Barra de búsqueda y píldoras de categorías */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Buscar repositorio, rama, PR, documento o requerimiento..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setCategoryFilter('todas')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              categoryFilter === 'todas'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Todos ({repositories.length})
          </button>
          {Object.entries(REPO_CATEGORY_CONFIG).map(([key, cfg]) => {
            const count = repositories.filter((r) => r.category === key).length;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setCategoryFilter(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  categoryFilter === key
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {cfg.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Grilla de tarjetas de recursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredResources.map((res) => {
          const catCfg = REPO_CATEGORY_CONFIG[res.category] || REPO_CATEGORY_CONFIG.repo_principal;
          const Icon = CATEGORY_ICON[res.category] || FolderGit2;
          const creator = profiles.find((p) => p.id === res.created_by);
          const canDelete = isLeaderOrAdmin || res.created_by === currentUser?.id;

          return (
            <div
              key={res.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${catCfg.badgeClass}`}
                      >
                        {catCfg.label}
                      </span>
                      {res.branch_or_tag && (
                        <span className="ml-2 px-2 py-0.5 rounded-md text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {res.branch_or_tag}
                        </span>
                      )}
                    </div>
                  </div>

                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`¿Eliminar el recurso "${res.name}"?`)) {
                          deleteRepositoryResource(res.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Eliminar recurso"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3">
                  {res.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {res.description}
                </p>
              </div>

              <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 truncate">
                  Por {creator?.full_name || 'Equipo'} • {formatDateTime(res.created_at)}
                </span>
                <a
                  href={res.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-600 hover:text-white transition-colors shrink-0"
                >
                  <span>Abrir Enlace</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal para Agregar Nuevo Repositorio o Recurso */}
      {modalOpen && (
        <NewResourceModal
          onClose={() => setModalOpen(false)}
          onSave={async (payload) => {
            await addRepositoryResource(payload);
            setModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function NewResourceModal({ onClose, onSave }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('repo_principal');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [branchOrTag, setBranchOrTag] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        name,
        category,
        description,
        url,
        branch_or_tag: branchOrTag,
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
            Registrar Repositorio o Recurso del Proyecto
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Categoría del Recurso *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            >
              {Object.entries(REPO_CATEGORY_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>
                  {cfg.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nombre del Recurso *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Repositorio Principal Frontend / PR #30 Autenticación"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Descripción *
            </label>
            <textarea
              rows={2}
              required
              placeholder="Describe el propósito o contenido de este recurso..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                URL de Acceso Directo *
              </label>
              <input
                type="url"
                required
                placeholder="https://github.com/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Rama / Etiqueta
              </label>
              <input
                type="text"
                placeholder="main / v1.0"
                value={branchOrTag}
                onChange={(e) => setBranchOrTag(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
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
              {saving ? 'Guardando...' : 'Guardar Recurso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
