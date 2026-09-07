"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, CheckCircle, Circle, Trash2, type LucideIcon } from "lucide-react";
import { clsx } from "clsx";
import { currency, dateBR } from "@/lib/format";
import { alterarSituacaoDivida, deleteDivida } from "@/app/(app)/actions_dividas";
import { IconChip, Badge, AmountText, ProgressBar } from "@/components/ui";
import type { IconTone } from "@/components/ui";
import EditarDividaBtn from "./EditarDividaBtn";

interface Props {
  divida: {
    id: string;
    descricao: string;
    valor: number;
    data: string;
    situacao: string;
    observacao: string | null;
    categoria_id: string | null;
  };
  categorias: { id: string; nome: string }[];
  icon: LucideIcon;
  tone: IconTone;
  pct: number;
  pagos: number;
}

/** Card de dívida — colapsado mostra só o essencial (nome, status, valor);
 * clique expande com data, progresso e ações (liquidar/editar/excluir). */
export default function DividaAccordion({ divida, categorias, icon, tone, pct, pagos }: Props) {
  const [open, setOpen] = useState(false);
  const liquidada = divida.situacao === "liquidado";

  return (
    <div className={clsx("surface-2 bg-surface overflow-hidden", liquidada && "opacity-60")}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setOpen((v) => !v); }}
        className="w-full flex items-center gap-3 p-3.5 cursor-pointer hover:bg-surface-2/40 transition-colors"
      >
        <IconChip icon={icon} tone={tone} size={38} iconSize={17} />
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-semibold text-ink-primary truncate">{divida.descricao}</div>
          <div className="flex items-center gap-1.5 flex-wrap mt-1">
            {liquidada ? (
              <Badge variant="success" className="text-[10px]">✓ Liquidado</Badge>
            ) : (
              <Badge variant={pct > 0 ? "warning" : "error"} className="text-[10px]">
                {pct > 0 ? `Parcial · ${Math.round(pct)}% pago` : "Pendente"}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <AmountText value={Number(divida.valor)} tone={liquidada ? "neutral" : "red"} />
          {open ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
        </div>
      </div>

      {open && (
        <div className="px-3.5 pb-3.5">
          <div className="text-[11px] text-ink-tertiary flex items-center gap-1.5 flex-wrap mb-2">
            <span>{dateBR(divida.data)}</span>
            {divida.observacao && <span>· {divida.observacao}</span>}
          </div>

          {!liquidada && (
            <>
              <ProgressBar pct={pct} color={pct > 60 ? "#5DA832" : pct > 0 ? "#F5A524" : "#1E3A66"} />
              {pagos > 0 && (
                <p className="text-[10.5px] text-ink-tertiary mt-1.5">
                  {currency(pagos)} pagos de {currency(Number(divida.valor))}
                </p>
              )}
            </>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-border/40 gap-2">
            <form action={alterarSituacaoDivida}>
              <input type="hidden" name="id" value={divida.id} />
              <input type="hidden" name="situacao" value={divida.situacao} />
              <button
                type="submit"
                className={clsx(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all duration-200 border",
                  liquidada
                    ? "bg-[#5DA832]/10 text-[#5DA832] border-[#5DA832]/30"
                    : "bg-danger/10 text-[#f87171] border-danger/20"
                )}
              >
                {liquidada ? <CheckCircle className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                {liquidada ? "Reabrir" : "Marcar como liquidada"}
              </button>
            </form>
            <div className="flex items-center gap-1 shrink-0">
              <EditarDividaBtn divida={divida as any} categorias={categorias} />
              <form action={deleteDivida}>
                <input type="hidden" name="id" value={divida.id} />
                <button type="submit" className="p-1.5 text-slate-600 hover:text-[#f87171] rounded-lg transition-colors">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
