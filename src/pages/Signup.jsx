// src/pages/Signup.jsx
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";

const schema = z.object({
  name: z.string().min(2, "Enter your full name"),
  uniqueId: z.string().min(3, "Enter your University ID"),
  email: z.string().email("Enter a valid email"),
  reason: z.string().min(10, "Please describe why you need access"),
});

export default function Signup() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", uniqueId: "", email: "", reason: "" },
  });

  async function onSubmit(values) {
    await new Promise((r) => setTimeout(r, 800)); // fake delay
    alert("Request submitted! Admin will review your access.");
    reset();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl">
        <h1 className="mb-6 text-center text-2xl font-bold text-white">
          UCMS — Request Access
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-sm text-slate-300 mb-1">Full Name</label>
            <input
              placeholder="Daniyal Ahmed"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:ring-4 focus:ring-slate-700/40"
              {...register("name")}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
            )}
          </div>

          {/* University ID */}
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              University ID
            </label>
            <input
              placeholder="e.g., FA22-123"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:ring-4 focus:ring-slate-700/40"
              {...register("uniqueId")}
            />
            {errors.uniqueId && (
              <p className="mt-1 text-xs text-red-400">{errors.uniqueId.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-slate-300 mb-1">Email</label>
            <input
              type="email"
              placeholder="you@university.edu"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:ring-4 focus:ring-slate-700/40"
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Reason for Request
            </label>
            <textarea
              rows={3}
              placeholder="Explain your reason for requesting UCMS access..."
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:ring-4 focus:ring-slate-700/40"
              {...register("reason")}
            />
            {errors.reason && (
              <p className="mt-1 text-xs text-red-400">{errors.reason.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-3 rounded-lg bg-emerald-600 py-2 font-semibold text-white hover:bg-emerald-500 disabled:opacity-60 transition"
          >
            {isSubmitting ? "Submitting…" : "Submit Request"}
          </button>

          <p className="text-center text-sm text-slate-400 mt-3">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-sky-400 hover:text-sky-300 underline"
            >
              Log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}