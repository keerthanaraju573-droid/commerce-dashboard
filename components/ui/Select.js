import { cn } from "@/lib/utils";

export default function Select({
  label,
  error,
  className,
  id,
  children,
  ...props
}) {
  return (
    <label className="block space-y-1.5" htmlFor={id}>
      {label ? (
        <span className="text-sm font-medium text-slate-700">{label}</span>
      ) : null}
      <select
        id={id}
        className={cn(
          "h-11 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 outline-none transition-shadow focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100",
          error ? "border-rose-400" : "border-slate-200",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
    </label>
  );
}
