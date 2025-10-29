import { supabase } from "./supabase";

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-create-user`;

export async function createUserAsAdmin({ uniqueId, password, role, department_id }) {
  // Must be signed in as admin
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const res = await fetch(FN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`, // IMPORTANT
    },
    body: JSON.stringify({ uniqueId, password, role, department_id }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json?.error || `Failed (${res.status})`);
  }
  return json; // { ok: true, user_id: ... }
}