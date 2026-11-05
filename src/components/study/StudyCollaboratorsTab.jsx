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
  Eye,
  EyeOff,
  KeyRound,
  ShieldAlert,
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
    toggleStudyMemberActive,
    removeStudyMember,
  } = usePersonalStudy();

  const [modalOpen, setModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('lector');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdCredentialsToast, setCreatedCredentialsToast] = useState(null);

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSaving(true);
    try {
      if (!password || password.length < 6) {
        throw new Error('La contraseña debe contener al menos 6 caracteres.');
      }

      await inviteStudyMember({ email, fullName, role, password });

      setCreatedCredentialsToast({
        full_name: fullName || email.split('@')[0],
        email: email.trim().toLowerCase(),
        password,
        role: role.toUpperCase(),
      });

      setEmail('');
      setFullName('');
      setPassword('');
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
            Espacio privado con alta de usuarios con contraseña, habilitación, deshabilitación y revocación segura.
          </p>
        </div>

        {canManageMembers && (
          <button
            onClick={() => {
              setErrorMsg('');
              setModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Dar de Alta Colaborador de Estudio</span>
          </button>
        )}
      </div>

      {/* Confirmación de credenciales recién creadas con contraseña */}
      {createdCredentialsToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Cuenta de estudio creada exitosamente para {createdCredentialsToast.full_name}
            </p>
            <p>
              Correo: <strong>{createdCredentialsToast.email}</strong> • Contraseña asignada:{' '}
              <code className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 font-mono font-bold text-indigo-600 dark:text-indigo-400 border border-emerald-200 dark:border-emerald-800">
                {createdCredentialsToast.password}
              </code>{' '}
              • Rol: <strong className="uppercase">{createdCredentialsToast.role}</strong>
            </p>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
              El colaborador ya puede iniciar sesión en la pantalla de Login con estas credenciales y accederá directamente a Estudio Personal.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCreatedCredentialsToast(null)}
            className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline shrink-0"
          >
            Cerrar aviso
          </button>
        </div>
      )}

      {/* Tarjetas de Explicación de Permisos RBAC */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/40 space-y-1.5">
          <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>Administrador</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            Control total del espacio de estudio. Puede invitar colaboradores con contraseña, modificar permisos, activar, desactivar y eliminar.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-900/40 space-y-1.5">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
            <Edit2 className="w-4 h-4" />
            <span>Editor</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
            Puede crear y modificar actividades en el cronograma, documentar avances diarios y adjuntar o eliminar documentación académica.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-1.5">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold text-xs">
            <Lock className="w-4 h-4" />
            <span>Lector</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400">
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
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Fecha de Autorización</th>
                {canManageMembers && <th className="py-3 pl-4 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {members.map((member) => {
                const roleInfo = getRoleBadge(member.role);
                const isActive = member.is_active !== false;

                return (
                  <tr key={member.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 text-xs border border-indigo-200 dark:border-indigo-800">
                          {member.full_name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {member.full_name}
                          </p>
                          {member.is_owner && (
                            <span className="text-[10px] text-purple-700 dark:text-purple-300 font-extrabold uppercase">
                              PROPIETARIO PRINCIPAL
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
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${roleInfo.badge}`}>
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

                    <td className="py-3.5 px-4">
                      {member.is_owner ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Activo
                        </span>
                      ) : isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Habilitado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          Desactivado
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(member.joined_at || Date.now()).toLocaleDateString()}
                    </td>

                    {canManageMembers && (
                      <td className="py-3.5 pl-4 text-right whitespace-nowrap">
                        {!member.is_owner ? (
                          <div className="flex items-center justify-end gap-2">
                            {/* Botón de Habilitar / Deshabilitar */}
                            <button
                              type="button"
                              onClick={() => toggleStudyMemberActive(member.id)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                                isActive
                                  ? 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 hover:bg-amber-100'
                                  : 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                              }`}
                              title={isActive ? 'Desactivar acceso temporalmente' : 'Reactivar acceso'}
                            >
                              {isActive ? 'Desactivar' : 'Activar'}
                            </button>

                            {/* Botón de Eliminar */}
                            <button
                              type="button"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `¿Eliminar definitivamente a "${member.full_name}" del espacio de estudio? Esta acción retirará todos sus permisos.`
                                  )
                                ) {
                                  removeStudyMember(member.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                              title="Eliminar participante"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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

      {/* Modal: Invitar y Autorizar Colaborador con Contraseña */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Dar de Alta Colaborador de Estudio
                  </h3>
                  <p className="text-xs text-slate-500">
                    Crea la cuenta con contraseña para que pueda iniciar sesión en el Login
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleInviteSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Lic. Covaleda"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Correo Electrónico para Login *
                </label>
                <input
                  type="email"
                  required
                  placeholder="colaborador@estudio.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">
                    Contraseña de Acceso para Login *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const rand = 'Edu' + Math.floor(1000 + Math.random() * 9000) + '!';
                      setPassword(rand);
                    }}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                  >
                    Generar clave segura
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Mínimo 6 caracteres para iniciar sesión"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2 pr-10 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Con este correo y clave el colaborador podrá ingresar en la pantalla de Login y accederá directamente a Estudio Personal.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Rol y Nivel de Permisos en Estudio *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-medium"
                >
                  <option value="lector">Lector (Solo consulta y descarga autorizada)</option>
                  <option value="editor">Editor (Puede registrar avances y editar cronograma)</option>
                  <option value="admin">Administrador (Control total del espacio de estudio)</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-800/60 text-[11px] text-purple-900 dark:text-purple-300 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Aislamiento de Privacidad Garantizado:
                </p>
                <p>
                  El colaborador ingresará desde el Login principal con sus credenciales y el sistema lo enviará directamente a su Estudio Personal. No podrá visualizar ni ingresar a ningún módulo de SIGMA.
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
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? 'Creando cuenta...' : 'Crear y Autorizar Colaborador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
