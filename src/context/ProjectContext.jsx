import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  supabase,
  isSupabaseConfigured,
  createIsolatedSupabaseClient,
} from '../lib/supabase';
import {
  INITIAL_PROFILES,
  INITIAL_INVITATIONS,
  INITIAL_PROJECT,
  INITIAL_PROJECT_MEMBERS,
  INITIAL_WORK_PLAN,
  INITIAL_TASKS,
  INITIAL_CHANGELOG,
  INITIAL_REPOSITORIES,
  INITIAL_NOTIFICATIONS,
} from '../data/initialProjectSeed';

const ProjectContext = createContext(null);

export const useProject = () => {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProject debe usarse dentro de un ProjectProvider');
  return ctx;
};

export function ProjectProvider({ children }) {
  // Tema visual (claro / oscuro)
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.document.documentElement.classList.contains('dark');
    }
    return false;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      if (darkMode) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [darkMode]);

  // Estado de autenticación y carga
  const [currentUser, setCurrentUser] = useState(
    isSupabaseConfigured ? null : INITIAL_PROFILES[1]
  );
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [syncError, setSyncError] = useState(null);

  // Estado de todas las entidades del proyecto
  const [profiles, setProfiles] = useState(isSupabaseConfigured ? [] : INITIAL_PROFILES);
  const [invitations, setInvitations] = useState(isSupabaseConfigured ? [] : INITIAL_INVITATIONS);
  const [project, setProject] = useState(isSupabaseConfigured ? null : INITIAL_PROJECT);
  const [projectMembers, setProjectMembers] = useState(
    isSupabaseConfigured ? [] : INITIAL_PROJECT_MEMBERS
  );
  const [workPlan, setWorkPlan] = useState(isSupabaseConfigured ? [] : INITIAL_WORK_PLAN);
  const [tasks, setTasks] = useState(isSupabaseConfigured ? [] : INITIAL_TASKS);
  const [changelog, setChangelog] = useState(isSupabaseConfigured ? [] : INITIAL_CHANGELOG);
  const [repositories, setRepositories] = useState(
    isSupabaseConfigured ? [] : INITIAL_REPOSITORIES
  );
  const [notifications, setNotifications] = useState(
    isSupabaseConfigured ? [] : INITIAL_NOTIFICATIONS
  );

  // ---------------------------------------------------------------------------
  // CARGA Y SINCRONIZACIÓN DE DATOS DESDE SUPABASE POSTGRESQL
  // ---------------------------------------------------------------------------
  const fetchAllSupabaseData = useCallback(async (activeUserId) => {
    if (!isSupabaseConfigured || !supabase) return;
    setSyncError(null);
    try {
      const [
        profilesRes,
        invitationsRes,
        projectsRes,
        membersRes,
        workPlanRes,
        tasksRes,
        assigneesRes,
        evidencesRes,
        changelogRes,
        reposRes,
        notifRes,
      ] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: true }),
        supabase.from('invitations').select('*').order('created_at', { ascending: false }),
        supabase.from('projects').select('*').order('created_at', { ascending: true }).limit(1),
        supabase.from('project_members').select('*'),
        supabase.from('work_plan_activities').select('*').order('start_date', { ascending: true }),
        supabase.from('tasks').select('*').order('due_date', { ascending: true }),
        supabase.from('task_assignees').select('*'),
        supabase.from('task_evidences').select('*').order('created_at', { ascending: false }),
        supabase.from('changelog_entries').select('*').order('created_at', { ascending: false }),
        supabase.from('repositories_resources').select('*').order('created_at', { ascending: false }),
        supabase.from('notifications').select('*').order('created_at', { ascending: false }),
      ]);

      if (profilesRes.error) throw profilesRes.error;

      let loadedProfiles = profilesRes.data || [];

      // Si el usuario autenticado aún no tenía fila en profiles, crearla automáticamente
      if (activeUserId && !loadedProfiles.some((p) => p.id === activeUserId)) {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        if (authUser) {
          const defaultRole = loadedProfiles.length === 0 ? 'lider' : authUser.user_metadata?.role || 'integrante';
          const { data: createdProfile } = await supabase
            .from('profiles')
            .upsert([
              {
                id: authUser.id,
                email: authUser.email,
                full_name:
                  authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Usuario',
                role: defaultRole,
                specialty: authUser.user_metadata?.specialty || 'Líder del Proyecto',
                is_active: true,
              },
            ])
            .select()
            .single();
          if (createdProfile) {
            loadedProfiles = [...loadedProfiles, createdProfile];
          }
        }
      }

      setProfiles(loadedProfiles);
      setInvitations(invitationsRes.data || []);

      const myProfile = activeUserId
        ? loadedProfiles.find((p) => p.id === activeUserId)
        : null;

      // Seguridad: si la cuenta fue desactivada por el Administrador o Líder, cerrar sesión inmediatamente
      if (myProfile && myProfile.is_active === false) {
        await supabase.auth.signOut();
        setCurrentUser(null);
        throw new Error('Tu cuenta ha sido desactivada por el Administrador o Líder del proyecto.');
      }

      if (myProfile) {
        setCurrentUser(myProfile);
      }

      // Si aún no existe un registro de proyecto en la tabla projects y el usuario es líder o admin, crearlo automáticamente
      let activeProj = projectsRes.data && projectsRes.data.length > 0 ? projectsRes.data[0] : null;
      if (!activeProj && myProfile && (myProfile.role === 'lider' || myProfile.role === 'admin')) {
        const { data: insertedProj } = await supabase
          .from('projects')
          .insert([
            {
              name: INITIAL_PROJECT.name,
              code: INITIAL_PROJECT.code,
              description: INITIAL_PROJECT.description,
              objectives: INITIAL_PROJECT.objectives,
              leader_id: myProfile.id,
              start_date: INITIAL_PROJECT.start_date,
              end_date: INITIAL_PROJECT.end_date,
              status: 'en_ejecucion',
              repository_main_url: 'https://github.com/MAET211/seguimiento-proyecto',
              methodology: INITIAL_PROJECT.methodology,
              version: INITIAL_PROJECT.version,
            },
          ])
          .select()
          .single();
        if (insertedProj) {
          activeProj = insertedProj;
        }
      }

      setProject(activeProj || INITIAL_PROJECT);
      setProjectMembers(membersRes.data || []);
      setWorkPlan(workPlanRes.data || []);

      const rawTasks = tasksRes.data || [];
      const rawAssignees = assigneesRes.data || [];
      const rawEvidences = evidencesRes.data || [];

      const enrichedTasks = rawTasks.map((t) => ({
        ...t,
        assignee_ids: rawAssignees.filter((a) => a.task_id === t.id).map((a) => a.user_id),
        evidences: rawEvidences.filter((e) => e.task_id === t.id),
      }));

      setTasks(enrichedTasks);
      setChangelog(changelogRes.data || []);
      setRepositories(reposRes.data || []);
      setNotifications(notifRes.data || []);
    } catch (err) {
      console.error('Error al sincronizar datos con Supabase:', err);
      setSyncError(err.message || 'Error al consultar las tablas de Supabase.');
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;

    async function initSupabaseSession() {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user && mounted) {
        await fetchAllSupabaseData(session.user.id);
      } else if (mounted) {
        setCurrentUser(null);
      }
      if (mounted) setLoading(false);
    }

    initSupabaseSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user && mounted) {
        await fetchAllSupabaseData(session.user.id);
      } else if (mounted) {
        setCurrentUser(null);
      }
    });

    const realtimeChannel = supabase
      .channel('nexuspm-realtime')
      .on('postgres_changes', { event: '*', schema: 'public' }, () => {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session?.user) {
            fetchAllSupabaseData(session.user.id);
          }
        });
      })
      .subscribe();

    return () => {
      mounted = false;
      subscription?.unsubscribe();
      supabase.removeChannel(realtimeChannel);
    };
  }, [fetchAllSupabaseData]);

  // ---------------------------------------------------------------------------
  // TRAZABILIDAD AUTOMÁTICA Y NOTIFICACIONES
  // ---------------------------------------------------------------------------
  const registerAutomaticChangelog = async ({
    title,
    description,
    taskId = null,
    commitOrPrUrl = '',
    evidenceUrl = '',
    entryType = 'cambio_estado',
  }) => {
    const newEntry = {
      id: `chg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      project_id: project?.id || 'prj-main-01',
      title,
      description,
      author_id: currentUser?.id || null,
      author_name: currentUser?.full_name || 'Sistema',
      task_id: taskId,
      commit_or_pr_url: commitOrPrUrl,
      evidence_url: evidenceUrl,
      entry_type: entryType,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase && project?.id && project.id !== 'prj-main-01') {
      const { data } = await supabase
        .from('changelog_entries')
        .insert([
          {
            project_id: project.id,
            title,
            description,
            author_id: currentUser?.id,
            author_name: currentUser?.full_name,
            task_id: taskId,
            commit_or_pr_url: commitOrPrUrl,
            evidence_url: evidenceUrl,
            entry_type: entryType,
          },
        ])
        .select()
        .single();
      if (data) {
        setChangelog((prev) => [data, ...prev]);
        return;
      }
    }

    setChangelog((prev) => [newEntry, ...prev]);
  };

  const dispatchNotification = async ({
    recipientIds = [],
    title,
    message,
    notificationType = 'sistema',
    relatedTaskId = null,
  }) => {
    const uniqueRecipients = [...new Set(recipientIds)].filter(Boolean);
    if (uniqueRecipients.length === 0) return;

    if (isSupabaseConfigured && supabase) {
      const rows = uniqueRecipients.map((uid) => ({
        user_id: uid,
        sender_id: currentUser?.id || null,
        title,
        message,
        notification_type: notificationType,
        related_task_id: relatedTaskId,
        is_read: false,
      }));
      const { data } = await supabase.from('notifications').insert(rows).select();
      if (data) {
        setNotifications((prev) => [...data, ...prev]);
        return;
      }
    }

    const newNotifs = uniqueRecipients.map((uid, idx) => ({
      id: `not-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
      user_id: uid,
      sender_id: currentUser?.id || null,
      title,
      message,
      notification_type: notificationType,
      related_task_id: relatedTaskId,
      is_read: false,
      created_at: new Date().toISOString(),
    }));
    setNotifications((prev) => [...newNotifs, ...prev]);
  };

  // ---------------------------------------------------------------------------
  // AUTENTICACIÓN SEGURA Y CONTROL DE ACCESO POR ROL
  // ---------------------------------------------------------------------------
  const login = async (email, password) => {
    const normalizedEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (error) throw error;

      if (data.user) {
        // Verificar que la cuenta esté activa en profiles
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (prof && prof.is_active === false) {
          await supabase.auth.signOut();
          throw new Error(
            'Acceso denegado: esta cuenta ha sido desactivada por el Administrador o Líder.'
          );
        }

        await fetchAllSupabaseData(data.user.id);
      }
      return data;
    }

    // Modo verificación local
    const found = profiles.find((p) => p.email.toLowerCase() === normalizedEmail);
    if (!found) {
      throw new Error(
        'Acceso denegado: este correo no ha sido registrado por el Líder del Proyecto.'
      );
    }
    if (!found.is_active) {
      throw new Error('Esta cuenta ha sido desactivada por el Administrador.');
    }
    setCurrentUser(found);
    return { user: found };
  };

  const resetPassword = async (email) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin + window.location.pathname,
      });
      if (error) throw error;
      return true;
    }
    return true;
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
  };

  const switchActiveRoleUser = (userId) => {
    const found = profiles.find((p) => p.id === userId);
    if (found && found.is_active) {
      setCurrentUser(found);
    }
  };

  // ---------------------------------------------------------------------------
  // GESTIÓN DE USUARIOS Y CREACIÓN DE CUENTAS POR EL LÍDER / ADMINISTRADOR
  // ---------------------------------------------------------------------------
  const updateMyProfile = async (updates) => {
    if (!currentUser) return;
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', currentUser.id)
        .select()
        .single();
      if (error) throw error;
      setProfiles((prev) => prev.map((p) => (p.id === currentUser.id ? data : p)));
      setCurrentUser(data);
      return data;
    }

    const updated = { ...currentUser, ...updates };
    setProfiles((prev) => prev.map((p) => (p.id === currentUser.id ? updated : p)));
    setCurrentUser(updated);
    return updated;
  };

  const adminUpdateUser = async (userId, updates) => {
    if (!isLeaderOrAdmin) {
      throw new Error('Permiso denegado: solo el Líder o Administrador puede modificar roles o estados.');
    }
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      setProfiles((prev) => prev.map((p) => (p.id === userId ? data : p)));
      if (currentUser?.id === userId) setCurrentUser(data);
      return data;
    }

    setProfiles((prev) => prev.map((p) => (p.id === userId ? { ...p, ...updates } : p)));
    if (currentUser?.id === userId) {
      setCurrentUser((prev) => ({ ...prev, ...updates }));
    }
  };

  /**
   * Permite al Líder o Administrador crear directamente la cuenta de acceso (correo + contraseña + rol)
   * de cualquier integrante del equipo, Administrador o Líder sin cerrar la sesión actual del Líder.
   */
  const createInvitationOrUser = async ({
    email,
    password,
    full_name,
    role = 'integrante',
    specialty = 'Desarrollador de Software',
    responsibilities = 'Desarrollo de módulos asignados y reporte de avances.',
    weekly_hours = 20,
  }) => {
    if (!isLeaderOrAdmin) {
      throw new Error('Permiso denegado: solo el Líder o Administrador puede dar de alta integrantes.');
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (isSupabaseConfigured && supabase) {
      // 1. Registrar invitación con el rol oficial designado por el Líder
      const { data: invData } = await supabase
        .from('invitations')
        .upsert(
          [
            {
              email: normalizedEmail,
              full_name,
              role,
              specialty,
              invited_by: currentUser?.id,
              status: 'aceptada',
            },
          ],
          { onConflict: 'email' }
        )
        .select()
        .single();

      if (invData) {
        setInvitations((prev) => [invData, ...prev.filter((i) => i.email !== normalizedEmail)]);
      }

      // 2. Crear la cuenta real en Supabase Auth usando el cliente aislado (no cierra la sesión del Líder)
      const isolatedClient = createIsolatedSupabaseClient();
      if (isolatedClient && password) {
        const { data: signUpData, error: signUpErr } = await isolatedClient.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: {
              full_name,
              role,
              specialty,
            },
          },
        });

        if (signUpErr) throw signUpErr;

        const newAuthUserId = signUpData?.user?.id;
        if (newAuthUserId) {
          // Asegurar que el perfil tenga exactamente el rol designado por el Líder
          const { data: profData } = await supabase
            .from('profiles')
            .upsert([
              {
                id: newAuthUserId,
                email: normalizedEmail,
                full_name,
                role,
                specialty,
                is_active: true,
              },
            ])
            .select()
            .single();

          if (profData) {
            setProfiles((prev) => [
              ...prev.filter((p) => p.id !== profData.id),
              profData,
            ]);
          }

          // Registrar su responsabilidad en el proyecto
          if (project?.id && project.id !== 'prj-main-01') {
            const { data: memberData } = await supabase
              .from('project_members')
              .upsert(
                [
                  {
                    project_id: project.id,
                    user_id: newAuthUserId,
                    project_role: specialty,
                    responsibilities,
                    weekly_hours: Number(weekly_hours) || 20,
                  },
                ],
                { onConflict: 'project_id,user_id' }
              )
              .select()
              .single();

            if (memberData) {
              setProjectMembers((prev) => [...prev, memberData]);
            }
          }
        }
      }

      await registerAutomaticChangelog({
        title: `Alta de cuenta autorizada: ${full_name} (${role.toUpperCase()})`,
        description: `${currentUser?.full_name} creó la cuenta de acceso para ${full_name} (${normalizedEmail}) con el rol de ${role.toUpperCase()} y cargo "${specialty}".`,
        entryType: 'asignacion',
      });

      await fetchAllSupabaseData(currentUser?.id);
      return;
    }

    // Modo verificación local
    const newUserId = `usr-${Date.now()}`;
    const newProfile = {
      id: newUserId,
      email: normalizedEmail,
      full_name,
      role,
      specialty,
      phone: '',
      github_username: normalizedEmail.split('@')[0],
      is_active: true,
      created_at: new Date().toISOString(),
    };

    setProfiles((prev) => [...prev, newProfile]);
    setProjectMembers((prev) => [
      ...prev,
      {
        id: `pm-${Date.now()}`,
        project_id: project?.id || 'prj-main-01',
        user_id: newUserId,
        project_role: specialty,
        responsibilities,
        weekly_hours: Number(weekly_hours) || 20,
      },
    ]);

    await registerAutomaticChangelog({
      title: `Nuevo integrante registrado por el Líder: ${full_name}`,
      description: `${currentUser?.full_name} dio de alta a ${full_name} con el rol de ${role.toUpperCase()} (${specialty}).`,
      entryType: 'asignacion',
    });

    return newProfile;
  };

  // ---------------------------------------------------------------------------
  // CONFIGURACIÓN DEL PROYECTO Y RESPONSABILIDADES DEL EQUIPO
  // ---------------------------------------------------------------------------
  const updateProjectDetails = async (updates) => {
    if (isSupabaseConfigured && supabase && project?.id && project.id !== 'prj-main-01') {
      const { data, error } = await supabase
        .from('projects')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', project.id)
        .select()
        .single();
      if (error) throw error;
      setProject(data);
    } else {
      setProject((prev) => ({ ...prev, ...updates }));
    }

    await registerAutomaticChangelog({
      title: 'Actualización de configuración general del proyecto',
      description: `${currentUser?.full_name} actualizó los parámetros del proyecto "${updates.name || project?.name}".`,
      entryType: 'cronograma',
    });
  };

  const upsertProjectMemberResponsibility = async ({
    user_id,
    project_role,
    responsibilities,
    weekly_hours,
  }) => {
    const existing = projectMembers.find((m) => m.user_id === user_id);
    if (isSupabaseConfigured && supabase && project?.id && project.id !== 'prj-main-01') {
      if (existing) {
        const { data, error } = await supabase
          .from('project_members')
          .update({
            project_role,
            responsibilities,
            weekly_hours: Number(weekly_hours) || 20,
          })
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        setProjectMembers((prev) => prev.map((m) => (m.id === existing.id ? data : m)));
      } else {
        const { data, error } = await supabase
          .from('project_members')
          .insert([
            {
              project_id: project.id,
              user_id,
              project_role,
              responsibilities,
              weekly_hours: Number(weekly_hours) || 20,
            },
          ])
          .select()
          .single();
        if (error) throw error;
        setProjectMembers((prev) => [...prev, data]);
      }
      return;
    }

    if (existing) {
      setProjectMembers((prev) =>
        prev.map((m) =>
          m.id === existing.id
            ? { ...m, project_role, responsibilities, weekly_hours: Number(weekly_hours) || 20 }
            : m
        )
      );
    } else {
      setProjectMembers((prev) => [
        ...prev,
        {
          id: `pm-${Date.now()}`,
          project_id: project?.id || 'prj-main-01',
          user_id,
          project_role,
          responsibilities,
          weekly_hours: Number(weekly_hours) || 20,
        },
      ]);
    }
  };

  // ---------------------------------------------------------------------------
  // MÓDULO 3: TAREAS Y DELEGACIONES
  // ---------------------------------------------------------------------------
  const createTask = async (taskInput) => {
    const {
      title,
      description,
      instructions = '',
      priority = 'media',
      assigned_at = new Date().toISOString().split('T')[0],
      due_date,
      work_plan_id = null,
      assignee_ids = [],
      reference_links = [],
    } = taskInput;

    let createdTaskId = `tsk-${Date.now()}`;

    if (isSupabaseConfigured && supabase && project?.id && project.id !== 'prj-main-01') {
      const { data: insertedTask, error } = await supabase
        .from('tasks')
        .insert([
          {
            project_id: project.id,
            work_plan_id: work_plan_id || null,
            title,
            description,
            instructions,
            reference_links,
            priority,
            status: 'pendiente',
            progress: 0,
            assigned_at,
            due_date,
            created_by: currentUser?.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      createdTaskId = insertedTask.id;

      if (assignee_ids.length > 0) {
        const assigneeRows = assignee_ids.map((uid) => ({
          task_id: createdTaskId,
          user_id: uid,
        }));
        await supabase.from('task_assignees').insert(assigneeRows);
      }

      const fullNewTask = {
        ...insertedTask,
        assignee_ids,
        evidences: [],
      };
      setTasks((prev) => [...prev, fullNewTask]);
    } else {
      const newTask = {
        id: createdTaskId,
        project_id: project?.id || 'prj-main-01',
        work_plan_id: work_plan_id || null,
        title,
        description,
        instructions,
        reference_links,
        priority,
        status: 'pendiente',
        progress: 0,
        assigned_at,
        due_date,
        completed_at: null,
        deliverable_summary: '',
        deliverable_links: [],
        leader_feedback: '',
        reviewed_by: null,
        reviewed_at: null,
        created_by: currentUser?.id,
        assignee_ids,
        evidences: [],
      };
      setTasks((prev) => [...prev, newTask]);
    }

    const assigneeNames = profiles
      .filter((p) => assignee_ids.includes(p.id))
      .map((p) => p.full_name)
      .join(', ');

    await registerAutomaticChangelog({
      title: `Nueva tarea delegada: ${title}`,
      description: `${currentUser?.full_name} asignó la tarea "${title}" (Prioridad: ${priority.toUpperCase()}, Entrega: ${due_date}) a: ${assigneeNames || 'Equipo'}.`,
      taskId: createdTaskId,
      entryType: 'asignacion',
    });

    await dispatchNotification({
      recipientIds: assignee_ids,
      title: 'Nueva tarea asignada',
      message: `${currentUser?.full_name} te ha delegado la tarea "${title}" con fecha límite ${due_date}.`,
      notificationType: 'nueva_tarea',
      relatedTaskId: createdTaskId,
    });
  };

  const updateTask = async (taskId, updates) => {
    const oldTask = tasks.find((t) => t.id === taskId);
    if (!oldTask) return;

    if (isSupabaseConfigured && supabase) {
      const { assignee_ids, evidences, ...dbFields } = updates;
      const { error } = await supabase
        .from('tasks')
        .update({ ...dbFields, updated_at: new Date().toISOString() })
        .eq('id', taskId);
      if (error) throw error;

      if (Array.isArray(assignee_ids)) {
        await supabase.from('task_assignees').delete().eq('task_id', taskId);
        if (assignee_ids.length > 0) {
          await supabase.from('task_assignees').insert(
            assignee_ids.map((uid) => ({ task_id: taskId, user_id: uid }))
          );
        }
      }
    }

    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, ...updates } : t)));

    if (updates.due_date && updates.due_date !== oldTask.due_date) {
      await registerAutomaticChangelog({
        title: `Modificación de fecha de entrega: ${oldTask.title}`,
        description: `La fecha límite de "${oldTask.title}" cambió de ${oldTask.due_date} a ${updates.due_date}.`,
        taskId,
        entryType: 'cronograma',
      });

      await dispatchNotification({
        recipientIds: updates.assignee_ids || oldTask.assignee_ids || [],
        title: 'Cambio en fecha de entrega',
        message: `La fecha límite de la tarea "${oldTask.title}" fue actualizada para el ${updates.due_date}.`,
        notificationType: 'cambio_fecha',
        relatedTaskId: taskId,
      });
    }
  };

  const updateTaskMemberProgress = async (
    taskId,
    { progress, status, deliverable_summary }
  ) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    const nextStatus =
      status || (progress > 0 && targetTask.status === 'pendiente' ? 'en_proceso' : targetTask.status);

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('tasks')
        .update({
          progress: Number(progress),
          status: nextStatus,
          deliverable_summary,
          updated_at: new Date().toISOString(),
        })
        .eq('id', taskId);
      if (error) throw error;
    }

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              progress: Number(progress),
              status: nextStatus,
              deliverable_summary: deliverable_summary ?? t.deliverable_summary,
            }
          : t
      )
    );

    await registerAutomaticChangelog({
      title: `Actualización de avance (${progress}%): ${targetTask.title}`,
      description: `${currentUser?.full_name} actualizó el progreso de "${targetTask.title}" al ${progress}%. ${
        deliverable_summary ? `Detalle: ${deliverable_summary}` : ''
      }`,
      taskId,
      entryType: 'cambio_estado',
    });
  };

  const submitTaskForLeaderReview = async (
    taskId,
    {
      deliverable_summary,
      evidence_title,
      evidence_url,
      evidence_type = 'pull_request',
      evidence_description = '',
    }
  ) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    const nowIso = new Date().toISOString();
    let newEvidenceObj = null;

    if (evidence_url && evidence_title) {
      if (isSupabaseConfigured && supabase) {
        const { data: evData } = await supabase
          .from('task_evidences')
          .insert([
            {
              task_id: taskId,
              user_id: currentUser?.id,
              title: evidence_title,
              description: evidence_description,
              evidence_url,
              evidence_type,
            },
          ])
          .select()
          .single();
        if (evData) newEvidenceObj = evData;
      } else {
        newEvidenceObj = {
          id: `ev-${Date.now()}`,
          task_id: taskId,
          user_id: currentUser?.id,
          title: evidence_title,
          description: evidence_description,
          evidence_url,
          evidence_type,
          created_at: nowIso,
        };
      }
    }

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'en_revision',
          progress: 100,
          completed_at: nowIso,
          deliverable_summary,
          updated_at: nowIso,
        })
        .eq('id', taskId);
      if (error) throw error;
    }

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: 'en_revision',
              progress: 100,
              completed_at: nowIso,
              deliverable_summary,
              evidences: newEvidenceObj
                ? [newEvidenceObj, ...(t.evidences || [])]
                : t.evidences || [],
            }
          : t
      )
    );

    await registerAutomaticChangelog({
      title: `Actividad marcada como finalizada para revisión: ${targetTask.title}`,
      description: `${currentUser?.full_name} completó la actividad "${targetTask.title}" y la envió a revisión del líder. Resumen de entrega: ${deliverable_summary}`,
      taskId,
      commitOrPrUrl: evidence_url || '',
      evidenceUrl: evidence_url || '',
      entryType: 'finalizacion',
    });

    const leadersAndAdmins = profiles
      .filter((p) => p.role === 'lider' || p.role === 'admin')
      .map((p) => p.id);

    await dispatchNotification({
      recipientIds: leadersAndAdmins,
      title: 'Tarea enviada para revisión del Líder',
      message: `${currentUser?.full_name} finalizó "${targetTask.title}" y solicita tu revisión y aprobación.`,
      notificationType: 'revision_enviada',
      relatedTaskId: taskId,
    });
  };

  const reviewTaskByLeader = async (taskId, { decision, leader_feedback }) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    const isApproved = decision === 'aprobar';
    const nextStatus = isApproved ? 'completada' : 'devuelta';
    const nextProgress = isApproved ? 100 : Math.min(targetTask.progress || 80, 85);
    const nowIso = new Date().toISOString();

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('tasks')
        .update({
          status: nextStatus,
          progress: nextProgress,
          leader_feedback,
          reviewed_by: currentUser?.id,
          reviewed_at: nowIso,
          updated_at: nowIso,
        })
        .eq('id', taskId);
      if (error) throw error;
    }

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: nextStatus,
              progress: nextProgress,
              leader_feedback,
              reviewed_by: currentUser?.id,
              reviewed_at: nowIso,
            }
          : t
      )
    );

    await registerAutomaticChangelog({
      title: isApproved
        ? `Tarea aprobada y completada: ${targetTask.title}`
        : `Tarea devuelta para correcciones: ${targetTask.title}`,
      description: `${currentUser?.full_name} ${
        isApproved ? 'aprobó satisfactoriamente' : 'devolvió con observaciones'
      } la tarea "${targetTask.title}". Comentario del líder: "${
        leader_feedback || 'Sin comentarios adicionales'
      }"`,
      taskId,
      entryType: isApproved ? 'aprobacion' : 'devolucion',
    });

    await dispatchNotification({
      recipientIds: targetTask.assignee_ids || [],
      title: isApproved ? '¡Tarea Aprobada por el Líder!' : 'Tarea devuelta para correcciones',
      message: isApproved
        ? `${currentUser?.full_name} aprobó tu entrega en "${targetTask.title}". ${
            leader_feedback ? `Comentario: ${leader_feedback}` : ''
          }`
        : `${currentUser?.full_name} devolvió la tarea "${targetTask.title}" para ajustes: ${leader_feedback}`,
      notificationType: isApproved ? 'tarea_aprobada' : 'tarea_devuelta',
      relatedTaskId: taskId,
    });
  };

  const deleteTask = async (taskId) => {
    const target = tasks.find((t) => t.id === taskId);
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
    }
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (target) {
      await registerAutomaticChangelog({
        title: `Tarea eliminada: ${target.title}`,
        description: `${currentUser?.full_name} eliminó la tarea "${target.title}" del listado activo.`,
        entryType: 'cambio_estado',
      });
    }
  };

  // ---------------------------------------------------------------------------
  // MÓDULO 4: NOVEDADES MANUALES Y TRAZABILIDAD
  // ---------------------------------------------------------------------------
  const addManualChangelog = async ({
    title,
    description,
    task_id = null,
    commit_or_pr_url = '',
    evidence_url = '',
  }) => {
    if (isSupabaseConfigured && supabase && project?.id && project.id !== 'prj-main-01') {
      const { data, error } = await supabase
        .from('changelog_entries')
        .insert([
          {
            project_id: project.id,
            title,
            description,
            author_id: currentUser?.id,
            author_name: currentUser?.full_name,
            task_id: task_id || null,
            commit_or_pr_url,
            evidence_url,
            entry_type: 'manual',
          },
        ])
        .select()
        .single();
      if (error) throw error;
      setChangelog((prev) => [data, ...prev]);
    } else {
      const newEntry = {
        id: `chg-${Date.now()}`,
        project_id: project?.id || 'prj-main-01',
        title,
        description,
        author_id: currentUser?.id,
        author_name: currentUser?.full_name,
        task_id: task_id || null,
        commit_or_pr_url,
        evidence_url,
        entry_type: 'manual',
        created_at: new Date().toISOString(),
      };
      setChangelog((prev) => [newEntry, ...prev]);
    }

    const recipients = profiles
      .filter((p) => p.id !== currentUser?.id && p.is_active)
      .map((p) => p.id);

    await dispatchNotification({
      recipientIds: recipients,
      title: 'Nueva novedad registrada en el proyecto',
      message: `${currentUser?.full_name} registró: "${title}".`,
      notificationType: 'nueva_novedad',
      relatedTaskId: task_id || null,
    });
  };

  // ---------------------------------------------------------------------------
  // MÓDULO 5: REPOSITORIOS Y RECURSOS
  // ---------------------------------------------------------------------------
  const addRepositoryResource = async ({
    name,
    description,
    category,
    url,
    branch_or_tag = '',
  }) => {
    if (isSupabaseConfigured && supabase && project?.id && project.id !== 'prj-main-01') {
      const { data, error } = await supabase
        .from('repositories_resources')
        .insert([
          {
            project_id: project.id,
            name,
            description,
            category,
            url,
            branch_or_tag,
            created_by: currentUser?.id,
          },
        ])
        .select()
        .single();
      if (error) throw error;
      setRepositories((prev) => [data, ...prev]);
    } else {
      const newRes = {
        id: `rep-${Date.now()}`,
        project_id: project?.id || 'prj-main-01',
        name,
        description,
        category,
        url,
        branch_or_tag,
        created_by: currentUser?.id,
        created_at: new Date().toISOString(),
      };
      setRepositories((prev) => [newRes, ...prev]);
    }

    await registerAutomaticChangelog({
      title: `Nuevo recurso o repositorio registrado: ${name}`,
      description: `${currentUser?.full_name} vinculó el recurso "${name}" en la categoría ${category}.`,
      commitOrPrUrl: url,
      entryType: 'repositorio',
    });
  };

  const deleteRepositoryResource = async (id) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('repositories_resources').delete().eq('id', id);
      if (error) throw error;
    }
    setRepositories((prev) => prev.filter((r) => r.id !== id));
  };

  // ---------------------------------------------------------------------------
  // MÓDULO 6: PLAN DE TRABAJO Y CRONOGRAMA INTERACTIVO GANTT
  // ---------------------------------------------------------------------------
  const addWorkPlanActivity = async (activityInput) => {
    const {
      phase,
      name,
      description,
      responsible_id,
      start_date,
      end_date,
      priority = 'media',
      status = 'pendiente',
      progress = 0,
      dependencies = '',
    } = activityInput;

    if (isSupabaseConfigured && supabase && project?.id && project.id !== 'prj-main-01') {
      const { data, error } = await supabase
        .from('work_plan_activities')
        .insert([
          {
            project_id: project.id,
            phase,
            name,
            description,
            responsible_id: responsible_id || null,
            start_date,
            end_date,
            priority,
            status,
            progress: Number(progress),
            dependencies,
            created_by: currentUser?.id,
          },
        ])
        .select()
        .single();
      if (error) throw error;
      setWorkPlan((prev) => [...prev, data]);
    } else {
      const newAct = {
        id: `wp-${Date.now()}`,
        project_id: project?.id || 'prj-main-01',
        phase,
        name,
        description,
        responsible_id: responsible_id || null,
        start_date,
        end_date,
        priority,
        status,
        progress: Number(progress),
        dependencies,
      };
      setWorkPlan((prev) => [...prev, newAct]);
    }

    await registerAutomaticChangelog({
      title: `Nueva actividad en el Plan de Trabajo: ${name}`,
      description: `${currentUser?.full_name} programó la actividad "${name}" (${start_date} al ${end_date}) en ${phase}.`,
      entryType: 'cronograma',
    });

    if (responsible_id) {
      await dispatchNotification({
        recipientIds: [responsible_id],
        title: 'Actualización del Cronograma / Plan de Trabajo',
        message: `Se te ha asignado la actividad "${name}" en el Plan de Trabajo (${start_date} a ${end_date}).`,
        notificationType: 'cronograma',
      });
    }
  };

  const updateWorkPlanActivity = async (id, updates) => {
    const oldAct = workPlan.find((w) => w.id === id);
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('work_plan_activities')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      setWorkPlan((prev) => prev.map((w) => (w.id === id ? data : w)));
    } else {
      setWorkPlan((prev) => prev.map((w) => (w.id === id ? { ...w, ...updates } : w)));
    }

    if (oldAct) {
      await registerAutomaticChangelog({
        title: `Actualización en Cronograma Gantt: ${updates.name || oldAct.name}`,
        description: `${currentUser?.full_name} actualizó la actividad "${
          updates.name || oldAct.name
        }" (Progreso: ${updates.progress ?? oldAct.progress}%, Fechas: ${
          updates.start_date || oldAct.start_date
        } a ${updates.end_date || oldAct.end_date}).`,
        entryType: 'cronograma',
      });

      const respId = updates.responsible_id || oldAct.responsible_id;
      if (respId) {
        await dispatchNotification({
          recipientIds: [respId],
          title: 'Actividad reprogramada o actualizada en el Cronograma',
          message: `La actividad "${updates.name || oldAct.name}" fue actualizada en el Plan de Trabajo.`,
          notificationType: 'cronograma',
        });
      }
    }
  };

  const deleteWorkPlanActivity = async (id) => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('work_plan_activities').delete().eq('id', id);
      if (error) throw error;
    }
    setWorkPlan((prev) => prev.filter((w) => w.id !== id));
  };

  // ---------------------------------------------------------------------------
  // MÓDULO 7: GESTIÓN DE NOTIFICACIONES
  // ---------------------------------------------------------------------------
  const markNotificationRead = async (id) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    }
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
  };

  const markAllMyNotificationsRead = async () => {
    if (!currentUser) return;
    if (isSupabaseConfigured && supabase) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', currentUser.id);
    }
    setNotifications((prev) =>
      prev.map((n) => (n.user_id === currentUser.id ? { ...n, is_read: true } : n))
    );
  };

  const clearNotification = async (id) => {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('notifications').delete().eq('id', id);
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // ---------------------------------------------------------------------------
  // INICIALIZACIÓN COMPLETA EN SUPABASE (PROYECTO, CRONOGRAMA Y REPOSITORIOS)
  // ---------------------------------------------------------------------------
  const seedInitialDataToSupabase = async () => {
    if (!isSupabaseConfigured || !supabase || !currentUser) return;
    const { data: existingProj } = await supabase.from('projects').select('id').limit(1);
    let projId = existingProj?.[0]?.id;

    if (!projId) {
      const { data: createdProj, error: projErr } = await supabase
        .from('projects')
        .insert([
          {
            name: INITIAL_PROJECT.name,
            code: INITIAL_PROJECT.code,
            description: INITIAL_PROJECT.description,
            objectives: INITIAL_PROJECT.objectives,
            leader_id: currentUser.id,
            start_date: INITIAL_PROJECT.start_date,
            end_date: INITIAL_PROJECT.end_date,
            status: 'en_ejecucion',
            repository_main_url: 'https://github.com/MAET211/seguimiento-proyecto',
            methodology: INITIAL_PROJECT.methodology,
            version: INITIAL_PROJECT.version,
          },
        ])
        .select()
        .single();
      if (projErr) throw projErr;
      projId = createdProj.id;
    }

    await fetchAllSupabaseData(currentUser.id);
    return projId;
  };

  // ---------------------------------------------------------------------------
  // MÉTRICAS EN TIEMPO REAL
  // ---------------------------------------------------------------------------
  const todayStr = new Date().toISOString().split('T')[0];

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completada').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'en_proceso').length;
  const inReviewTasks = tasks.filter((t) => t.status === 'en_revision').length;
  const returnedTasks = tasks.filter((t) => t.status === 'devuelta').length;
  const pendingTasks = tasks.filter((t) => t.status === 'pendiente').length;
  const overdueTasks = tasks.filter(
    (t) => t.status !== 'completada' && t.due_date && t.due_date < todayStr
  ).length;

  const overallProgress =
    totalTasks > 0
      ? Math.round(
          tasks.reduce(
            (acc, t) => acc + (t.status === 'completada' ? 100 : Number(t.progress || 0)),
            0
          ) / totalTasks
        )
      : 0;

  const myNotifications = notifications.filter((n) => n.user_id === currentUser?.id);
  const unreadNotificationsCount = myNotifications.filter((n) => !n.is_read).length;

  const isLeaderOrAdmin = currentUser?.role === 'lider' || currentUser?.role === 'admin';
  const isAdmin = currentUser?.role === 'admin';

  const value = {
    darkMode,
    setDarkMode,
    isSupabaseConfigured,
    loading,
    syncError,
    currentUser,
    isLeaderOrAdmin,
    isAdmin,
    profiles,
    invitations,
    project,
    projectMembers,
    workPlan,
    tasks,
    changelog,
    repositories,
    notifications,
    myNotifications,
    unreadNotificationsCount,
    metrics: {
      totalTasks,
      completedTasks,
      inProgressTasks,
      inReviewTasks,
      returnedTasks,
      pendingTasks,
      overdueTasks,
      overallProgress,
      todayStr,
    },
    login,
    resetPassword,
    logout,
    switchActiveRoleUser,
    updateMyProfile,
    adminUpdateUser,
    createInvitationOrUser,
    updateProjectDetails,
    upsertProjectMemberResponsibility,
    createTask,
    updateTask,
    updateTaskMemberProgress,
    submitTaskForLeaderReview,
    reviewTaskByLeader,
    deleteTask,
    addManualChangelog,
    addRepositoryResource,
    deleteRepositoryResource,
    addWorkPlanActivity,
    updateWorkPlanActivity,
    deleteWorkPlanActivity,
    markNotificationRead,
    markAllMyNotificationsRead,
    clearNotification,
    seedInitialDataToSupabase,
    refreshData: () => fetchAllSupabaseData(currentUser?.id),
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}
