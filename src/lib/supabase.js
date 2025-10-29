import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: { persistSession: true, autoRefreshToken: true },
  }
);

// helper to map UniqueID -> email-like identifier for login
export function idToAliasEmail(uniqueId) {
  const domain = import.meta.env.VITE_LOGIN_ALIAS_DOMAIN || "login.ucms";
  return `${uniqueId}@${domain}`;
}
