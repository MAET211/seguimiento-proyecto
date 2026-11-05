import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  CalendarRange,
  History,
  GitBranch,
  Users,
  Bell,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  Database,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  GraduationCap,
  Award,
  FileText,
  TrendingUp,
  ArrowLeft,
} from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { usePersonalStudy } from '../context/PersonalStudyContext';
import { ROLE_CONFIG, formatDateTime, getInitials } from '../utils/formatters';
import {
  supabaseUrl,
  setRuntimeSupabaseCredentials,
  clearRuntimeSupabaseCredentials,
} from '../lib/supabase';

export default function Layout() {
  const {
    darkMode,
    setDarkMode,
    isSupabaseConfigured,
    currentUser,
    profiles,
    metrics,
    myNotifications,
    unreadNotificationsCount,
    markNotificationRead,
    markAllMyNotificationsRead,
    clearNotification,
    switchActiveRoleUser,
    logout,
    seedInitialDataToSupabase,
  } = useProject();

  const navigate = useNavigate();
  const location = useLocation();
  const {
    hasStudyAccess,
    hasSigmaAccess,
    isNexusAdmin,
    myStudyRole,
    metrics: studyMetrics,
  } = usePersonalStudy();

  const isStudyEnv = location.pathname.startsWith('/estudio-personal');

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Estado del formulario de conexión rápida a Supabase
  const [inputUrl, setInputUrl] = useState(supabaseUrl || '');
  const [inputAnonKey, setInputAnonKey] = useState('');
  const [seeding, setSeeding] = useState(false);

  const roleBadge = ROLE_CONFIG[currentUser?.role || 'integrante'];

  // Navegación para el entorno del proyecto SIGMA
  const navItems = [
    {
      to: '/',
      label: 'Dashboard Principal',
      icon: LayoutDashboard,
      end: true,
    },
    {
      to: '/tareas',
      label: 'Tareas y Responsabilidades',
      icon: CheckSquare,
      badge:
        currentUser?.role === 'lider' || currentUser?.role === 'admin'
          ? metrics.inReviewTasks > 0
            ? `${metrics.inReviewTasks} rev.`
            : metrics.totalTasks
          : metrics.totalTasks,
      badgeHighlight:
        (currentUser?.role === 'lider' || currentUser?.role === 'admin') &&
        metrics.inReviewTasks > 0,
    },
    {
      to: '/plan-trabajo',
      label: 'Plan de Trabajo (Gantt)',
      icon: CalendarRange,
    },
    {
      to: '/novedades',
      label: 'Novedades y Trazabilidad',
      icon: History,
    },
    {
      to: '/repositorios',
      label: 'Repositorios y Recursos',
      icon: GitBranch,
    },
    {
      to: '/administracion',
      label:
        currentUser?.role === 'admin'
          ? 'Usuarios y Administración'
          : currentUser?.role === 'lider'
          ? 'Equipo y Configuración'
          : 'Equipo y Mi Perfil',
      icon: Users,
    },
  ];

  // Navegación exclusiva para el entorno de Estudio Personal
  const studyNavItems = [
    {
      to: '/estudio-personal',
      label: 'Panel de Estudio',
      icon: LayoutDashboard,
      end: true,
    },
    {
      to: '/estudio-personal/cronograma',
      label: 'Cronograma Académico',
      icon: CalendarRange,
    },
    {
      to: '/estudio-personal/avances',
      label: 'Avances Diarios',
      icon: Award,
    },
    {
      to: '/estudio-personal/documentos',
      label: 'Documentación y Recursos',
      icon: FileText,
    },
    {
      to: '/estudio-personal/colaboradores',
      label: 'Colaboradores y Permisos',
      icon: Users,
    },
    {
      to: '/estudio-personal/seguimiento',
      label: 'Seguimiento del Aprendizaje',
      icon: TrendingUp,
    },
  ];

  const handleConnectRuntimeSupabase = (e) => {
    e.preventDefault();
    if (!inputUrl.startsWith('https://') || inputAnonKey.length < 20) return;
    setRuntimeSupabaseCredentials(inputUrl, inputAnonKey);
  };

  const handleSeedSupabase = async () => {
    setSeeding(true);
    try {
      await seedInitialDataToSupabase();
      setSupabaseModalOpen(false);
    } catch (err) {
      alert('Error al inicializar datos en Supabase: ' + err.message);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Overlay móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Barra lateral de navegación */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Cabecera de marca conmutada según entorno */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold shadow-sm transition-all ${
                isStudyEnv
                  ? 'bg-gradient-to-br from-purple-600 to-indigo-600 shadow-purple-500/30'
                  : 'bg-gradient-to-br from-indigo-600 to-violet-600 shadow-indigo-500/30'
              }`}
            >
              {isStudyEnv ? <GraduationCap className="w-5 h-5 text-white" /> : 'NP'}
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white block leading-none">
                {isStudyEnv ? 'Estudio Personal' : 'NexusPM'}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {isStudyEnv ? 'Espacio Académico Privado' : 'Gestión Colaborativa — SIGMA'}
              </span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Botón rápido para alternar a SIGMA cuando se navega dentro de Estudio Personal */}
        {isStudyEnv && hasSigmaAccess && (
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-purple-50/40 dark:bg-purple-950/20">
            <button
              onClick={() => {
                setSidebarOpen(false);
                navigate('/');
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-purple-700 dark:text-purple-300 bg-white dark:bg-slate-900 hover:bg-purple-100 dark:hover:bg-purple-900/40 border border-purple-200 dark:border-purple-800/80 transition-all shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a Proyecto SIGMA</span>
            </button>
          </div>
        )}

        {/* Tarjeta resumida del usuario activo y rol en el entorno correspondiente */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full border font-bold text-sm flex items-center justify-center shrink-0 ${
                isStudyEnv
                  ? 'bg-purple-600/10 dark:bg-purple-500/20 border-purple-500/30 text-purple-700 dark:text-purple-300'
                  : 'bg-indigo-600/10 dark:bg-indigo-500/20 border-indigo-500/30 text-indigo-700 dark:text-indigo-300'
              }`}
            >
              {getInitials(currentUser?.full_name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                {currentUser?.full_name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {currentUser?.specialty || currentUser?.email}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            {isStudyEnv ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-purple-100/70 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-600 dark:bg-purple-400" />
                {isNexusAdmin
                  ? 'Admin General'
                  : myStudyRole === 'admin'
                  ? 'Administrador'
                  : myStudyRole === 'editor'
                  ? 'Editor'
                  : 'Lector'}
              </span>
            ) : (
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleBadge.badgeClass}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${roleBadge.dotClass}`} />
                {roleBadge.label}
              </span>
            )}
            <button
              onClick={() => setProfileModalOpen(true)}
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Editar perfil
            </button>
          </div>
        </div>

        {/* Enlaces de navegación principal (aislados por entorno) */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {isStudyEnv ? 'Módulos de Estudio' : 'Módulos del Proyecto'}
          </p>

          {/* Si está en Estudio Personal, solo muestra la navegación de Estudio Personal */}
          {isStudyEnv ? (
            studyNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/25'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-purple-50/60 dark:hover:bg-purple-950/40'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                </NavLink>
              );
            })
          ) : (
            // Si está en SIGMA, muestra los 6 módulos de SIGMA intactos
            <>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`px-2 py-0.5 text-[11px] rounded-full font-semibold ${
                          item.badgeHighlight
                            ? 'bg-amber-400 text-slate-950 animate-pulse'
                            : 'bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}

              {/* ENLACE A ESTUDIO PERSONAL: ÚNICA Y EXCLUSIVAMENTE SI EL USUARIO TIENE ACCESO AUTORIZADO */}
              {hasStudyAccess && (
                <div className="pt-3 mt-2 border-t border-slate-200/80 dark:border-slate-800">
                  <div className="px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
                    <span>Espacio Académico</span>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      Privado
                    </span>
                  </div>
                  <NavLink
                    to="/estudio-personal"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all mt-1 bg-purple-50/70 dark:bg-purple-950/30 hover:bg-purple-100/70 dark:hover:bg-purple-900/40 text-purple-800 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60 group"
                  >
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-4 h-4 shrink-0 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
                      <span className="font-semibold">Estudio Personal</span>
                    </div>
                    <span className="px-1.5 py-0.5 text-[10px] rounded font-bold bg-purple-600 text-white">
                      Entrar →
                    </span>
                  </NavLink>
                </div>
              )}
            </>
          )}
        </nav>

        {/* Estado de conexión a Supabase y botón de configuración */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <button
            onClick={() => setSupabaseModalOpen(true)}
            className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
              isSupabaseConfigured
                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300'
                : 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/80 text-indigo-900 dark:text-indigo-200'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Database className="w-4 h-4 shrink-0" />
              <div className="truncate">
                <p className="text-xs font-semibold">
                  {isSupabaseConfigured ? 'Supabase Conectado' : 'Pre-conexión Supabase'}
                </p>
                <p className="text-[11px] opacity-80 truncate">
                  {isSupabaseConfigured
                    ? 'Sincronización PostgreSQL activa'
                    : 'Clic para configurar URL y Anon Key'}
                </p>
              </div>
            </div>
            <ShieldCheck className="w-4 h-4 shrink-0 opacity-75" />
          </button>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenedor derecho principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Barra superior (Header) */}
        <header className="h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Selector rápido de cuenta/rol para verificar todos los permisos en el entorno actual */}
            {!isSupabaseConfigured && (
              <div className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <UserCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  Simular cuenta / Rol:
                </span>
                <select
                  value={currentUser?.id || ''}
                  onChange={(e) => switchActiveRoleUser(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                >
                  {profiles
                    .filter((p) => p.is_active)
                    .map((p) => (
                      <option
                        key={p.id}
                        value={p.id}
                        className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      >
                        {p.full_name} — [{ROLE_CONFIG[p.role]?.label}]
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>

          {/* Controles derechos: Progreso global rápido, Notificaciones, Modo Oscuro */}
          <div className="flex items-center gap-2.5">
            {/* Indicador compacto de avance conmutado por entorno */}
            <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {isStudyEnv ? 'Progreso académico:' : 'Avance global:'}
              </span>
              <div className="w-20 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isStudyEnv ? 'bg-purple-600 dark:bg-purple-500' : 'bg-indigo-600 dark:bg-indigo-500'
                  }`}
                  style={{
                    width: `${isStudyEnv ? studyMetrics.overallProgress : metrics.overallProgress}%`,
                  }}
                />
              </div>
              <span
                className={`text-xs font-bold ${
                  isStudyEnv
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-indigo-600 dark:text-indigo-400'
                }`}
              >
                {isStudyEnv ? studyMetrics.overallProgress : metrics.overallProgress}%
              </span>
            </div>

            {/* Botón de Notificaciones */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Notificaciones del equipo"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Panel desplegable de Notificaciones */}
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden">
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Notificaciones
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {unreadNotificationsCount} sin leer para {currentUser?.full_name}
                      </p>
                    </div>
                    {unreadNotificationsCount > 0 && (
                      <button
                        onClick={markAllMyNotificationsRead}
                        className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Marcar leídas
                      </button>
                    )}
                  </div>

                  <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {myNotifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 dark:text-slate-500 text-xs">
                        No tienes notificaciones registradas en este momento.
                      </div>
                    ) : (
                      myNotifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3.5 transition-colors flex gap-3 ${
                            !n.is_read
                              ? 'bg-indigo-50/50 dark:bg-indigo-950/25'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                              !n.is_read ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-900 dark:text-white">
                              {n.title}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                              {n.message}
                            </p>
                            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                              <span>{formatDateTime(n.created_at)}</span>
                              <div className="flex items-center gap-2">
                                {!n.is_read && (
                                  <button
                                    onClick={() => markNotificationRead(n.id)}
                                    className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                                  >
                                    Leída
                                  </button>
                                )}
                                <button
                                  onClick={() => clearNotification(n.id)}
                                  className="text-rose-500 hover:underline"
                                >
                                  Borrar
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Botón Modo Claro / Oscuro */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Selector móvil de rol en modo verificación */}
        {!isSupabaseConfigured && (
          <div className="sm:hidden bg-indigo-50/80 dark:bg-indigo-950/40 px-4 py-2 border-b border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-indigo-900 dark:text-indigo-200">
              Rol activo:
            </span>
            <select
              value={currentUser?.id || ''}
              onChange={(e) => switchActiveRoleUser(e.target.value)}
              className="bg-white dark:bg-slate-900 text-xs font-semibold px-2.5 py-1 rounded-lg border border-indigo-200 dark:border-indigo-800"
            >
              {profiles
                .filter((p) => p.is_active)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name} ({ROLE_CONFIG[p.role]?.label})
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* Contenido dinámico de cada módulo */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Modal: Estado y Configuración de Conexión a Supabase */}
      {supabaseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Conexión con Supabase PostgreSQL & Auth
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Configuración para persistencia centralizada y despliegue en GitHub Pages
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSupabaseModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
              <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Arquitectura Lista para Producción:
              </p>
              <p>
                1. Ejecuta el script <code className="font-mono text-indigo-600 dark:text-indigo-400">supabase/schema.sql</code> en el SQL Editor de tu proyecto Supabase.
              </p>
              <p>
                2. Configura tus variables <code className="font-mono">VITE_SUPABASE_URL</code> y <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> en el archivo <code className="font-mono">.env</code> o ingrésalas aquí para conectar de inmediato.
              </p>
            </div>

            <form onSubmit={handleConnectRuntimeSupabase} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Project URL (VITE_SUPABASE_URL)
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://xyzcompany.supabase.co"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Clave Pública Anon (VITE_SUPABASE_ANON_KEY)
                </label>
                <input
                  type="password"
                  required
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={inputAnonKey}
                  onChange={(e) => setInputAnonKey(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Nunca ingreses la clave secreta <code>service_role</code>. La seguridad opera mediante políticas RLS.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
                {isSupabaseConfigured && (
                  <>
                    <button
                      type="button"
                      onClick={handleSeedSupabase}
                      disabled={seeding}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      {seeding ? 'Inicializando...' : 'Inicializar Proyecto Base en DB'}
                    </button>
                    <button
                      type="button"
                      onClick={clearRuntimeSupabaseCredentials}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-rose-300 text-rose-600 hover:bg-rose-50"
                    >
                      Volver a Modo Verificación Local
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setSupabaseModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Conectar a Supabase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edición Rápida de Perfil del Usuario */}
      {profileModalOpen && (
        <ProfileQuickModal onClose={() => setProfileModalOpen(false)} />
      )}
    </div>
  );
}

function ProfileQuickModal({ onClose }) {
  const { currentUser, updateMyProfile } = useProject();
  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [specialty, setSpecialty] = useState(currentUser?.specialty || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [githubUsername, setGithubUsername] = useState(currentUser?.github_username || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateMyProfile({
        full_name: fullName,
        specialty,
        phone,
        github_username: githubUsername,
      });
      onClose();
    } catch (err) {
      alert('Error al actualizar perfil: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Mi Perfil de Usuario
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Nombre Completo
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Cargo / Especialidad en el Proyecto
            </label>
            <input
              type="text"
              required
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Usuario de GitHub
              </label>
              <input
                type="text"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                placeholder="ej: usuario-dev"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Teléfono / Contacto
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+57 300..."
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950"
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
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
