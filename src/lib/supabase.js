import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anon) {
  console.warn(
    "[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY"
  );
}

export const supabase = createClient(url, anon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Map University ID -> alias email used in Auth (always lowercase + trimmed)
export function idToAliasEmail(uniqueId) {
  const domain = (
    import.meta.env.VITE_LOGIN_ALIAS_DOMAIN || "login.ucms"
  ).toLowerCase();

  return `${String(uniqueId || "")
    .trim()
    .toLowerCase()}@${domain}`;
}

/* ============================
   AUTH HELPERS (NON-BREAKING)
   ============================ */

/**
 * Sign up using University ID (e.g. FA22-123) + password.
 * It converts ID -> alias email like "fa22-123@login.ucms".
 */
export async function signUpWithUniversityId(uniqueId, password) {
  const email = idToAliasEmail(uniqueId);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  return data; // { user, session }
}

/**
 * Sign in using University ID + password.
 */
export async function signInWithUniversityId(uniqueId, password) {
  const email = idToAliasEmail(uniqueId);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data; // { user, session }
}

/**
 * Get current authenticated user (or null if not logged in).
 */
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user ?? null;
}

/**
 * Get current session (access token, etc.)
 */
export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session ?? null;
}

/**
 * Sign out current user.
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// TEMP: Expose supabase to window for debugging ONLY
if (typeof window !== "undefined") {
  window.supabase = supabase;
}