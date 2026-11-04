export const ROLE_CONFIG = {
  admin: {
    label: 'Administrador',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
    dotClass: 'bg-purple-500',
  },
  lider: {
    label: 'Líder del Proyecto',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800',
    dotClass: 'bg-indigo-500',
  },
  integrante: {
    label: 'Integrante',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    dotClass: 'bg-emerald-500',
  },
};

export const TASK_STATUS_CONFIG = {
  pendiente: {
    label: 'Pendiente',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    barClass: 'bg-slate-400',
  },
  en_proceso: {
    label: 'En proceso',
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800',
    barClass: 'bg-sky-500',
  },
  en_revision: {
    label: 'En revisión',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    barClass: 'bg-amber-500',
  },
  completada: {
    label: 'Completada',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    barClass: 'bg-emerald-500',
  },
  devuelta: {
    label: 'Devuelta para correcciones',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
    barClass: 'bg-rose-500',
  },
  retrasada: {
    label: 'Retrasada',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
    barClass: 'bg-rose-500',
  },
};

export const PRIORITY_CONFIG = {
  baja: {
    label: 'Baja',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
  },
  media: {
    label: 'Media',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
  },
  alta: {
    label: 'Alta',
    badgeClass: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800',
  },
  critica: {
    label: 'Crítica',
    badgeClass: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800',
  },
};

export const REPO_CATEGORY_CONFIG = {
  repo_principal: {
    label: 'Repositorio Principal GitHub',
    badgeClass: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300',
  },
  repo_secundario: {
    label: 'Repositorio Secundario',
    badgeClass: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
  },
  rama: {
    label: 'Enlace a Rama (Branch)',
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
  },
  pull_request: {
    label: 'Pull Request (PR)',
    badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300',
  },
  issue: {
    label: 'Issue / Ticket',
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
  },
  documentacion: {
    label: 'Documentación Técnica',
    badgeClass: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300',
  },
  diseno_prototipo: {
    label: 'Diseños y Prototipos',
    badgeClass: 'bg-pink-100 text-pink-800 dark:bg-pink-950/60 dark:text-pink-300',
  },
  requerimientos: {
    label: 'Documento de Requerimientos',
    badgeClass: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300',
  },
};

export function formatDate(dateStr) {
  if (!dateStr) return 'Sin fecha';
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${day} ${months[parseInt(month, 10) - 1]} ${year}`;
}

export function formatDateTime(isoStr) {
  if (!isoStr) return '';
  try {
    const date = new Date(isoStr);
    return date.toLocaleString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoStr;
  }
}

export function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
}
