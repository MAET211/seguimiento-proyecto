import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  LayoutDashboard,
  CalendarRange,
  Award,
  FileText,
  Users,
  TrendingUp,
  ShieldCheck,
  Lock,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';
import {
  PersonalStudyProvider,
  usePersonalStudy,
} from '../context/PersonalStudyContext';
import StudyDashboardTab from '../components/study/StudyDashboardTab';
import StudyScheduleTab from '../components/study/StudyScheduleTab';
import StudyAdvancesTab from '../components/study/StudyAdvancesTab';
import StudyDocumentsTab from '../components/study/StudyDocumentsTab';
import StudyCollaboratorsTab from '../components/study/StudyCollaboratorsTab';
import StudyLearningTrackingTab from '../components/study/StudyLearningTrackingTab';

function PersonalStudyInner() {
  const navigate = useNavigate();
  const { hasStudyAccess, activeSpace, myStudyRole, isStudyOwner } =
    usePersonalStudy();

  const [activeTab, setActiveTab] = useState('dashboard');

  // Si el usuario no tiene acceso (integrante de SIGMA sin invitación)
  if (!hasStudyAccess) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
              Acceso Restringido • Espacio Privado
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">
              Estudio Personal Privado
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Este módulo funciona como un entorno 100% independiente del proyecto SIGMA.
              Por políticas de privacidad, los integrantes del proyecto no tienen acceso automático.
              Para ingresar debes recibir una invitación expresa del propietario de la cuenta.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigate('/')}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al Proyecto Principal SIGMA</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    {
      id: 'dashboard',
      label: 'Panel de Estudio',
      icon: LayoutDashboard,
    },
    {
      id: 'cronograma',
      label: 'Cronograma Académico',
      icon: CalendarRange,
    },
    {
      id: 'avances',
      label: 'Avances Diarios',
      icon: Award,
    },
    {
      id: 'documentos',
      label: 'Documentación y Recursos',
      icon: FileText,
    },
    {
      id: 'colaboradores',
      label: 'Colaboradores y Permisos',
      icon: Users,
    },
    {
      id: 'seguimiento',
      label: 'Seguimiento del Aprendizaje',
      icon: TrendingUp,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Barra de Control de Entorno: Estudio Personal vs Proyecto SIGMA */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Entorno: Estudio Personal
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                Privado
              </span>
              <span className="text-xs font-semibold text-slate-400">
                • Rol: {isStudyOwner ? 'Propietario' : myStudyRole?.toUpperCase()}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Espacio académico desacoplado de las tareas y cronograma de SIGMA
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al Proyecto SIGMA</span>
        </button>
      </div>

      {/* Navegación por Pestañas del Módulo Estudio Personal */}
      <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/25'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Renderizado de la Vista Activa */}
      {activeTab === 'dashboard' && (
        <StudyDashboardTab onNavigateTab={(tabKey) => setActiveTab(tabKey)} />
      )}
      {activeTab === 'cronograma' && <StudyScheduleTab />}
      {activeTab === 'avances' && <StudyAdvancesTab />}
      {activeTab === 'documentos' && <StudyDocumentsTab />}
      {activeTab === 'colaboradores' && <StudyCollaboratorsTab />}
      {activeTab === 'seguimiento' && <StudyLearningTrackingTab />}
    </div>
  );
}

export default function PersonalStudyPage() {
  return (
    <PersonalStudyProvider>
      <PersonalStudyInner />
    </PersonalStudyProvider>
  );
}
