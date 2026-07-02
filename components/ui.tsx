import Link from "next/link";
import { clsx } from "clsx";

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx("glass-card p-6 md:p-8", className)}>
      {children}
    </div>
  );
}

export function MetricCard({ 
  title, 
  value, 
  tone = "default",
  icon: Icon,
  change,
  trend
}: { 
  title: string; 
  value: string; 
  tone?: "default" | "good" | "bad";
  icon?: React.ReactNode;
  change?: string;
  trend?: "up" | "down";
}) {
  const tones = {
    good: "from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40",
    bad: "from-rose-500/20 to-rose-500/5 text-rose-400 border-rose-500/20 hover:border-rose-500/40",
    default: "from-indigo-500/20 to-indigo-500/5 text-white border-indigo-500/20 hover:border-[#5DA832]/40",
  };

  return (
    <div className={clsx("metric-card border bg-gradient-to-br p-6 transition-all duration-300", tones[tone])}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium opacity-70">{title}</p>
          <p className="mt-3 text-4xl font-bold tracking-tight">{value}</p>
          {change && (
            <p className={clsx("text-xs font-semibold mt-2", trend === "up" ? "text-emerald-400" : "text-rose-400")}>
              {trend === "up" ? "↑" : "↓"} {change}
            </p>
          )}
        </div>
        {Icon && (
          <div className="opacity-20">
            {Icon}
          </div>
        )}
      </div>
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-current opacity-5 blur-3xl" />
    </div>
  );
}

export function Button({ 
  children, 
  className, 
  variant = "primary",
  size = "md",
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}) {
  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    ghost: "text-slate-300 hover:text-white hover:bg-slate-800/30 transition-all duration-200 px-4 py-2 rounded-lg",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      {...props}
      className={clsx(
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={clsx(
        "input-modern",
        props.className
      )}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={clsx(
        "select-modern",
        props.className
      )}
    />
  );
}

export function NavLink({ href, children, isActive = false }: { href: string; children: React.ReactNode; isActive?: boolean }) {
  return (
    <Link
      href={href}
      className={clsx(
        "rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-[#5DA832]/20 text-[#5DA832] border border-[#5DA832]/30"
          : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent"
      )}
    >
      {children}
    </Link>
  );
}

export function Badge({ 
  children, 
  variant = "default", 
  className 
}: { 
  children: React.ReactNode; 
  variant?: "default" | "success" | "error" | "warning" | "info"; 
  className?: string 
}) {
  const variants = {
    default: "badge-default",
    success: "badge-success",
    error: "badge-error",
    warning: "badge-warning",
    info: "badge-info",
  };

  return (
    <span className={clsx(variants[variant], className)}>
      {children}
    </span>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="spinner-modern"></div>
    </div>
  );
}

export function FormGroup({ 
  label, 
  error, 
  children 
}: { 
  label?: string; 
  error?: string; 
  children: React.ReactNode 
}) {
  return (
    <div className="space-y-2">
      {label && <label className="label-modern">{label}</label>}
      {children}
      {error && <p className="text-xs text-rose-400 mt-1">{error}</p>}
    </div>
  );
}

export function PageHeader({ 
  title, 
  description, 
  action 
}: { 
  title: string; 
  description?: string; 
  action?: React.ReactNode 
}) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-white">{title}</h1>
        {description && <p className="text-slate-400 mt-2">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action 
}: { 
  icon?: React.ReactNode; 
  title: string; 
  description?: string; 
  action?: React.ReactNode 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {Icon && <div className="mb-4 text-slate-600">{Icon}</div>}
      <h3 className="text-lg font-semibold text-slate-300 mb-2">{title}</h3>
      {description && <p className="text-slate-500 text-sm mb-6 text-center max-w-sm">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}

export function Divider() {
  return <div className="border-t border-slate-800/40" />;
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={clsx("bg-slate-800/40 rounded-lg animate-pulse", className)} />
  );
}

export function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <div className="group relative inline-block">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 text-slate-200 text-xs px-3 py-1 rounded-lg whitespace-nowrap border border-slate-800/60 z-50">
        {text}
      </div>
    </div>
  );
}
