"use client";

import { useState } from "react";
import { CheckCircle, CreditCard, X } from "lucide-react";
import { pagarFatura } from "@/app/(app)/actions";
import { currency } from "@/lib/format";

interface Props {
  faturaId:  string;
  cartaoId:  string;
  total:     number;
  pago:      boolean;
  pagoEm:    string | null;
  contas:    { id: string; nome: string }[];
}

export default function PagarFaturaBtn({ faturaId, cartaoId, total, pago, pagoEm, contas }: Props) {
  const [aberto, setAberto] = useState(false);
  const [contaSelecionada, setContaSelecionada] = useState(contas[0]?.id ?? "");

  if (pago) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#5DA832]/10 border border-[#5DA832]/30 text-[#5DA832] text-sm font-semibold">
        <CheckCircle className="h-4 w-4" />
        Fatura paga
        {pagoEm && (
          <span className="text-[#5DA832]/60 font-normal text-xs ml-1">
            em {new Date(pagoEm).toLocaleDateString("pt-BR")}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {!aberto ? (
        <button
          type="button"
          onClick={() => setAberto(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#5DA832] hover:bg-[#6fc23b] text-white text-sm font-semibold transition-all duration-200 active:scale-95"
        >
          <CreditCard className="h-4 w-4" />
          Pagar Fatura
        </button>
      ) : (
        <div className="flex items-center gap-2 p-2 rounded-xl bg-[#0D2340] border border-[#5DA832]/40">
          <select
            value={contaSelecionada}
            onChange={(e) => setContaSelecionada(e.target.value)}
            className="select-modern h-9 text-sm flex-1 min-w-0"
          >
            {contas.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>

          <form action={pagarFatura}>
            <input type="hidden" name="fatura_id"  value={faturaId} />
            <input type="hidden" name="cartao_id"  value={cartaoId} />
            <input type="hidden" name="conta_id"   value={contaSelecionada} />
            <input type="hidden" name="total"      value={total} />
            <button
              type="submit"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#5DA832] hover:bg-[#6fc23b] text-white text-xs font-semibold transition-all duration-200 whitespace-nowrap"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Confirmar {currency(total)}
            </button>
          </form>

          <button
            type="button"
            onClick={() => setAberto(false)}
            className="p-2 text-slate-500 hover:text-slate-300 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
