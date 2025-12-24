import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase, idToAliasEmail } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null); // Supabase session
  const [user, setUser] = useState(null); // { id, unique_id, role, department_id }
  const [loading, setLoading] = useState(true); // initial load / refresh
  const [authLoading, setAuthLoading] = useState(false); // login/signup only

  // helper: fetch profile by auth user id
  // In AuthContext.jsx, change the fetchProfile function back to:
  async function fetchProfile(userId) {
    try {
      console.log("[Auth] fetchProfile for userId =", userId);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, unique_id, role, department_id")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("[Auth] fetchProfile error:", error.message);
        return null;
      }

      console.log("[Auth] fetchProfile result:", data);
      return data ?? null;
    } catch (e) {
      console.error("[Auth] fetchProfile exception:", e);
      return null;
    }
  }
  // initial hydrate on page refresh / first load
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        console.log("[Auth] hydrate: getSession start");
        const { data, error } = await supabase.auth.getSession();
        if (error) console.error("[Auth] getSession error:", error.message);
        if (!mounted) return;

        const currentSession = data?.session ?? null;
        console.log("[Auth] hydrate: currentSession =", currentSession);
        setSession(currentSession);

        if (currentSession?.user) {
          const profile = await fetchProfile(currentSession.user.id);
          if (!mounted) return;

          if (!profile) {
            console.warn(
              "[Auth] hydrate: session present but profile missing -> signing out"
            );
            await supabase.auth.signOut({ scope: "local" });
            setUser(null);
            setSession(null);
          } else {
            setUser(profile);
          }
        } else {
          setUser(null);
        }
      } catch (e) {
        console.error("[Auth] hydrate exception:", e);
        if (mounted) {
          setUser(null);
          setSession(null);
        }
      } finally {
        if (mounted) {
          console.log("[Auth] hydrate: loading=false");
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // login with role check
  async function login({ uniqueId, password, expectedRole }) {
    setAuthLoading(true);
    try {
      const email = idToAliasEmail(String(uniqueId || "").trim());
      console.log(
        "[Auth] login: email used =",
        email,
        "expectedRole =",
        expectedRole
      );

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      const uid = data?.user?.id;
      if (!uid) throw new Error("Login failed: no user returned");

      const profile = await fetchProfile(uid);
      if (!profile) {
        console.warn("[Auth] login: profile not found -> signing out");
        await supabase.auth.signOut({ scope: "local" });
        throw new Error("Profile not found for this user.");
      }

      // role mismatch handling
      if (expectedRole && profile.role !== expectedRole) {
        console.warn(
          "[Auth] role mismatch:",
          "selected =",
          expectedRole,
          "profile =",
          profile.role
        );
        await supabase.auth.signOut({ scope: "local" });
        throw new Error(`ROLE_MISMATCH:${profile.role}`);
      }

      setUser(profile);
      setSession(data.session ?? null);
      setLoading(false);
      return profile;
    } catch (e) {
      console.error("[Auth] login error:", e?.message || e);
      throw e;
    } finally {
      setAuthLoading(false);
    }
  }

  // ------------------------------ logout ------------------------------
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

  // ------------------------------ signup ------------------------------
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
    // Sirf initial hydration ke liye — agar stuck issue tha,
    // ab getSession complete hone ke baad hamesha false ho jayega.
    return (
      <div className="min-h-screen grid place-items-center bg-slate-950">
        <div className="text-slate-300">Loading...</div>
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
