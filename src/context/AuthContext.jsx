import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase, idToAliasEmail } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);         
  const [loading, setLoading] = useState(true);    
  const [authLoading, setAuthLoading] = useState(false); 

  async function fetchProfile(userId) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, unique_id, role, department_id")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("[Auth] fetchProfile error:", error.message);
        return null;
      }
      return data ?? null;
    } catch (e) {
      console.error("[Auth] fetchProfile exception:", e);
      return null;
    }
  }

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) console.error("[Auth] getSession error:", error.message);
        if (!mounted) return;

        const currentSession = data?.session ?? null;
        setSession(currentSession);

        if (currentSession?.user) {
          const profile = await fetchProfile(currentSession.user.id);
          if (!mounted) return;
          setUser(profile);
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error("[Auth] hydrate exception:", e);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_evt, sess) => {
      try {
        setSession(sess);

        if (!sess?.user) {
          setUser(null);
          setLoading(false); 
          return;
        }

        const profile = await fetchProfile(sess.user.id);
        setUser(profile);
      } catch (e) {
        console.error("[Auth] onAuthStateChange exception:", e);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function login({ uniqueId, password }) {
    setAuthLoading(true);
    try {
      const email = idToAliasEmail(String(uniqueId || "").trim());
      console.log("[DEBUG] email used to sign in:", email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      const uid = data?.user?.id;
      if (!uid) throw new Error("Login failed: no user returned");

      const profile = await fetchProfile(uid);
      setUser(profile);
      setSession(data.session ?? null);
      return profile;
    } catch (e) {
      console.error("[Auth] login error:", e?.message || e);
      throw e;
    } finally {
      setAuthLoading(false);
      setLoading(false);
    }
  }

  async function logout() {
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.warn(
          "[Auth] global signOut error, falling back to local:",
          error.message
        );

        try {
          await supabase.auth.signOut({ scope: "local" });
        } catch (e) {
          console.error("[Auth] local signOut error:", e?.message || e);
        }
      }

      setUser(null);
      setSession(null);
    } finally {
      setAuthLoading(false);
      setLoading(false);
    }
  }

  async function signup({
    uniqueId,
    password,
    role = "student",
    department_id = null,
  }) {
    try {
      const email = idToAliasEmail(String(uniqueId || "").trim());
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      const authUserId = data?.user?.id;
      if (authUserId) {
        const { error: pErr } = await supabase.from("profiles").insert({
          id: authUserId,
          unique_id: uniqueId,
          role,
          department_id,
        });
        if (pErr) throw pErr;
      }
      return { ok: true };
    } catch (e) {
      console.error("[Auth] signup error:", e?.message || e);
      throw e;
    }
  }

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      authLoading,
      login,
      logout,
      signup,
    }),
    [user, session, loading, authLoading]
  );

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-950">
        <div className="text-slate-300">Loading…</div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}