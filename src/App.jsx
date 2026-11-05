import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { PersonalStudyProvider, usePersonalStudy } from './context/PersonalStudyContext';
import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import WorkPlanPage from './pages/WorkPlanPage';
import ChangelogPage from './pages/ChangelogPage';
import RepositoriesPage from './pages/RepositoriesPage';
import AdminTeamPage from './pages/AdminTeamPage';
import PersonalStudyPage from './pages/PersonalStudyPage';

/**
 * Guardia de seguridad de historial del navegador (flechas Atrás / Adelante de Chrome):
 * - Si el usuario tiene sesión activa e intenta regresar a /login con la flecha Atrás, lo mantiene dentro de la plataforma.
 * - Si el usuario NO tiene sesión activa e intenta regresar al Dashboard con la flecha Atrás/Adelante, lo fuerza a /login.
 */
function NavigationSecurityGuard() {
  const { currentUser, loading } = useProject();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (currentUser && location.pathname === '/login') {
      navigate('/', { replace: true });
    } else if (!currentUser && location.pathname !== '/login') {
      navigate('/login', { replace: true });
    }
  }, [currentUser, loading, location.pathname, navigate]);

  useEffect(() => {
    if (loading) return;

    const handlePopState = () => {
      const currentHash = window.location.hash || '#/';
      if (currentUser && currentHash.startsWith('#/login')) {
        // Evitar que con la flecha Atrás salte del Dashboard al Login teniendo sesión activa
        navigate('/', { replace: true });
      } else if (!currentUser && !currentHash.startsWith('#/login')) {
        // Evitar que con la flecha Atrás/Adelante salte del Login al Dashboard sin sesión
        navigate('/login', { replace: true });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentUser, loading, navigate]);

  return null;
}

function ProtectedRoute({ children }) {
  const { currentUser, loading } = useProject();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
        <p className="text-sm font-semibold">Verificando sesión y permisos de seguridad...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function PublicOnlyRoute({ children }) {
  const { currentUser, loading } = useProject();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
        <p className="text-sm font-semibold">Verificando sesión activa...</p>
      </div>
    );
  }

  // Si ya inició sesión, bloquear el acceso a /login (incluso con la flecha regresar de Chrome)
  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  return children;
}

/**
 * Guardia de ruta para el entorno SIGMA:
 * - Si el usuario es un participante exclusivo de Estudio Personal y no pertenece a SIGMA,
 *   lo redirige automáticamente a su entorno de estudio.
 */
function SigmaRouteGuard({ children }) {
  const { hasSigmaAccess, isNexusAdmin } = usePersonalStudy();
  if (!isNexusAdmin && !hasSigmaAccess) {
    return <Navigate to="/estudio-personal" replace />;
  }
  return children;
}

/**
 * Guardia de ruta para el entorno de Estudio Personal:
 * - Si el usuario es un integrante de SIGMA sin invitación o autorización expresa,
 *   lo bloquea y redirige a la raíz de SIGMA.
 */
function StudyRouteGuard({ children }) {
  const { hasStudyAccess } = usePersonalStudy();
  if (!hasStudyAccess) {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <ProjectProvider>
      <PersonalStudyProvider>
        <HashRouter>
          <NavigationSecurityGuard />
          <Routes>
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <AuthPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              {/* Rutas exclusivas del Entorno SIGMA (Proyecto Principal) */}
              <Route
                index
                element={
                  <SigmaRouteGuard>
                    <DashboardPage />
                  </SigmaRouteGuard>
                }
              />
              <Route
                path="tareas"
                element={
                  <SigmaRouteGuard>
                    <TasksPage />
                  </SigmaRouteGuard>
                }
              />
              <Route
                path="plan-trabajo"
                element={
                  <SigmaRouteGuard>
                    <WorkPlanPage />
                  </SigmaRouteGuard>
                }
              />
              <Route
                path="novedades"
                element={
                  <SigmaRouteGuard>
                    <ChangelogPage />
                  </SigmaRouteGuard>
                }
              />
              <Route
                path="repositorios"
                element={
                  <SigmaRouteGuard>
                    <RepositoriesPage />
                  </SigmaRouteGuard>
                }
              />
              <Route
                path="administracion"
                element={
                  <SigmaRouteGuard>
                    <AdminTeamPage />
                  </SigmaRouteGuard>
                }
              />

              {/* Rutas exclusivas del Entorno Estudio Personal (Entorno 2 Desacoplado) */}
              <Route
                path="estudio-personal"
                element={
                  <StudyRouteGuard>
                    <PersonalStudyPage initialTab="dashboard" />
                  </StudyRouteGuard>
                }
              />
              <Route
                path="estudio-personal/cronograma"
                element={
                  <StudyRouteGuard>
                    <PersonalStudyPage initialTab="cronograma" />
                  </StudyRouteGuard>
                }
              />
              <Route
                path="estudio-personal/avances"
                element={
                  <StudyRouteGuard>
                    <PersonalStudyPage initialTab="avances" />
                  </StudyRouteGuard>
                }
              />
              <Route
                path="estudio-personal/documentos"
                element={
                  <StudyRouteGuard>
                    <PersonalStudyPage initialTab="documentos" />
                  </StudyRouteGuard>
                }
              />
              <Route
                path="estudio-personal/colaboradores"
                element={
                  <StudyRouteGuard>
                    <PersonalStudyPage initialTab="colaboradores" />
                  </StudyRouteGuard>
                }
              />
              <Route
                path="estudio-personal/seguimiento"
                element={
                  <StudyRouteGuard>
                    <PersonalStudyPage initialTab="seguimiento" />
                  </StudyRouteGuard>
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </HashRouter>
      </PersonalStudyProvider>
    </ProjectProvider>
  );
}
