import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Edit2,
  Trash2,
  CheckCircle2,
  Lock,
  Mail,
  User,
  AlertCircle,
  X,
} from 'lucide-react';
import { usePersonalStudy } from '../../context/PersonalStudyContext';

export default function StudyCollaboratorsTab() {
  const {
    members,
    activeSpace,
    canManageMembers,
    isStudyOwner,
    inviteStudyMember,
    updateStudyMemberRole,
    removeStudyMember,
  } = usePersonalStudy();

  const [modalOpen, setModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('lector');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setSaving(true);
    try {
      await inviteStudyMember({ email, fullName, role });
      setSuccessMsg(`Colaborador ${fullName || email} autorizado exitosamente con rol ${role}.`);
      setEmail('');
      setFullName('');
      setRole('lector');
      setModalOpen(false);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadge = (roleName) => {
    switch (roleName) {
      case 'admin':
        return {
          label: 'Administrador',
          desc: 'Control total del espacio, actividades, invitaciones y permisos.',
          badge:
            'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
        };
      case 'editor':
        return {
          label: 'Editor',
          desc: 'Puede planificar, editar cronograma, registrar avances y subir archivos.',
          badge:
            'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
        };
      default:
        return {
          label: 'Lector',
          desc: 'Consulta de solo lectura y descarga de documentos autorizados.',
          badge:
            'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera de Colaboradores */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              Control de Acceso y Privacidad
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            Colaboradores y Permisos de Estudio
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Este espacio es privado por defecto. Solo las personas invitadas y autorizadas tienen acceso a los materiales y avances.
          </p>
        </div>

        {canManageMembers && (
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invitar y Autorizar Colaborador</span>
          </button>
        )}
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="p-1 text-emerald-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tarjetas de Explicación de Permisos RBAC */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-purple-200/80 dark:border-purple-900/40 bg-purple-50/40 dark:bg-purple-950/20 text-xs space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-purple-800 dark:text-purple-300">
            <ShieldCheck className="w-4 h-4" />
            <span>Administrador</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Control total del espacio de estudio. Puede invitar colaboradores, modificar permisos, crear y eliminar actividades y avances.
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-indigo-950/20 text-xs space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-indigo-800 dark:text-indigo-300">
            <Edit2 className="w-4 h-4" />
            <span>Editor</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Puede crear y modificar actividades en el cronograma, documentar avances diarios y adjuntar o eliminar documentación académica.
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
            <Lock className="w-4 h-4" />
            <span>Lector</span>
          </div>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Acceso de solo lectura. Puede consultar el cronograma, revisar los avances y descargar los documentos y recursos de estudio.
          </p>
        </div>
      </div>

      {/* Tabla de Colaboradores Autorizados */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Participantes Autorizados ({members.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 pr-4">Colaborador</th>
                <th className="py-3 px-4">Correo Electrónico</th>
                <th className="py-3 px-4">Rol y Permisos</th>
                <th className="py-3 px-4">Fecha de Autorización</th>
                {canManageMembers && <th className="py-3 pl-4 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {members.map((member) => {
                const roleInfo = getRoleBadge(member.role);

                return (
                  <tr key={member.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-indigo-600/10 text-indigo-600 font-bold flex items-center justify-center shrink-0 text-[11px]">
                          {member.full_name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {member.full_name}
                          </p>
                          {member.is_owner && (
                            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-extrabold uppercase">
                              Propietario Principal
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                      {member.email}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${roleInfo.badge}`}>
                          {roleInfo.label}
                        </span>

                        {/* Selector rápido de rol para el administrador */}
                        {canManageMembers && !member.is_owner && (
                          <select
                            value={member.role}
                            onChange={(e) => updateStudyMemberRole(member.id, e.target.value)}
                            className="text-[11px] px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 font-medium"
                          >
                            <option value="admin">Administrador</option>
                            <option value="editor">Editor</option>
                            <option value="lector">Lector</option>
                          </select>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(member.joined_at).toLocaleDateString()}
                    </td>

                    {canManageMembers && (
                      <td className="py-3.5 pl-4 text-right whitespace-nowrap">
                        {!member.is_owner ? (
                          <button
                            onClick={() => {
                              if (
                                window.confirm(
                                  `¿Retirar el acceso a "${member.full_name}" de este espacio de estudio? Ya no podrá consultar ningún avance ni archivo.`
                                )
                              ) {
                                removeStudyMember(member.id);
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold"
                            title="Revocar acceso"
                          >
                            Revocar Acceso
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium italic">
                            Inmutable
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Invitar y Autorizar Colaborador */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Autorizar Nuevo Colaborador
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleInviteSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Lic. Carlos Mendoza"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  required
                  placeholder="colaborador@universidad.edu.co"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Rol y Nivel de Permisos *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-medium"
                >
                  <option value="lector">Lector (Solo consulta y descarga autorizada)</option>
                  <option value="editor">Editor (Puede registrar avances y editar cronograma)</option>
                  <option value="admin">Administrador (Control total del espacio)</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  Aislamiento de Privacidad:
                </p>
                <p>
                  El colaborador invitado ingresará con su propia cuenta y únicamente tendrá visibilidad del módulo Estudio Personal según el rol asignado. No obtendrá acceso a los datos de SIGMA.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  {saving ? 'Autorizando...' : 'Autorizar Ingreso'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
