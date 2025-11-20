import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anon) {
  console.warn(
    "[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY"
  );
}

export const supabase = createClient(url, anon, {
  auth: { persistSession: true, autoRefreshToken: true },
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
