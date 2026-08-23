import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const tones = {
  error: {
    className: "border-rose-200 bg-rose-50 text-rose-800",
    icon: AlertCircle,
  },
  success: {
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: CheckCircle2,
  },
  info: {
    className: "border-indigo-200 bg-indigo-50 text-indigo-800",
    icon: Info,
  },
};

export default function Alert({
  tone = "info",
  title,
  message,
  className,
}) {
  const config = tones[tone];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border px-4 py-3",
        config.className,
        className
      )}
      role="alert"
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="space-y-1">
        {title ? <p className="text-sm font-semibold">{title}</p> : null}
        {message ? <p className="text-sm">{message}</p> : null}
      </div>
    </div>
  );
}
