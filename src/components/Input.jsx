export default function Input({ label, error, className = "", ...props }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-slate-300">{label}</span>
      <input
        className={`w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 outline-none focus:border-slate-500 focus:ring-4 focus:ring-slate-700/40 ${className}`}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs text-red-400">{error}</span> : null}
    </label>
  );
}