import { createClient } from '@supabase/supabase-js';

// Lectura desde variables de entorno de Vite (.env)
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Permitir también configuración dinámica desde el asistente de conexión si aún no se ha compilado con .env
const runtimeUrl = typeof window !== 'undefined' ? window.sessionStorage.getItem('NEXUS_SUPABASE_URL') || '' : '';
const runtimeKey = typeof window !== 'undefined' ? window.sessionStorage.getItem('NEXUS_SUPABASE_ANON_KEY') || '' : '';

export const supabaseUrl = (envUrl && !envUrl.includes('tu-proyecto-id')) ? envUrl : runtimeUrl;
export const supabaseAnonKey = (envAnonKey && !envAnonKey.includes('tu_clave_publica')) ? envAnonKey : runtimeKey;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  supabaseAnonKey.length > 20
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Permite guardar temporalmente las credenciales de Supabase en la sesión del navegador
 * para verificar la conexión en vivo antes de definir el archivo .env definitivo.
 */
export function setRuntimeSupabaseCredentials(url, anonKey) {
  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem('NEXUS_SUPABASE_URL', url.trim());
    window.sessionStorage.setItem('NEXUS_SUPABASE_ANON_KEY', anonKey.trim());
    window.location.reload();
  }
}

export function clearRuntimeSupabaseCredentials() {
  if (typeof window !== 'undefined') {
    window.sessionStorage.removeItem('NEXUS_SUPABASE_URL');
    window.sessionStorage.removeItem('NEXUS_SUPABASE_ANON_KEY');
    window.location.reload();
  }
}
