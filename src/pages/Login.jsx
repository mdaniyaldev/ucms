// src/pages/Login.jsx
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect } from "react";

const schema = z.object({
  uniqueId: z.string().min(3, "Enter your University ID"),
  password: z.string().min(6, "Minimum 6 characters required"),
});

export default function Login() {
  const navigate = useNavigate();
  const { login, user, loading } = useAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { uniqueId: "", password: "" },
  });

  // 🚀 Redirect if already logged in
  useEffect(() => {
    if (!loading && user) navigate("/dashboard", { replace: true });
  }, [loading, user, navigate]);

  async function onSubmit(values) {
    try {
      await login(values);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg =
        err?.message?.includes("Invalid login credentials")
          ? "Invalid University ID or password"
          : err?.message || "Login failed. Try again.";
      setError("password", { type: "server", message: msg });
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl">
        <h1 className="mb-6 text-center text-2xl font-bold text-white">
          UCMS — Sign In
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* University ID */}
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              University ID
            </label>
            <input
              type="text"
              placeholder="e.g., FA22-123"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:ring-4 focus:ring-slate-700/40"
              {...register("uniqueId")}
            />
            {errors.uniqueId && (
              <p className="mt-1 text-xs text-red-400">
                {errors.uniqueId.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:ring-4 focus:ring-slate-700/40"
              {...register("password")}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-3 rounded-lg bg-emerald-600 py-2 font-semibold text-white hover:bg-emerald-500 disabled:opacity-60 transition"
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>

          {/* Footer */}
          <p className="text-center text-sm text-slate-400 mt-3">
            Need access? Contact your Department Coordinator.
          </p>
        </form>
      </div>
    </div>
  );
}