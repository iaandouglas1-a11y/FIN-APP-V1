"use client";

import { useState } from "react";
import { CheckCircle, X, RotateCcw, HandCoins } from "lucide-react";
import { marcarHonorarioPago, cancelarPagamentoHonorario } from "@/app/(app)/actions_honorarios";
import { currency } from "@/lib/format";

interface Props {
  honorarioId: string;
  clienteNome: string;
  valor:       number;
  pago:        boolean;
  pagoEm:      string | null;
  contas:      { id: string; nome: string }[];
}

export default function PagarHonorarioBtn({ honorarioId, clienteNome, valor, pago, pagoEm, contas }: Props) {
  const [aberto, setAberto] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [contaSelecionada, setContaSelecionada] = useState(contas[0]?.id ?? "");

  // --- Já pago ---
  if (pago) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#5DA832]/10 border border-[#5DA832]/30 text-[#5DA832] text-xs font-semibold">
          <CheckCircle className="h-3.5 w-3.5 shrink-0" />
          <span>Pago</span>
          {pagoEm && (
            <span className="text-[#5DA832]/60 font-normal">
              em {new Date(pagoEm + "T00:00:00").toLocaleDateString("pt-BR")}
            </span>
          )}
        </div>

        {!cancelando ? (
          <button
            type="button"
            onClick={() => setCancelando(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 transition-all duration-200"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Cancelar baixa
          </button>
        ) : (
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#0D2340] border border-amber-500/40">
            <span className="text-xs text-amber-400 px-1">Confirmar?</span>
            <form action={cancelarPagamentoHonorario}>
              <input type="hidden" name="id" value={honorarioId} />
              <button
                type="submit"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-xs font-semibold transition-all duration-200"
              >
                Sim, cancelar
              </button>
            </form>
            <button
              type="button"
              onClick={() => setCancelando(false)}
              className="p-1 text-slate-500 hover:text-slate-300 rounded-lg transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // --- Pendente ---
  return (
    <div className="relative">
      {!aberto ? (
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5DA832] hover:bg-[#6fc23b] text-white text-xs font-semibold transition-all duration-200 active:scale-95"
        >
          <HandCoins className="h-3.5 w-3.5" />
          Marcar como pago
        </button>
      ) : (
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#0D2340] border border-[#5DA832]/40">
          <select
            value={contaSelecionada}
            onChange={(e) => setContaSelecionada(e.target.value)}
            className="select-modern h-8 text-xs flex-1 min-w-[120px]"
          >
            <option value="">Sem conta (só marcar)</option>
            {contas.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>

          <form action={marcarHonorarioPago}>
            <input type="hidden" name="id" value={honorarioId} />
            <input type="hidden" name="conta_id" value={contaSelecionada} />
            <input type="hidden" name="valor" value={valor} />
            <input type="hidden" name="cliente_nome" value={clienteNome} />
            <button
              type="submit"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#5DA832] hover:bg-[#6fc23b] text-white text-xs font-semibold transition-all duration-200 whitespace-nowrap"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Confirmar {currency(valor)}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setAberto(false)}
            className="p-1.5 text-slate-500 hover:text-slate-300 rounded-lg transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
