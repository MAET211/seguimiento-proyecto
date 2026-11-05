import React, { useMemo } from 'react';
import {
  TrendingUp,
  Award,
  CheckCircle2,
  Clock,
  BookOpen,
  Target,
  BarChart2,
  Sparkles,
} from 'lucide-react';
import { usePersonalStudy } from '../../context/PersonalStudyContext';

export default function StudyLearningTrackingTab() {
  const { activities, advances, metrics } = usePersonalStudy();

  // Agrupación por materias
  const subjectStats = useMemo(() => {
    const map = {};
    activities.forEach((act) => {
      const sub = act.subject || 'General';
      if (!map[sub]) {
        map[sub] = {
          name: sub,
          total: 0,
          completed: 0,
          inProgress: 0,
          pending: 0,
          totalHours: 0,
          completedHours: 0,
        };
      }
      map[sub].total += 1;
      map[sub].totalHours += Number(act.hours || 0);
      if (act.status === 'completada') {
        map[sub].completed += 1;
        map[sub].completedHours += Number(act.hours || 0);
      } else if (act.status === 'en_desarrollo') {
        map[sub].inProgress += 1;
      } else {
        map[sub].pending += 1;
      }
    });

    return Object.values(map);
  }, [activities]);

  const totalObjectives = useMemo(() => {
    return activities.filter((a) => a.objectives && a.objectives.trim().length > 0).length;
  }, [activities]);

  const achievedObjectives = useMemo(() => {
    return activities.filter(
      (a) => a.status === 'completada' && a.objectives && a.objectives.trim().length > 0
    ).length;
  }, [activities]);

  return (
    <div className="space-y-6">
      {/* Cabecera de Seguimiento del Aprendizaje */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            Analítica y Métricas Formativas
          </span>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
          Seguimiento del Aprendizaje y Cumplimiento de Metas
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Evaluación de progreso por materia, cumplimiento de objetivos pedagógicos y horas de dedicación efectiva.
        </p>
      </div>

      {/* Indicadores Generales de Rendimiento */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              Objetivos Académicos
            </span>
            <Target className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {achievedObjectives} / {totalObjectives}
          </p>
          <p className="text-xs text-slate-500">
            {totalObjectives > 0
              ? `${Math.round((achievedObjectives / totalObjectives) * 100)}% de metas alcanzadas`
              : 'Sin objetivos definidos'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              Horas de Estudio
            </span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {metrics.completedStudyHours} hrs
          </p>
          <p className="text-xs text-slate-500">
            De {metrics.totalStudyHours} horas planificadas en el cronograma
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              Efectividad Global
            </span>
            <TrendingUp className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {metrics.overallProgress}%
          </p>
          <p className="text-xs text-slate-500">
            Progreso general del ciclo académico
          </p>
        </div>
      </div>

      {/* Rendimiento por Materia / Eje Temático */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Avance Detallado por Materia y Eje Temático
        </h3>

        <div className="space-y-4">
          {subjectStats.map((sub) => {
            const pct = sub.total > 0 ? Math.round((sub.completed / sub.total) * 100) : 0;

            return (
              <div
                key={sub.name}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {sub.name}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {sub.completed} completadas • {sub.inProgress} en curso • {sub.pending} pendientes
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                      {pct}%
                    </span>
                    <p className="text-[11px] text-slate-400">
                      {sub.completedHours} de {sub.totalHours} hrs cumplidas
                    </p>
                  </div>
                </div>

                <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
