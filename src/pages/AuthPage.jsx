import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Lock,
  Mail,
  User,
  Briefcase,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { ROLE_CONFIG } from '../utils/formatters';

export default function AuthPage() {
  const {
    login,
    registerUserAccount,
    resetPassword,
    profiles,
    switchActiveRoleUser,
    isSupabaseConfigured,
  } = useProject();
  const navigate = useNavigate();

  // Modos: 'login' | 'register' | 'recover'
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [specialty, setSpecialty] = useState('Desarrollador Full Stack');
  const [role, setRole] = useState('integrante');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        navigate('/');
      } else if (mode === 'register') {
        await registerUserAccount({
          email,
          password,
          fullName,
          role,
          specialty,
        });
        setSuccessMsg('Cuenta creada e iniciada correctamente.');
        navigate('/');
      } else if (mode === 'recover') {
        await resetPassword(email);
        setSuccessMsg(
          'Se han enviado las instrucciones de recuperación de contraseña al correo indicado.'
        );
      }
    } catch (err) {
      setErrorMsg(err.message || 'Ocurrió un error al procesar la solicitud.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemoAccess = (userProfile) => {
    switchActiveRoleUser(userProfile.id);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Panel izquierdo informativo de la plataforma */}
      <div className="lg:w-1/2 bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white p-8 lg:p-14 flex flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-lg">
              NP
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight block leading-none">
                NexusPM
              </span>
              <span className="text-xs text-indigo-200">
                Plataforma Colaborativa de Gestión de Proyectos
              </span>
            </div>
          </div>

          <div className="mt-12 max-w-lg space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 border border-indigo-400/30 text-indigo-200">
              <Sparkles className="w-3.5 h-3.5" />
              Supabase PostgreSQL + GitHub Pages Ready
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Planificación, delegación y trazabilidad total para equipos de software.
            </h1>
            <p className="text-indigo-100/85 text-sm sm:text-base leading-relaxed">
              Organiza el plan de trabajo con cronograma Gantt interactivo, delega responsabilidades, recibe entregas con evidencias y supervisa el progreso real del proyecto por roles.
            </p>
          </div>

          <div className="mt-10 grid sm:grid-cols-3 gap-4 max-w-xl">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <p className="text-xs font-bold text-indigo-300 uppercase">Administrador</p>
              <p className="text-xs text-indigo-100/80 mt-1">
                Control de usuarios, cuentas, activación, asignación de roles y configuración.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <p className="text-xs font-bold text-emerald-300 uppercase">Líder de Proyecto</p>
              <p className="text-xs text-indigo-100/80 mt-1">
                Plan de trabajo Gantt, delegación de tareas, revisión, aprobación o devolución.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <p className="text-xs font-bold text-amber-300 uppercase">Integrantes</p>
              <p className="text-xs text-indigo-100/80 mt-1">
                Consulta de tareas, reporte de progreso, adjunto de commits/PRs y novedades.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-indigo-200/70">
          <span>Seguridad Row Level Security (RLS) en PostgreSQL</span>
          <span>Arquitectura Estática Compatible con GitHub Pages</span>
        </div>
      </div>

      {/* Panel derecho de autenticación */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="max-w-md w-full space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {mode === 'login' && 'Iniciar sesión en tu cuenta'}
              {mode === 'register' && 'Registro controlado de integrante'}
              {mode === 'recover' && 'Recuperación de contraseña'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {mode === 'login' &&
                'Ingresa con tus credenciales para acceder a tus tareas y cronograma.'}
              {mode === 'register' &&
                'Crea tu cuenta asociada al proyecto. Si tienes invitación previa, tu rol se asignará automáticamente.'}
              {mode === 'recover' &&
                'Ingresa tu correo electrónico institucional o de equipo para restablecer tu clave.'}
            </p>
          </div>

          {/* Selector de pestañas de autenticación */}
          <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Registrarse
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('recover');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`py-2 rounded-lg transition-all ${
                mode === 'recover'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Recuperar Clave
            </button>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nombre Completo
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="Ej: Laura Gómez"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Especialidad / Cargo
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                      <input
                        type="text"
                        required
                        placeholder="Desarrollador Frontend"
                        value={specialty}
                        onChange={(e) => setSpecialty(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Rol Solicitado
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                    >
                      <option value="integrante">Integrante del Equipo</option>
                      <option value="lider">Líder del Proyecto</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="usuario@nexuspm.dev"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {mode !== 'recover' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm shadow-indigo-500/20 transition-all"
            >
              <span>
                {submitting
                  ? 'Procesando...'
                  : mode === 'login'
                  ? 'Ingresar a la Plataforma'
                  : mode === 'register'
                  ? 'Completar Registro'
                  : 'Enviar Enlace de Recuperación'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Acceso rápido por rol cuando está en modo verificación local */}
          {!isSupabaseConfigured && (
            <div className="pt-5 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Cuentas de Verificación Rápida por Rol
                </span>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                  1 clic para ingresar
                </span>
              </div>
              <div className="space-y-2">
                {profiles.map((p) => {
                  const rBadge = ROLE_CONFIG[p.role];
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleQuickDemoAccess(p)}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-500 flex items-center justify-between text-left transition-all group"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {p.full_name}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {p.email} • {p.specialty}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border shrink-0 ${rBadge?.badgeClass}`}
                      >
                        {rBadge?.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
