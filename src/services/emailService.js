/**
 * Servicio Centralizado de Notificaciones y Auditoría por Correo Electrónico
 * Proyecto: SIGMA - Sistema de Gestión de Ambulancias
 * Rol Emisor de Alto Rango: Líder del Proyecto / Administrador General
 */

const SYSTEM_NAME = 'SIGMA - Sistema de Gestión de Ambulancias';
const PLATFORM_URL = 'https://maet211.github.io/seguimiento-proyecto/';

export function generateAuditCode(prefix = 'SIGMA-AUDIT') {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export function getAuditTimestamp() {
  return new Date().toLocaleString('es-CO', {
    timeZone: 'America/Bogota',
    dateStyle: 'full',
    timeStyle: 'medium',
  });
}

/**
 * Genera el cuerpo formal de auditoría y membrete institucional de SIGMA
 */
export function buildAuditHeader({ leader, auditCode, actionTitle }) {
  const leaderName = leader?.full_name || 'Líder del Proyecto';
  const leaderRole =
    leader?.role === 'admin'
      ? 'Administrador General'
      : 'Líder del Proyecto / Administrador General';
  const leaderEmail = leader?.email || 'lider@sigma.com';
  const timestamp = getAuditTimestamp();

  return `===============================================================
SISTEMA DE GESTIÓN Y SEGUIMIENTO: ${SYSTEM_NAME}
AUDITORÍA OFICIAL Y TRAZABILIDAD DE SEGURIDAD
===============================================================
Código de Auditoría: ${auditCode}
Fecha y Hora Oficial: ${timestamp}
Autoridad Emisora: ${leaderName}
Cargo / Rango: ${leaderRole}
Correo Oficial: ${leaderEmail}
Acceso a Plataforma: ${PLATFORM_URL}
Acción Registrada: ${actionTitle}
---------------------------------------------------------------`;
}

/**
 * 1. Envío de notificación al correo de cada usuario cuando se agrega una
 * actividad en general al Plan de Trabajo (Gantt).
 */
export async function sendGeneralWorkPlanEmailNotification({
  activity,
  leader,
  activeProfiles = [],
}) {
  const auditCode = generateAuditCode('SIGMA-AUDIT-WP');
  const timestamp = getAuditTimestamp();
  const leaderName = leader?.full_name || 'Líder del Proyecto';
  const leaderRole =
    leader?.role === 'admin'
      ? 'Administrador General'
      : 'Líder del Proyecto / Administrador General';

  const recipientEmails = activeProfiles
    .filter((p) => p.is_active && p.email)
    .map((p) => p.email);

  const subject = `[SIGMA - Auditoría Oficial] Nueva Actividad Programada en Plan de Trabajo: ${activity.name}`;

  const textBody = `${buildAuditHeader({
    leader,
    auditCode,
    actionTitle: 'Incorporación de Actividad General al Plan de Trabajo (Cronograma)',
  })}

ESTIMADO EQUIPO DE DESARROLLO Y GESTIÓN:

Se les notifica formalmente que la autoridad de alto rango (${leaderName} - ${leaderRole}) ha programado una nueva actividad en el cronograma institucional de SIGMA:

• Fase / Etapa: ${activity.phase}
• Nombre de la Actividad: ${activity.name}
• Descripción: ${activity.description || 'Sin descripción adicional'}
• Responsable Asignado: ${activity.responsible_name || 'Equipo General'}
• Rango de Ejecución: ${activity.start_date} al ${activity.end_date}
• Nivel de Prioridad: ${(activity.priority || 'media').toUpperCase()}
• Estado Inicial: ${(activity.status || 'pendiente').toUpperCase()}

POLÍTICA DE TRAZABILIDAD Y AUDITORÍA:
Esta notificación ha sido enviada a todos los miembros activos del equipo (${recipientEmails.length} integrantes registrados). Todo avance debe ser registrado en la plataforma oficial:
${PLATFORM_URL}

Atentamente,
${leaderName}
${leaderRole}
${SYSTEM_NAME}
Código de verificación: ${auditCode}
`;

  // Construir mailto para difusión o cliente de correo
  const mailtoUrl = `mailto:${recipientEmails.join(',')}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(textBody)}`;

  return {
    success: true,
    auditCode,
    timestamp,
    recipientCount: recipientEmails.length,
    recipientEmails,
    subject,
    textBody,
    mailtoUrl,
  };
}

/**
 * 2. Envío de notificación por correo cuando se asigna una tarea en privado
 * a un desarrollador individual.
 */
export async function sendPrivateTaskAssignmentEmailNotification({
  task,
  leader,
  assigneeProfile,
}) {
  const auditCode = generateAuditCode('SIGMA-AUDIT-TSK');
  const timestamp = getAuditTimestamp();
  const leaderName = leader?.full_name || 'Líder del Proyecto';
  const leaderRole =
    leader?.role === 'admin'
      ? 'Administrador General'
      : 'Líder del Proyecto / Administrador General';

  const subject = `[SIGMA - Asignación Privada] Nueva Tarea Delegada por el Líder: ${task.title}`;

  const textBody = `${buildAuditHeader({
    leader,
    auditCode,
    actionTitle: 'Delegación Directa de Tarea a Desarrollador',
  })}

ESTIMADO(A) ${assigneeProfile?.full_name?.toUpperCase() || 'DESARROLLADOR'}:

El Líder del Proyecto y Administrador General (${leaderName}) le ha asignado formalmente la siguiente tarea con carácter privado y seguimiento estricto:

• Título de la Tarea: ${task.title}
• Fecha Límite de Entrega: ${task.due_date}
• Prioridad Asignada: ${(task.priority || 'media').toUpperCase()}
• Descripción General:
${task.description || 'N/A'}

${
  task.instructions
    ? `• Instrucciones Técnicas y Criterios de Aceptación:\n${task.instructions}\n`
    : ''
}
OBLIGACIONES DEL DESARROLLADOR:
1. Revisar los requerimientos en la plataforma: ${PLATFORM_URL}
2. Subir evidencias de entrega (enlace de repositorio, capturas o informe).
3. Solicitar revisión formal al Líder una vez finalizado el desarrollo.

Atentamente,
${leaderName}
${leaderRole}
${SYSTEM_NAME}
Sello de Auditoría: ${auditCode}
`;

  const mailtoUrl = `mailto:${assigneeProfile?.email || ''}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(textBody)}`;

  return {
    success: true,
    auditCode,
    timestamp,
    assigneeEmail: assigneeProfile?.email,
    subject,
    textBody,
    mailtoUrl,
  };
}

/**
 * 3. Envío de RECORDATORIO formal por correo a un desarrollador individual
 * desde el botón "Recordar" del Líder de Proyecto.
 */
export async function sendTaskReminderEmailNotification({
  task,
  leader,
  assigneeProfile,
  customNote = '',
}) {
  const auditCode = generateAuditCode('SIGMA-REMIND');
  const timestamp = getAuditTimestamp();
  const leaderName = leader?.full_name || 'Líder del Proyecto';
  const leaderRole =
    leader?.role === 'admin'
      ? 'Administrador General'
      : 'Líder del Proyecto / Administrador General';

  const subject = `[SIGMA - RECORDATORIO URGENTE] Seguimiento de Tarea: ${task.title}`;

  const textBody = `${buildAuditHeader({
    leader,
    auditCode,
    actionTitle: 'Recordatorio Formal de Entrega y Cumplimiento de Tarea',
  })}

ATENCIÓN: ${assigneeProfile?.full_name?.toUpperCase() || 'DESARROLLADOR'}:

El Líder de Proyecto (${leaderName}) ha emitido un RECORDATORIO FORMAL respecto a la siguiente tarea asignada a su cargo:

• Tarea: ${task.title}
• Fecha Límite de Entrega: ${task.due_date}
• Progreso Actual Registrado: ${task.progress || 0}%
• Estado Actual: ${(task.status || 'pendiente').toUpperCase()}

${
  customNote
    ? `INSTRUCCIÓN PUNTUAL DEL LÍDER:\n"${customNote}"\n\n`
    : 'Por favor actualice su avance y remita las evidencias pertinentes a la brevedad.\n\n'
}
Enlace directo de acceso:
${PLATFORM_URL}

Atentamente,
${leaderName}
${leaderRole}
${SYSTEM_NAME}
Código de Trazabilidad: ${auditCode}
`;

  const mailtoUrl = `mailto:${assigneeProfile?.email || ''}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(textBody)}`;

  return {
    success: true,
    auditCode,
    timestamp,
    assigneeEmail: assigneeProfile?.email,
    subject,
    textBody,
    mailtoUrl,
  };
}
