"use client";

import { RotateCcw } from "lucide-react";
import { desfazerPagamento } from "@/app/(app)/actions_dividas";
import { useState } from "react";

interface Props {
  pagamentoId: string;
  tipo: "orcado" | "realizado";
}

export default function DesfazerPagamentoBtn({ pagamentoId, tipo }: Props) {
  const [confirmando, setConfirmando] = useState(false);

  if (confirmando) {
    return (
      <form action={desfazerPagamento} className="inline-flex items-center gap-1 animate-in fade-in duration-200">
        <input type="hidden" name="id" value={pagamentoId} />
        <button
          type="submit"
          className="text-[10px] px-2 py-0.5 bg-rose-500 text-white rounded hover:bg-rose-600 transition-colors font-bold"
        >
          Confirmar Desfazer
        </button>
        <button
          type="button"
          onClick={() => setConfirmando(false)}
          className="text-[10px] px-2 py-0.5 bg-slate-700 text-slate-300 rounded hover:bg-slate-600 transition-colors"
        >
          Não
        </button>
      </form>
    );
  }

  return (
    <button
      onClick={() => setConfirmando(true)}
      className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
      title={tipo === "realizado" ? "Voltar para orçado" : "Remover orçado"}
    >
      <RotateCcw className="h-3.5 w-3.5" />
    </button>
  );
}
