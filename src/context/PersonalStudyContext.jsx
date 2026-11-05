import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useProject } from './ProjectContext';
import {
  supabase,
  isSupabaseConfigured,
  createIsolatedSupabaseClient,
} from '../lib/supabase';
import {
  INITIAL_STUDY_SPACE,
  INITIAL_STUDY_ACTIVITIES,
  INITIAL_STUDY_ADVANCES,
  INITIAL_STUDY_DOCUMENTS,
} from '../data/initialStudySeed';

const PersonalStudyContext = createContext(null);

export const usePersonalStudy = () => {
  const ctx = useContext(PersonalStudyContext);
  if (!ctx) throw new Error('usePersonalStudy debe usarse dentro de un PersonalStudyProvider');
  return ctx;
};

export function PersonalStudyProvider({ children }) {
  const { currentUser, project } = useProject();

  const storageKey = 'NEXUS_STUDY_DATA_V4';

  const ownerName = currentUser?.full_name || 'Miguel Estrada torrente';
  const ownerEmail = currentUser?.email || 'miguelestrada@proyecto.com';
  const ownerId = currentUser?.id || 'usr-miguel-admin';

  // Estado del espacio de estudio (El propietario legítimo es Miguel Estrada torrente)
  const [activeSpace, setActiveSpace] = useState(() => {
    try {
      const saved = localStorage.getItem('NEXUS_STUDY_SPACE_V4');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return {
      ...INITIAL_STUDY_SPACE,
      owner_id: ownerId,
      owner_name: ownerName,
      owner_email: ownerEmail,
    };
  });

  // Lista de miembros autorizados: El Propietario Principal es estrictamente Miguel Estrada torrente
  const [members, setMembers] = useState(() => {
    try {
      const saved =
        localStorage.getItem('NEXUS_STUDY_MEMBERS_V4') ||
        localStorage.getItem('NEXUS_STUDY_MEMBERS_V3');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Filtrar y eliminar a Carlos Mendoza si existía previamente
        const filtered = parsed.filter(
          (m) =>
            !m.email?.toLowerCase().includes('admin@nexuspm.dev') &&
            !m.full_name?.toLowerCase().includes('carlos mendoza')
        );

        // Asegurar que Miguel Estrada torrente sea el propietario principal
        const hasOwner = filtered.some(
          (m) => m.is_owner || m.email?.toLowerCase() === ownerEmail.toLowerCase()
        );

        if (hasOwner) {
          return filtered.map((m) =>
            m.is_owner || m.email?.toLowerCase() === ownerEmail.toLowerCase()
              ? {
                  ...m,
                  user_id: ownerId,
                  full_name: ownerName,
                  email: ownerEmail,
                  role: 'admin',
                  is_owner: true,
                  is_active: true,
                }
              : { ...m, is_active: m.is_active !== false }
          );
        }

        return [
          {
            id: `mem-${ownerId}`,
            user_id: ownerId,
            email: ownerEmail,
            full_name: ownerName,
            role: 'admin',
            joined_at: '2026-10-31T00:00:00.000Z',
            is_owner: true,
            is_active: true,
          },
          ...filtered.map((m) => ({ ...m, is_active: m.is_active !== false })),
        ];
      }
    } catch (_) {}

    return [
      {
        id: `mem-${ownerId}`,
        user_id: ownerId,
        email: ownerEmail,
        full_name: ownerName,
        role: 'admin',
        joined_at: '2026-10-31T00:00:00.000Z',
        is_owner: true,
        is_active: true,
      },
    ];
  });

  // Actividades del cronograma académico
  const [activities, setActivities] = useState(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}_ACTIVITIES`);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return INITIAL_STUDY_ACTIVITIES;
  });

  // Avances académicos
  const [advances, setAdvances] = useState(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}_ADVANCES`);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return INITIAL_STUDY_ADVANCES;
  });

  // Documentos y recursos adjuntos
  const [documents, setDocuments] = useState(() => {
    try {
      const saved = localStorage.getItem(`${storageKey}_DOCUMENTS`);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return INITIAL_STUDY_DOCUMENTS;
  });

  // Sincronización en LocalStorage para garantizar disponibilidad continua
  useEffect(() => {
    try {
      localStorage.setItem('NEXUS_STUDY_SPACE_V4', JSON.stringify(activeSpace));
      localStorage.setItem('NEXUS_STUDY_MEMBERS_V4', JSON.stringify(members));
      localStorage.setItem(`${storageKey}_ACTIVITIES`, JSON.stringify(activities));
      localStorage.setItem(`${storageKey}_ADVANCES`, JSON.stringify(advances));
      localStorage.setItem(`${storageKey}_DOCUMENTS`, JSON.stringify(documents));
    } catch (_) {}
  }, [activeSpace, members, activities, advances, documents, storageKey]);

  // Intentar cargar o sincronizar con Supabase si las tablas existen
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !currentUser?.id) return;

    let isMounted = true;
    async function loadFromSupabase() {
      try {
        const { data: spaceData, error: spaceErr } = await supabase
          .from('study_spaces')
          .select('*')
          .eq('owner_id', currentUser.id)
          .maybeSingle();

        if (spaceErr) return;

        if (spaceData && isMounted) {
          setActiveSpace(spaceData);

          const [actsRes, advRes, docsRes, memsRes] = await Promise.all([
            supabase.from('study_schedule_activities').select('*').eq('space_id', spaceData.id),
            supabase.from('study_advances').select('*').eq('space_id', spaceData.id),
            supabase.from('study_documents').select('*').eq('space_id', spaceData.id),
            supabase.from('study_members').select('*').eq('space_id', spaceData.id),
          ]);

          if (actsRes.data && actsRes.data.length > 0) setActivities(actsRes.data);
          if (advRes.data && advRes.data.length > 0) setAdvances(advRes.data);
          if (docsRes.data && docsRes.data.length > 0) setDocuments(docsRes.data);

          if (memsRes.data && memsRes.data.length > 0) {
            // Filtrar cualquier referencia residual a Carlos Mendoza
            const sanitized = memsRes.data.filter(
              (m) =>
                !m.email?.toLowerCase().includes('admin@nexuspm.dev') &&
                !m.full_name?.toLowerCase().includes('carlos mendoza')
            );

            const hasOwner = sanitized.some(
              (m) => m.is_owner || m.email?.toLowerCase() === ownerEmail.toLowerCase()
            );

            if (!hasOwner) {
              sanitized.unshift({
                id: `mem-${ownerId}`,
                space_id: spaceData.id,
                user_id: ownerId,
                email: ownerEmail,
                full_name: ownerName,
                role: 'admin',
                joined_at: '2026-10-31T00:00:00.000Z',
                is_owner: true,
                is_active: true,
              });
            } else {
              for (let i = 0; i < sanitized.length; i++) {
                if (
                  sanitized[i].is_owner ||
                  sanitized[i].email?.toLowerCase() === ownerEmail.toLowerCase()
                ) {
                  sanitized[i] = {
                    ...sanitized[i],
                    full_name: ownerName,
                    email: ownerEmail,
                    user_id: ownerId,
                    role: 'admin',
                    is_owner: true,
                    is_active: true,
                  };
                }
              }
            }
            setMembers(sanitized.map((m) => ({ ...m, is_active: m.is_active !== false })));
          }
        }
      } catch (e) {
        console.info('Modo Estudio Personal: operando en almacenamiento seguro local sincronizado.');
      }
    }

    loadFromSupabase();
    return () => {
      isMounted = false;
    };
  }, [currentUser?.id, ownerEmail, ownerId, ownerName]);

  // ---------------------------------------------------------------------------
  // CONTROL DE ACCESO Y PERMISOS ESTRICTOS POR ENTORNO
  // ---------------------------------------------------------------------------
  // 1. Administrador Principal / General de NexusPM:
  // Es el usuario con rol 'admin', o el 'lider' del proyecto (e.g. Miguel Estrada torrente),
  // o el dueño registrado en project, o cuya especialidad es Administrador General.
  const isNexusAdmin = Boolean(
    currentUser?.role === 'admin' ||
    currentUser?.role === 'lider' ||
    (project?.leader_id && currentUser?.id && project.leader_id === currentUser.id) ||
    currentUser?.specialty?.toLowerCase().includes('administrador general') ||
    currentUser?.specialty?.toLowerCase().includes('lider del proyecto') ||
    currentUser?.email === 'admin@nexuspm.dev'
  );

  // 2. Membresía explícita en el espacio de estudio
  const currentMember = useMemo(() => {
    if (!currentUser) return null;
    return (
      members.find(
        (m) =>
          (m.user_id && m.user_id === currentUser.id) ||
          (m.email && currentUser.email && m.email.toLowerCase() === currentUser.email.toLowerCase())
      ) || null
    );
  }, [members, currentUser]);

  // Es propietario si es el Administrador Principal o el dueño legítimo registrado
  const isStudyOwner = Boolean(
    isNexusAdmin || (currentUser?.id && activeSpace.owner_id === currentUser.id)
  );

  // Rol específico dentro del espacio de estudio
  const myStudyRole = useMemo(() => {
    if (isNexusAdmin) return 'admin';
    if (currentMember) return currentMember.role;
    return null;
  }, [isNexusAdmin, currentMember]);

  // Si no es el Administrador Principal de NexusPM ni un miembro autorizado por invitación, NO TIENE ACCESO
  const hasStudyAccess = Boolean(isNexusAdmin || currentMember);

  // Acceso al entorno SIGMA (proyecto principal)
  const hasSigmaAccess = Boolean(
    isNexusAdmin || currentUser?.role === 'lider' || currentUser?.role === 'integrante'
  );

  const canManageMembers = isNexusAdmin || myStudyRole === 'admin';
  const canEditStudy = isNexusAdmin || myStudyRole === 'admin' || myStudyRole === 'editor';
  const isReadOnly = myStudyRole === 'lector' && !isNexusAdmin;

  // ---------------------------------------------------------------------------
  // INDICADORES DINÁMICOS EXCLUSIVOS DEL DASHBOARD DE ESTUDIO
  // ---------------------------------------------------------------------------
  const metrics = useMemo(() => {
    const totalActivities = activities.length;
    const completedCount = activities.filter((a) => a.status === 'completada').length;
    const inProgressCount = activities.filter((a) => a.status === 'en_desarrollo').length;
    const pendingCount = activities.filter((a) => a.status === 'pendiente').length;

    const overallProgress =
      totalActivities > 0
        ? Math.round(
            activities.reduce(
              (acc, a) => acc + (a.status === 'completada' ? 100 : Number(a.progress || 0)),
              0
            ) / totalActivities
          )
        : 0;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Próximas fechas ordenadas cronológicamente
    const upcomingDeadlines = [...activities]
      .filter((a) => a.status !== 'completada' && a.end_date)
      .sort((a, b) => (a.end_date > b.end_date ? 1 : -1))
      .slice(0, 5);

    // Últimos avances registrados o actualizados
    const recentAdvances = [...advances]
      .sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at))
      .slice(0, 5);

    // Cronograma resumido de sesiones
    const summarySchedule = [...activities]
      .sort((a, b) => (a.start_date > b.start_date ? 1 : -1))
      .slice(0, 4);

    // Documentos recientes
    const recentDocuments = [...documents]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 6);

    const totalStudyHours = activities.reduce((acc, a) => acc + Number(a.hours || 0), 0);
    const completedStudyHours = activities
      .filter((a) => a.status === 'completada')
      .reduce((acc, a) => acc + Number(a.hours || 0), 0);

    return {
      totalActivities,
      completedCount,
      inProgressCount,
      pendingCount,
      overallProgress,
      upcomingDeadlines,
      recentAdvances,
      summarySchedule,
      recentDocuments,
      totalStudyHours,
      completedStudyHours,
      todayStr,
    };
  }, [activities, advances, documents]);

  // ---------------------------------------------------------------------------
  // GESTIÓN DEL CRONOGRAMA ACADÉMICO
  // ---------------------------------------------------------------------------
  const addStudyActivity = async (activityData) => {
    if (!canEditStudy) throw new Error('No tienes permisos de edición en este espacio de estudio.');

    const newActivity = {
      id: `act-std-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      space_id: activeSpace.id,
      subject: activityData.subject || 'Materia General',
      title: activityData.title,
      topic: activityData.topic || '',
      start_date: activityData.start_date,
      end_date: activityData.end_date,
      hours: Number(activityData.hours || 2),
      objectives: activityData.objectives || '',
      responsible_name: activityData.responsible_name || currentUser?.full_name || 'Estudiante',
      status: activityData.status || 'pendiente',
      progress: Number(activityData.progress || 0),
      priority: activityData.priority || 'media',
      created_by: currentUser?.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setActivities((prev) => [newActivity, ...prev]);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('study_schedule_activities').insert([newActivity]);
      } catch (_) {}
    }
    return newActivity;
  };

  const updateStudyActivity = async (activityId, updates) => {
    if (!canEditStudy) throw new Error('No tienes permisos de edición en este espacio de estudio.');

    const updatedTimestamp = new Date().toISOString();
    setActivities((prev) =>
      prev.map((a) => (a.id === activityId ? { ...a, ...updates, updated_at: updatedTimestamp } : a))
    );

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('study_schedule_activities')
          .update({ ...updates, updated_at: updatedTimestamp })
          .eq('id', activityId);
      } catch (_) {}
    }
  };

  const deleteStudyActivity = async (activityId) => {
    if (!canEditStudy) throw new Error('No tienes permisos para eliminar actividades.');

    setActivities((prev) => prev.filter((a) => a.id !== activityId));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('study_schedule_activities').delete().eq('id', activityId);
      } catch (_) {}
    }
  };

  // ---------------------------------------------------------------------------
  // GESTIÓN DE AVANCES ACADÉMICOS
  // ---------------------------------------------------------------------------
  const addStudyAdvance = async (advanceData) => {
    if (!canEditStudy) throw new Error('No tienes permisos para registrar avances.');

    const newAdvance = {
      id: `adv-std-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      space_id: activeSpace.id,
      title: advanceData.title,
      purpose: advanceData.purpose || '',
      scheduled_date: advanceData.scheduled_date || new Date().toISOString().split('T')[0],
      objectives: advanceData.objectives || '',
      tasks_checklist: advanceData.tasks_checklist || [],
      responsible_names: advanceData.responsible_names || [currentUser?.full_name || 'Estudiante'],
      status: advanceData.status || 'pendiente',
      observations: advanceData.observations || '',
      results: advanceData.results || '',
      created_by: currentUser?.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      attachments_count: (advanceData.attachments || []).length,
    };

    setAdvances((prev) => [newAdvance, ...prev]);

    // Si incluyó archivos adjuntos en el formulario de creación, registrarlos
    if (advanceData.attachments && advanceData.attachments.length > 0) {
      for (const file of advanceData.attachments) {
        await uploadStudyDocument({
          ...file,
          advance_id: newAdvance.id,
        });
      }
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('study_advances').insert([newAdvance]);
      } catch (_) {}
    }

    return newAdvance;
  };

  const updateStudyAdvance = async (advanceId, updates) => {
    if (!canEditStudy) throw new Error('No tienes permisos para modificar avances.');

    const updatedTimestamp = new Date().toISOString();
    setAdvances((prev) =>
      prev.map((adv) => (adv.id === advanceId ? { ...adv, ...updates, updated_at: updatedTimestamp } : adv))
    );

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('study_advances')
          .update({ ...updates, updated_at: updatedTimestamp })
          .eq('id', advanceId);
      } catch (_) {}
    }
  };

  const deleteStudyAdvance = async (advanceId) => {
    if (!canEditStudy) throw new Error('No tienes permisos para eliminar avances.');

    setAdvances((prev) => prev.filter((a) => a.id !== advanceId));
    // Eliminar también documentos vinculados
    setDocuments((prev) => prev.filter((d) => d.advance_id !== advanceId));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('study_advances').delete().eq('id', advanceId);
        await supabase.from('study_documents').delete().eq('advance_id', advanceId);
      } catch (_) {}
    }
  };

  const toggleAdvanceChecklistItem = async (advanceId, itemId) => {
    if (!canEditStudy) return;

    setAdvances((prev) =>
      prev.map((adv) => {
        if (adv.id !== advanceId) return adv;
        const nextList = (adv.tasks_checklist || []).map((item) =>
          item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        const allDone = nextList.length > 0 && nextList.every((i) => i.completed);
        const anyDone = nextList.some((i) => i.completed);
        const newStatus = allDone ? 'completado' : anyDone ? 'en_desarrollo' : adv.status;

        return {
          ...adv,
          tasks_checklist: nextList,
          status: newStatus,
          updated_at: new Date().toISOString(),
        };
      })
    );
  };

  // ---------------------------------------------------------------------------
  // GESTIÓN DE DOCUMENTOS Y RECURSOS
  // ---------------------------------------------------------------------------
  const uploadStudyDocument = async (docInput) => {
    if (!canEditStudy) throw new Error('No tienes permisos para adjuntar documentos.');

    const extension = (docInput.name.split('.').pop() || 'otro').toLowerCase();

    const newDoc = {
      id: `doc-std-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      advance_id: docInput.advance_id || null,
      space_id: activeSpace.id,
      name: docInput.name,
      size: docInput.size || 0,
      type: docInput.type || 'application/octet-stream',
      extension,
      data_url: docInput.data_url || '',
      content_text: docInput.content_text || '',
      uploaded_by: currentUser?.id,
      uploaded_by_name: currentUser?.full_name || 'Estudiante',
      created_at: new Date().toISOString(),
    };

    setDocuments((prev) => [newDoc, ...prev]);

    // Actualizar contador en el avance
    if (newDoc.advance_id) {
      setAdvances((prev) =>
        prev.map((adv) =>
          adv.id === newDoc.advance_id
            ? { ...adv, attachments_count: (adv.attachments_count || 0) + 1 }
            : adv
        )
      );
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('study_documents').insert([newDoc]);
      } catch (_) {}
    }

    return newDoc;
  };

  const deleteStudyDocument = async (docId) => {
    if (!canEditStudy) throw new Error('No tienes permisos para eliminar documentos.');

    const targetDoc = documents.find((d) => d.id === docId);
    setDocuments((prev) => prev.filter((d) => d.id !== docId));

    if (targetDoc?.advance_id) {
      setAdvances((prev) =>
        prev.map((adv) =>
          adv.id === targetDoc.advance_id
            ? { ...adv, attachments_count: Math.max(0, (adv.attachments_count || 1) - 1) }
            : adv
        )
      );
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('study_documents').delete().eq('id', docId);
      } catch (_) {}
    }
  };

  const downloadStudyDocument = (doc) => {
    if (!doc) return;
    try {
      let href = doc.data_url;
      if (!href && doc.content_text) {
        const blob = new Blob([doc.content_text], { type: doc.type || 'text/plain' });
        href = URL.createObjectURL(blob);
      }
      if (!href) {
        // Generar un archivo demostrativo descargable si solo tiene metadatos
        const blob = new Blob(
          [
            `DOCUMENTO ACADÉMICO - ESTUDIO PERSONAL\n` +
              `Archivo: ${doc.name}\n` +
              `Fecha: ${new Date(doc.created_at).toLocaleString()}\n` +
              `Subido por: ${doc.uploaded_by_name}\n` +
              `Tamaño: ${(doc.size / 1024).toFixed(1)} KB\n\n` +
              `Contenido verificado en la plataforma NexusPM.\n`,
          ],
          { type: 'text/plain' }
        );
        href = URL.createObjectURL(blob);
      }

      const a = document.createElement('a');
      a.href = href;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      alert('No fue posible descargar el archivo: ' + e.message);
    }
  };

  // ---------------------------------------------------------------------------
  // ADMINISTRACIÓN DE COLABORADORES Y PERMISOS (ALTA CON CONTRASEÑA, ACTIVAR Y ELIMINAR)
  // ---------------------------------------------------------------------------
  const inviteStudyMember = async ({ email, fullName, role = 'lector', password }) => {
    if (!canManageMembers) throw new Error('Solo el Administrador del espacio puede invitar colaboradores.');

    const cleanEmail = email.trim().toLowerCase();
    const existing = members.find((m) => m.email?.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error(`El usuario ${cleanEmail} ya se encuentra registrado como ${existing.role}.`);
    }

    let authUserId = null;

    // Si Supabase está conectado y se proporcionó contraseña, crear la cuenta en Supabase Auth
    if (isSupabaseConfigured && password) {
      const isolatedClient = createIsolatedSupabaseClient();
      if (isolatedClient) {
        try {
          const { data: signUpData, error: signUpErr } = await isolatedClient.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              data: {
                full_name: fullName.trim() || cleanEmail.split('@')[0],
                role: 'colaborador_estudio',
                specialty: `Colaborador de Estudio (${role.toUpperCase()})`,
              },
            },
          });

          if (signUpErr && !signUpErr.message?.includes('already registered')) {
            throw signUpErr;
          }

          authUserId = signUpData?.user?.id;

          // Asegurar que exista fila en profiles para permitir inicio de sesión y verificación de estado
          if (authUserId && supabase) {
            await supabase.from('profiles').upsert([
              {
                id: authUserId,
                email: cleanEmail,
                full_name: fullName.trim() || cleanEmail.split('@')[0],
                role: 'colaborador_estudio',
                specialty: `Colaborador de Estudio (${role.toUpperCase()})`,
                is_active: true,
              },
            ]);
          }
        } catch (authErr) {
          console.warn('Registro en Supabase Auth:', authErr.message);
        }
      }
    }

    const newMember = {
      id: `mem-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      space_id: activeSpace.id,
      user_id: authUserId || null,
      email: cleanEmail,
      full_name: fullName.trim() || cleanEmail.split('@')[0],
      role, // 'admin' | 'editor' | 'lector'
      joined_at: new Date().toISOString(),
      is_owner: false,
      is_active: true,
      assigned_password: password || null,
    };

    setMembers((prev) => [...prev, newMember]);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('study_members').insert([newMember]);
      } catch (_) {}
    }

    return newMember;
  };

  const updateStudyMemberRole = async (memberId, nextRole) => {
    if (!canManageMembers) throw new Error('No tienes permisos para modificar roles.');

    setMembers((prev) =>
      prev.map((m) => (m.id === memberId && !m.is_owner ? { ...m, role: nextRole } : m))
    );

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('study_members').update({ role: nextRole }).eq('id', memberId);
      } catch (_) {}
    }
  };

  const toggleStudyMemberActive = async (memberId) => {
    if (!canManageMembers) throw new Error('No tienes permisos para cambiar el estado de colaboradores.');

    const target = members.find((m) => m.id === memberId);
    if (!target) return;
    if (target.is_owner) throw new Error('No puedes desactivar al propietario principal.');

    const nextActive = target.is_active === false ? true : false;

    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, is_active: nextActive } : m))
    );

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('study_members').update({ is_active: nextActive }).eq('id', memberId);
        if (target.email) {
          await supabase.from('profiles').update({ is_active: nextActive }).eq('email', target.email);
        }
      } catch (_) {}
    }
  };

  const removeStudyMember = async (memberId) => {
    if (!canManageMembers) throw new Error('No tienes permisos para retirar participantes.');

    const target = members.find((m) => m.id === memberId);
    if (target?.is_owner) throw new Error('No puedes retirar al propietario del espacio de estudio.');

    setMembers((prev) => prev.filter((m) => m.id !== memberId));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('study_members').delete().eq('id', memberId);
        if (target?.email) {
          await supabase.from('profiles').delete().eq('email', target.email);
        }
      } catch (_) {}
    }
  };

  const updateSpaceDetails = async (updates) => {
    if (!isStudyOwner) throw new Error('Solo el propietario puede modificar los datos del espacio de estudio.');
    setActiveSpace((prev) => ({ ...prev, ...updates }));
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('study_spaces').update(updates).eq('id', activeSpace.id);
      } catch (_) {}
    }
  };

  const value = {
    activeSpace,
    members,
    activities,
    advances,
    documents,
    metrics,
    // Permisos y estados
    isNexusAdmin,
    isStudyOwner,
    myStudyRole,
    hasStudyAccess,
    hasSigmaAccess,
    canManageMembers,
    canEditStudy,
    isReadOnly,
    // Métodos del Cronograma
    addStudyActivity,
    updateStudyActivity,
    deleteStudyActivity,
    // Métodos de Avances
    addStudyAdvance,
    updateStudyAdvance,
    deleteStudyAdvance,
    toggleAdvanceChecklistItem,
    // Métodos de Documentos
    uploadStudyDocument,
    deleteStudyDocument,
    downloadStudyDocument,
    // Métodos de Colaboradores
    inviteStudyMember,
    updateStudyMemberRole,
    toggleStudyMemberActive,
    removeStudyMember,
    updateSpaceDetails,
  };

  return (
    <PersonalStudyContext.Provider value={value}>
      {children}
    </PersonalStudyContext.Provider>
  );
}
