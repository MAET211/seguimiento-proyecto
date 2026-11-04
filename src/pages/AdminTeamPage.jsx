import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Settings,
  Shield,
  CheckCircle2,
  XCircle,
  Save,
  X,
  KeyRound,
  Lock,
  ShieldCheck,
  Copy,
  Check,
  Trash2,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { ROLE_CONFIG, getInitials } from '../utils/formatters';

export default function AdminTeamPage() {
  const {
    profiles,
    invitations,
    project,
    projectMembers,
    currentUser,
    isLeaderOrAdmin,
    isAdmin,
    adminUpdateUser,
    deleteUser,
    createInvitationOrUser,
    updateProjectDetails,
    upsertProjectMemberResponsibility,
  } = useProject();

  const [activeTab, setActiveTab] = useState('equipo');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [editingMemberResp, setEditingMemberResp] = useState(null);
  const [createdCredentialsToast, setCreatedCredentialsToast] = useState(null);

  // Estado para formulario de Configuración General del Proyecto
  const [projName, setProjName] = useState(project?.name || '');
  const [projCode, setProjCode] = useState(project?.code || '');
  const [projDesc, setProjDesc] = useState(project?.description || '');
  const [projMethod, setProjMethod] = useState(project?.methodology || '');
  const [projVersion, setProjVersion] = useState(project?.version || '');
  const [projStart, setProjStart] = useState(project?.start_date || '');
  const [projEnd, setProjEnd] = useState(project?.end_date || '');
  const [projRepo, setProjRepo] = useState(project?.repository_main_url || '');
  const [savingProj, setSavingProj] = useState(false);
  const [projSavedBanner, setProjSavedBanner] = useState(false);

  const handleSaveProjectConfig = async (e) => {
    e.preventDefault();
    setSavingProj(true);
    setProjSavedBanner(false);
    try {
      await updateProjectDetails({
        name: projName,
        code: projCode,
        description: projDesc,
        methodology: projMethod,
        version: projVersion,
        start_date: projStart,
        end_date: projEnd,
        repository_main_url: projRepo,
      });
      setProjSavedBanner(true);
      setTimeout(() => setProjSavedBanner(false), 3500);
    } finally {
      setSavingProj(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Gestión de Equipo, Cuentas y Seguridad por Rol
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            El Líder y Administrador registran las cuentas de acceso del equipo asignando su rol (Administrador, Líder o Integrante).
          </p>
        </div>

        {isLeaderOrAdmin && (
          <button
            type="button"
            onClick={() => setInviteModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-sm shadow-indigo-500/20 shrink-0 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Dar de Alta Usuario / Integrante</span>
          </button>
        )}
      </div>

      {/* Confirmación de credenciales recién creadas por el Líder */}
      {createdCredentialsToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="font-bold flex items-center gap-1.5 text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Cuenta creada exitosamente para {createdCredentialsToast.full_name}
            </p>
            <p>
              Correo: <strong>{createdCredentialsToast.email}</strong> • Contraseña asignada:{' '}
              <code className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 font-mono font-bold">
                {createdCredentialsToast.password}
              </code>{' '}
              • Rol: <strong className="uppercase">{createdCredentialsToast.role}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCreatedCredentialsToast(null)}
            className="px-3 py-1.5 rounded-lg border border-emerald-400 text-xs font-semibold self-end sm:self-center"
          >
            Entendido
          </button>
        </div>
      )}

      {/* Pestañas de navegación interna */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('equipo')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'equipo'
              ? 'bg-indigo-600 text-white'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Cuentas del Equipo, Roles y Responsabilidades ({profiles.length})</span>
        </button>

        {isLeaderOrAdmin && (
          <button
            type="button"
            onClick={() => setActiveTab('configuracion')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'configuracion'
                ? 'bg-indigo-600 text-white'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Configuración General del Proyecto</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('permisos')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors ${
            activeTab === 'permisos'
              ? 'bg-indigo-600 text-white'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Sistema de Seguridad y Matriz RLS</span>
        </button>
      </div>

      {/* Pestaña 1: Tabla de Usuarios, Roles, Estado y Responsabilidades */}
      {activeTab === 'equipo' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 pr-4">Usuario y Contacto</th>
                  <th className="py-3 px-4">Rol en el Sistema</th>
                  <th className="py-3 px-4">Responsabilidad Específica</th>
                  <th className="py-3 px-4 text-center">Estado de Acceso</th>
                  {isLeaderOrAdmin && <th className="py-3 pl-4 text-right">Gestión</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {profiles.map((u) => {
                  const roleCfg = ROLE_CONFIG[u.role] || ROLE_CONFIG.integrante;
                  const memberMeta = projectMembers.find((m) => m.user_id === u.id);

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0">
                            {getInitials(u.full_name)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {u.full_name}
                            </p>
                            <p className="text-[11px] text-slate-500">{u.email}</p>
                            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                              {u.specialty}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        {isAdmin || isLeaderOrAdmin ? (
                          <select
                            value={u.role}
                            onChange={(e) => adminUpdateUser(u.id, { role: e.target.value })}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-semibold text-xs"
                          >
                            <option value="admin">Administrador</option>
                            <option value="lider">Líder del Proyecto</option>
                            <option value="integrante">Integrante del Equipo</option>
                          </select>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${roleCfg.badgeClass}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${roleCfg.dotClass}`} />
                            {roleCfg.label}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 max-w-xs">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {memberMeta?.project_role || u.specialty}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                          {memberMeta?.responsibilities ||
                            'Desarrollo de actividades asignadas y registro de avances.'}
                        </p>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            u.is_active
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}
                        >
                          {u.is_active ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Autorizado
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" /> Bloqueado
                            </>
                          )}
                        </span>
                      </td>

                      {isLeaderOrAdmin && (
                        <td className="py-4 pl-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() =>
                              setEditingMemberResp({
                                user: u,
                                project_role: memberMeta?.project_role || u.specialty,
                                responsibilities:
                                  memberMeta?.responsibilities ||
                                  'Desarrollo y entrega de módulos asignados',
                                weekly_hours: memberMeta?.weekly_hours || 20,
                              })
                            }
                            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-950/40 mr-2"
                          >
                            Responsabilidad
                          </button>

                          {u.id !== currentUser?.id && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  adminUpdateUser(u.id, { is_active: !u.is_active })
                                }
                                className={`px-2.5 py-1 rounded-lg font-semibold mr-1.5 ${
                                  u.is_active
                                    ? 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                                    : 'text-emerald-600 hover:bg-emerald-50'
                                }`}
                                title={u.is_active ? 'Bloquear acceso al usuario' : 'Habilitar acceso'}
                              >
                                {u.is_active ? 'Bloquear' : 'Habilitar'}
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (
                                    window.confirm(
                                      `¿Estás seguro de eliminar permanentemente al integrante "${u.full_name}" del proyecto?`
                                    )
                                  ) {
                                    try {
                                      await deleteUser(u.id);
                                    } catch (err) {
                                      alert(err.message || 'Error al eliminar usuario.');
                                    }
                                  }
                                }}
                                className="px-2.5 py-1 rounded-lg font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 inline-flex items-center gap-1"
                                title="Eliminar integrante del proyecto"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Eliminar</span>
                              </button>
                            </>
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
      )}

      {/* Pestaña 2: Configuración General del Proyecto (Líder / Admin) */}
      {activeTab === 'configuracion' && isLeaderOrAdmin && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs max-w-3xl">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Configuración General del Proyecto
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
            Modifica los parámetros globales, fechas maestras y enlace al repositorio principal.
          </p>

          {projSavedBanner && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Configuración del proyecto actualizada correctamente.</span>
            </div>
          )}

          <form onSubmit={handleSaveProjectConfig} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre del Proyecto *
                </label>
                <input
                  type="text"
                  required
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Código Identificador
                </label>
                <input
                  type="text"
                  required
                  value={projCode}
                  onChange={(e) => setProjCode(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Descripción del Proyecto *
              </label>
              <textarea
                rows={3}
                required
                value={projDesc}
                onChange={(e) => setProjDesc(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Metodología de Trabajo
                </label>
                <input
                  type="text"
                  value={projMethod}
                  onChange={(e) => setProjMethod(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Versión Actual
                </label>
                <input
                  type="text"
                  value={projVersion}
                  onChange={(e) => setProjVersion(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Fecha de Inicio del Proyecto
                </label>
                <input
                  type="date"
                  value={projStart}
                  onChange={(e) => setProjStart(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Fecha Estimada de Cierre
                </label>
                <input
                  type="date"
                  value={projEnd}
                  onChange={(e) => setProjEnd(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                URL del Repositorio Principal en GitHub
              </label>
              <input
                type="url"
                value={projRepo}
                onChange={(e) => setProjRepo(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingProj}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{savingProj ? 'Guardando...' : 'Guardar Configuración'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Pestaña 3: Sistema de Seguridad y Matriz de Roles RLS */}
      {activeTab === 'permisos' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Capas de Seguridad Activas en la Plataforma
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <p className="font-bold text-slate-900 dark:text-white">
                  1. Registro Cerrado al Público
                </p>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Nadie externo puede registrarse desde el Login. Solo el Líder o Administrador da de alta a los integrantes.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <p className="font-bold text-slate-900 dark:text-white">
                  2. Bloqueo Anti-Fuerza Bruta
                </p>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  El sistema bloquea automáticamente los intentos tras 5 fallos consecutivos de contraseña.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <p className="font-bold text-slate-900 dark:text-white">
                  3. Políticas RLS en PostgreSQL
                </p>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  La función <code>get_my_role()</code> valida en base de datos cada lectura, creación, edición o borrado.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <p className="font-bold text-slate-900 dark:text-white">
                  4. Revocación Instantánea
                </p>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Si el Líder o Admin bloquea a un usuario (<code>is_active = false</code>), su sesión se cierra y no puede ingresar.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                Rol 1: Administrador
              </span>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2">
                <li>• Gestionar usuarios y cuentas del sistema.</li>
                <li>• Crear, editar y bloquear/habilitar usuarios.</li>
                <li>• Asignar roles (Admin, Líder, Integrante) y permisos.</li>
                <li>• Supervisar el avance de todos los módulos.</li>
                <li>• Administrar la configuración general y conexión DB.</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                Rol 2: Líder del Proyecto
              </span>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2">
                <li>• Dar de alta a los integrantes del proyecto con su rol y clave.</li>
                <li>• Asignar responsabilidades específicas a cada miembro.</li>
                <li>• Delegar tareas individuales o grupales con fechas y prioridades.</li>
                <li>• Crear y reprogramar el Plan de Trabajo (Diagrama de Gantt).</li>
                <li>• Revisar, aprobar o devolver tareas enviadas a revisión.</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Rol 3: Equipo / Integrantes
              </span>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2">
                <li>• Iniciar sesión con la cuenta y contraseña asignada por el Líder.</li>
                <li>• Consultar tareas asignadas, instrucciones y prioridades.</li>
                <li>• Actualizar el progreso porcentual de sus actividades.</li>
                <li>• Registrar novedades, commits, PRs y adjuntar evidencias.</li>
                <li>• Marcar tareas como finalizadas para revisión del líder.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Dar de Alta Nuevo Usuario con Correo, Contraseña y Rol Designado */}
      {inviteModalOpen && (
        <InviteUserModal
          onClose={() => setInviteModalOpen(false)}
          onSave={async (payload) => {
            await createInvitationOrUser(payload);
            setCreatedCredentialsToast(payload);
            setInviteModalOpen(false);
          }}
        />
      )}

      {/* Modal: Editar Responsabilidad de un Integrante */}
      {editingMemberResp && (
        <MemberResponsibilityModal
          item={editingMemberResp}
          onClose={() => setEditingMemberResp(null)}
          onSave={async (payload) => {
            await upsertProjectMemberResponsibility(payload);
            setEditingMemberResp(null);
          }}
        />
      )}
    </div>
  );
}

function InviteUserModal({ onClose, onSave }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Equipo2026*');
  const [role, setRole] = useState('integrante');
  const [specialty, setSpecialty] = useState('Desarrollador de Software');
  const [responsibilities, setResponsibilities] = useState(
    'Desarrollo de módulos asignados, pruebas y registro de avances.'
  );
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$*';
    let pass = 'Nxs';
    for (let i = 0; i < 7; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    pass += '9*';
    setPassword(pass);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (password.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setSaving(true);
    try {
      await onSave({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        specialty: specialty.trim(),
        responsibilities: responsibilities.trim(),
      });
    } catch (err) {
      setErrorMsg(err.message || 'Error al registrar la cuenta en Supabase.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Dar de Alta Usuario del Proyecto
            </h3>
            <p className="text-xs text-slate-500">
              Crea su cuenta de acceso y asígnale su rol oficial.
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nombre Completo de la Persona *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Andrés Felipe Pineda"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Correo Electrónico (Usuario de Login) *
            </label>
            <input
              type="email"
              required
              placeholder="integrante@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Contraseña Inicial Asignada *
              </label>
              <button
                type="button"
                onClick={generateStrongPassword}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <KeyRound className="w-3 h-3" />
                Generar clave segura
              </button>
            </div>
            <input
              type="text"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2 text-sm font-mono rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Comparte este correo y contraseña con el integrante para que inicie sesión.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Rol Designado *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 font-semibold"
              >
                <option value="integrante">Equipo / Integrante</option>
                <option value="lider">Líder del Proyecto</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cargo / Especialidad *
              </label>
              <input
                type="text"
                required
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Responsabilidades Específicas
            </label>
            <textarea
              rows={2}
              value={responsibilities}
              onChange={(e) => setResponsibilities(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
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
              {saving ? 'Creando Cuenta...' : 'Crear Cuenta y Asignar Rol'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MemberResponsibilityModal({ item, onClose, onSave }) {
  const [projectRole, setProjectRole] = useState(item.project_role);
  const [responsibilities, setResponsibilities] = useState(item.responsibilities);
  const [weeklyHours, setWeeklyHours] = useState(item.weekly_hours || 20);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        user_id: item.user.id,
        project_role: projectRole,
        responsibilities,
        weekly_hours: weeklyHours,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Asignar Responsabilidades a {item.user.full_name}
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Rol / Cargo Técnico dentro del Proyecto *
            </label>
            <input
              type="text"
              required
              value={projectRole}
              onChange={(e) => setProjectRole(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Descripción de Responsabilidades *
            </label>
            <textarea
              rows={3}
              required
              value={responsibilities}
              onChange={(e) => setResponsibilities(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Dedicación Estimada (Horas / Semana)
            </label>
            <input
              type="number"
              min="1"
              max="48"
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
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
              {saving ? 'Guardando...' : 'Guardar Responsabilidades'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
