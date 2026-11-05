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
  GraduationCap,
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

  // Solo 'login' y 'recover'
  const [mode, setMode] = useState('login');
  const [targetPortal, setTargetPortal] = useState('auto'); // 'auto' | 'sigma' | 'estudio'
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

        if (
          loginRes?.isStudyOnly ||
          loginRes?.profile?.role === 'colaborador_estudio' ||
          targetPortal === 'estudio'
        ) {
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
                Plataforma Colaborativa de Gestión de Proyectos y Estudio Personal
              </span>
            </div>
          </div>

          <div className="mt-12 max-w-lg space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 border border-emerald-400/30 text-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              Acceso Seguro por Rol • RLS PostgreSQL Activo
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Planificación, delegación y trazabilidad total para equipos y estudio.
            </h1>
            <p className="text-indigo-100/85 text-sm sm:text-base leading-relaxed">
              El acceso a la plataforma es exclusivo para los miembros autorizados. Al iniciar sesión con tu cuenta, el sistema identifica automáticamente si perteneces al Proyecto SIGMA, a Estudio Personal o a ambos.
            </p>
          </div>

          {/* Tarjetas de los roles de ambos entornos */}
          <div className="mt-8 grid sm:grid-cols-2 gap-3 max-w-xl">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <p className="text-xs font-bold text-purple-300 uppercase">1. Administrador General</p>
              <p className="text-xs text-indigo-100/80 mt-1">
                Acceso total a ambos entornos (Proyecto SIGMA y Estudio Personal).
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <p className="text-xs font-bold text-emerald-300 uppercase">2. Líder de Proyecto</p>
              <p className="text-xs text-indigo-100/80 mt-1">
                Administra el proyecto SIGMA, asigna tareas y aprueba entregas.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
              <p className="text-xs font-bold text-amber-300 uppercase">3. Equipo SIGMA</p>
              <p className="text-xs text-indigo-100/80 mt-1">
                Consultas de tareas, registro de avances y evidencias del proyecto.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-400/20 backdrop-blur-xs">
              <p className="text-xs font-bold text-purple-200 uppercase flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                4. Colaboradores de Estudio
              </p>
              <p className="text-xs text-indigo-100/80 mt-1">
                Acceso exclusivo al entorno académico (cronograma, avances y documentos).
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
                ? 'Ingresa con el correo y contraseña asignados para cargar tu perfil de Administrador, Integrante de SIGMA o Colaborador de Estudio.'
                : 'Ingresa tu correo registrado en la plataforma para recibir el enlace de restablecimiento.'}
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

          {/* Selector de entorno de destino para el login */}
          {mode === 'login' && (
            <div className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 px-2 py-1">
                <span>Destino de acceso:</span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                  {targetPortal === 'estudio'
                    ? '🎓 Estudio Personal'
                    : targetPortal === 'sigma'
                    ? '🏢 Proyecto SIGMA'
                    : '✨ Detección Automática'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={() => setTargetPortal('auto')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                    targetPortal === 'auto'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  ✨ Auto
                </button>
                <button
                  type="button"
                  onClick={() => setTargetPortal('sigma')}
                  className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                    targetPortal === 'sigma'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>🏢 SIGMA</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTargetPortal('estudio')}
                  className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                    targetPortal === 'estudio'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Estudio</span>
                </button>
              </div>
            </div>
          )}

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
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
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
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <span>
                {targetPortal === 'estudio'
                  ? 'Ingresar a Estudio Personal →'
                  : targetPortal === 'sigma'
                  ? 'Ingresar a Proyecto SIGMA →'
                  : 'Ingresar a la Plataforma →'}
              </span>
            </button>
          </form>

          {/* Selector de cuenta para pruebas en modo sin Supabase */}
          {!isSupabaseConfigured && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
              <p className="text-slate-500 dark:text-slate-400 mb-2 font-medium flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
                Acceso rápido demo (simular cuenta):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {profiles
                  .filter((p) => p.is_active)
                  .map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleQuickDemoAccess(p)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold transition-colors"
                    >
                      {p.full_name} ({ROLE_CONFIG[p.role]?.label})
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
