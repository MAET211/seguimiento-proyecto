import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  ShieldAlert,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { ROLE_CONFIG } from '../utils/formatters';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 60;

export default function AuthPage() {
  const {
    login,
    resetPassword,
    profiles,
    switchActiveRoleUser,
    isSupabaseConfigured,
  } = useProject();
  const navigate = useNavigate();

  // Solo 'login' y 'recover' (el registro público está deshabilitado por seguridad; solo el Líder/Admin registra usuarios)
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Estado de seguridad anti-fuerza bruta
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const timer = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev <= 1) {
          setFailedAttempts(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutRemaining]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (lockoutRemaining > 0) {
      setErrorMsg(
        `Acceso bloqueado temporalmente por seguridad. Intenta nuevamente en ${lockoutRemaining} segundos.`
      );
      return;
    }

    const sanitizedEmail = email.trim().toLowerCase();
    if (!sanitizedEmail.includes('@')) {
      setErrorMsg('Por favor ingresa un correo electrónico válido.');
      return;
    }

    setSubmitting(true);

    try {
      if (mode === 'login') {
        const loginRes = await login(sanitizedEmail, password);
        setFailedAttempts(0);

        if (loginRes?.isStudyOnly || loginRes?.profile?.role === 'colaborador_estudio') {
          navigate('/estudio-personal');
        } else {
          navigate('/');
        }
      } else if (mode === 'recover') {
        await resetPassword(sanitizedEmail);
        setSuccessMsg(
          'Se han enviado las instrucciones de recuperación de contraseña al correo registrado.'
        );
      }
    } catch (err) {
      const nextAttempts = failedAttempts + 1;
      setFailedAttempts(nextAttempts);

      if (nextAttempts >= MAX_FAILED_ATTEMPTS) {
        setLockoutRemaining(LOCKOUT_SECONDS);
        setErrorMsg(
          `Se superó el límite de ${MAX_FAILED_ATTEMPTS} intentos fallidos. Por seguridad, el inicio de sesión se ha bloqueado por ${LOCKOUT_SECONDS} segundos.`
        );
      } else {
        const rawMsg = err.message || '';
        if (rawMsg.includes('Invalid login credentials')) {
          setErrorMsg(
            `Credenciales incorrectas o cuenta no registrada por el Líder. (Intento ${nextAttempts} de ${MAX_FAILED_ATTEMPTS}).`
          );
        } else if (rawMsg.includes('Email not confirmed')) {
          setErrorMsg(
            'Tu cuenta aún requiere confirmación en Supabase. Ejecuta el script de activación en el SQL Editor.'
          );
        } else {
          setErrorMsg(rawMsg || 'No fue posible iniciar sesión. Verifica tus credenciales.');
        }
      }
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
      {/* Panel izquierdo informativo de seguridad y roles */}
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 border border-emerald-400/30 text-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Acceso Seguro por Rol • RLS PostgreSQL Activo
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Planificación, delegación y trazabilidad total para equipos de software.
            </h1>
            <p className="text-indigo-100/85 text-sm sm:text-base leading-relaxed">
              El acceso a la plataforma es exclusivo para los miembros autorizados. Al iniciar sesión con tu cuenta, el sistema identifica automáticamente tu rol asignado.
            </p>
          </div>

          {/* Tarjetas de los 3 roles oficiales */}
          <div className="mt-10 grid sm:grid-cols-3 gap-4 max-w-xl">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <p className="text-xs font-bold text-purple-300 uppercase">1. Administrador</p>
              <p className="text-xs text-indigo-100/80 mt-1">
                Gestión de cuentas, seguridad global, asignación de roles y supervisión general.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <p className="text-xs font-bold text-emerald-300 uppercase">2. Líder de Proyecto</p>
              <p className="text-xs text-indigo-100/80 mt-1">
                Registra a los integrantes del equipo, delega tareas, administra el Gantt y aprueba entregas.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <p className="text-xs font-bold text-amber-300 uppercase">3. Equipo / Integrantes</p>
              <p className="text-xs text-indigo-100/80 mt-1">
                Ingresan con su cuenta asignada, consultan tareas, reportan avances y adjuntan evidencias.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-indigo-200/70">
          <span>Autenticación Cifrada JWT + Políticas RLS</span>
          <span>Protección Anti-Fuerza Bruta y Control de Sesiones</span>
        </div>
      </div>

      {/* Panel derecho de Inicio de Sesión Seguro */}
      <div className="lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="max-w-md w-full space-y-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>Portal de Acceso Autorizado</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {mode === 'login' ? 'Iniciar sesión en tu cuenta' : 'Recuperación de contraseña'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {mode === 'login'
                ? 'Ingresa con el correo y contraseña asignados para cargar tu perfil de Administrador, Líder o Integrante del Equipo.'
                : 'Ingresa tu correo registrado en el proyecto para recibir el enlace de restablecimiento.'}
            </p>
          </div>

          {/* Pestañas: Solo Iniciar Sesión y Recuperar Clave */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
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
              Recuperar Contraseña
            </button>
          </div>

          {lockoutRemaining > 0 && (
            <div className="p-4 rounded-xl bg-rose-100 dark:bg-rose-950/70 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
              <div>
                <p className="font-bold">Bloqueo Temporal de Seguridad Activo</p>
                <p className="mt-0.5">
                  Demasiados intentos fallidos. Podrás volver a intentar en{' '}
                  <strong>{lockoutRemaining} segundos</strong>.
                </p>
              </div>
            </div>
          )}

          {errorMsg && lockoutRemaining === 0 && (
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
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Correo Electrónico Registrado
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="usuario@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={lockoutRemaining > 0}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                />
              </div>
            </div>

            {mode === 'login' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Contraseña de Acceso
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={lockoutRemaining > 0}
                    className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || lockoutRemaining > 0}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <span>
                {submitting
                  ? 'Verificando credenciales y rol...'
                  : mode === 'login'
                  ? 'Ingresar a la Plataforma'
                  : 'Enviar Enlace de Recuperación'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Aviso de seguridad sobre el registro controlado por el Líder */}
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1.5">
            <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Control de Acceso por el Líder del Proyecto
            </p>
            <p className="leading-relaxed">
              El registro público está deshabilitado por seguridad. El <strong>Líder del Proyecto</strong> o el <strong>Administrador</strong> da de alta las cuentas de cada integrante desde el módulo <em>Equipo y Configuración</em> asignándole su rol correspondiente.
            </p>
          </div>

          {/* En modo sin Supabase conectado, permite probar las cuentas semilla */}
          {!isSupabaseConfigured && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Cuentas de Verificación Local por Rol
              </span>
              {profiles.map((p) => {
                const rBadge = ROLE_CONFIG[p.role];
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleQuickDemoAccess(p)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 flex items-center justify-between text-left transition-all"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {p.full_name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">{p.email}</p>
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
          )}
        </div>
      </div>
    </div>
  );
}
