type Props = {
  icon: any
  title: string
  subtitle?: string
  value?: string | number
  tone?: "green" | "red" | "neutral"
  onEdit?: () => void
}

export function FinancialRow({
  icon: Icon,
  title,
  subtitle,
  value,
  tone = "neutral",
  onEdit,
}: Props) {
  return (
    <div className="flex items-center justify-between py-3 px-3 rounded-xl bg-white/5 border border-white/10">

      {/* LEFT */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/10">
          <Icon className="w-4 h-4 text-white/70" />
        </div>

        <div className="min-w-0">
          <div className="text-sm font-medium text-white truncate">
            {title}
          </div>
          {subtitle && (
            <div className="text-xs text-white/50">
              {subtitle}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        {value !== undefined && (
          <div
            className={
              tone === "green"
                ? "text-green-400 text-sm font-medium"
                : tone === "red"
                ? "text-red-400 text-sm font-medium"
                : "text-white/70 text-sm font-medium"
            }
          >
            {value}
          </div>
        )}

        {onEdit && (
          <button className="text-white/50 text-sm" onClick={onEdit}>
            Editar
          </button>
        )}
      </div>

    </div>
  )
}
