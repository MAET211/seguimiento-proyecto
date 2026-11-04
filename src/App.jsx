import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProjectProvider, useProject } from './context/ProjectContext';
import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import WorkPlanPage from './pages/WorkPlanPage';
import ChangelogPage from './pages/ChangelogPage';
import RepositoriesPage from './pages/RepositoriesPage';
import AdminTeamPage from './pages/AdminTeamPage';

function ProtectedRoute({ children }) {
  const { currentUser, loading } = useProject();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-200 gap-3">
        <div className="w-10 h-10 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
        <p className="text-sm font-semibold">Cargando plataforma y sesión...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <ProjectProvider>
      {/* HashRouter garantiza compatibilidad nativa con GitHub Pages sin errores 404 al recargar rutas */}
      <HashRouter>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="tareas" element={<TasksPage />} />
            <Route path="plan-trabajo" element={<WorkPlanPage />} />
            <Route path="novedades" element={<ChangelogPage />} />
            <Route path="repositorios" element={<RepositoriesPage />} />
            <Route path="administracion" element={<AdminTeamPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </ProjectProvider>
  );
}
