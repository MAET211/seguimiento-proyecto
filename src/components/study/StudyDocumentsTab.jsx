import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Eye,
  FileCode,
  FileArchive,
  FileSpreadsheet,
  X,
  Plus,
  Paperclip,
} from 'lucide-react';
import { usePersonalStudy } from '../../context/PersonalStudyContext';

export default function StudyDocumentsTab() {
  const {
    documents,
    advances,
    canEditStudy,
    uploadStudyDocument,
    deleteStudyDocument,
    downloadStudyDocument,
  } = usePersonalStudy();

  const [typeFilter, setTypeFilter] = useState('todos');
  const [viewingDoc, setViewingDoc] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const filteredDocs = documents.filter((doc) => {
    if (typeFilter === 'todos') return true;
    if (typeFilter === 'md') return doc.extension === 'md';
    if (typeFilter === 'pdf') return doc.extension === 'pdf';
    if (typeFilter === 'word')
      return doc.extension === 'doc' || doc.extension === 'docx';
    return !['md', 'pdf', 'doc', 'docx'].includes(doc.extension);
  });

  const getFormatBadge = (ext) => {
    switch (ext) {
      case 'md':
        return 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200';
      case 'pdf':
        return 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200';
      case 'doc':
      case 'docx':
        return 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border-sky-200';
      case 'txt':
        return 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera de Documentos y Recursos */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              Bóveda de Documentación Académica
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Documentos y Recursos de Estudio
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Archivos Markdown, PDF, Microsoft Word, guías, síntesis teóricas y recursos de aprendizaje.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-medium"
          >
            <option value="todos">Todos los Formatos</option>
            <option value="md">Markdown (.md)</option>
            <option value="pdf">Documentos PDF (.pdf)</option>
            <option value="word">Microsoft Word (.doc, .docx)</option>
            <option value="otros">Otros Archivos</option>
          </select>

          {canEditStudy && (
            <button
              onClick={() => setUploadModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Subir Documento</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid de Archivos */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400 space-y-2">
          <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
          <p className="text-sm font-semibold">No hay documentos registrados para este filtro.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => {
            const relatedAdvance = advances.find((a) => a.id === doc.advance_id);

            return (
              <div
                key={doc.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${getFormatBadge(
                        doc.extension
                      )}`}
                    >
                      {doc.extension}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {(doc.size / 1024).toFixed(1)} KB
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                    {doc.name}
                  </h4>

                  {relatedAdvance && (
                    <div className="flex items-center gap-1.5 text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                      <Paperclip className="w-3 h-3" />
                      <span className="truncate">Avance: {relatedAdvance.title}</span>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-400">
                    Subido por: {doc.uploaded_by_name || 'Estudiante'} •{' '}
                    {new Date(doc.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Botones de acción */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    {/* Botón de Visualización para Markdown o archivos de texto */}
                    {(doc.extension === 'md' || doc.content_text) && (
                      <button
                        onClick={() => setViewingDoc(doc)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold hover:bg-indigo-100 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Visualizar</span>
                      </button>
                    )}

                    <button
                      onClick={() => downloadStudyDocument(doc)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Descargar</span>
                    </button>
                  </div>

                  {canEditStudy && (
                    <button
                      onClick={() => {
                        if (window.confirm(`¿Eliminar el documento "${doc.name}"?`)) {
                          deleteStudyDocument(doc.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Eliminar archivo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Visor de Markdown / Texto */}
      {viewingDoc && (
        <MarkdownViewerModal doc={viewingDoc} onClose={() => setViewingDoc(null)} />
      )}

      {/* Modal para Subir Documento */}
      {uploadModalOpen && (
        <UploadDocumentModal
          advances={advances}
          onClose={() => setUploadModalOpen(false)}
          onUpload={async (data) => {
            await uploadStudyDocument(data);
            setUploadModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function MarkdownViewerModal({ doc, onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl my-8 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-purple-100 text-purple-700">
              {doc.extension}
            </span>
            <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
              {doc.name}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-3 font-mono text-xs bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 my-2 text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
          {doc.content_text || 'El contenido de este archivo no está disponible como texto plano.'}
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Cerrar Visor
          </button>
        </div>
      </div>
    </div>
  );
}

function UploadDocumentModal({ advances, onClose, onUpload }) {
  const [selectedAdvanceId, setSelectedAdvanceId] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      const isText =
        file.type.includes('text') || file.name.endsWith('.md') || file.name.endsWith('.txt');

      if (isText) {
        reader.readAsText(file);
        reader.onload = async () => {
          await onUpload({
            name: file.name,
            size: file.size,
            type: file.type || 'text/plain',
            content_text: reader.result,
            advance_id: selectedAdvanceId || null,
          });
        };
      } else {
        reader.readAsDataURL(file);
        reader.onload = async () => {
          await onUpload({
            name: file.name,
            size: file.size,
            type: file.type || 'application/octet-stream',
            data_url: reader.result,
            advance_id: selectedAdvanceId || null,
          });
        };
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Subir Documento o Recurso de Estudio
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleUploadSubmit} className="space-y-4 mt-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Seleccionar Archivo (.md, .pdf, .docx, .doc, .txt, etc.) *
            </label>
            <input
              type="file"
              required
              onChange={handleFileChange}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Vincular a un Avance Académico (Opcional)
            </label>
            <select
              value={selectedAdvanceId}
              onChange={(e) => setSelectedAdvanceId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-medium"
            >
              <option value="">Documento General de Estudio</option>
              {advances.map((adv) => (
                <option key={adv.id} value={adv.id}>
                  {adv.title} ({adv.scheduled_date})
                </option>
              ))}
            </select>
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
              disabled={uploading || !file}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
            >
              {uploading ? 'Subiendo...' : 'Subir Documento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
