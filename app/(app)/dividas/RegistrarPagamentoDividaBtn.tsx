"use client";

import { useState } from "react";
import { CircleDollarSign, X } from "lucide-react";
import { savePagamento } from "@/app/(app)/actions_dividas";

interface Props {
  dividaId:     string;
  dividaNome:   string;
  restante:     number; // valor total - já pago, sugerido como padrão
  contas:       { id: string; nome: string }[];
  categorias:   { id: string; nome: string }[];
}

/**
 * Botão "Registrar pagamento" embutido em cada card de dívida — já vem com a
 * dívida pré-vinculada (divida_id), então o % pago e a situação (pendente →
 * parcial → liquidado) são recalculados automaticamente sem precisar passar
 * pelo formulário genérico de "Novo pagamento" e lembrar de selecionar a
 * dívida certa no dropdown.
 */
export default function RegistrarPagamentoDividaBtn({ dividaId, dividaNome, restante, contas, categorias }: Props) {
  const [aberto, setAberto] = useState(false);

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#5DA832]/10 text-[#5DA832] border border-[#5DA832]/30 transition-all duration-200 hover:bg-[#5DA832]/20"
      >
        <CircleDollarSign className="h-3 w-3" />
        Registrar pagamento
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#0D2340] border border-[#5DA832]/40 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between bg-[#5DA832]/10">
          <h3 className="font-bold text-white flex items-center gap-2 text-sm truncate">
            <CircleDollarSign className="h-4 w-4 text-[#5DA832] shrink-0" />
            <span className="truncate">Pagamento — {dividaNome}</span>
          </h3>
          <button onClick={() => setAberto(false)} className="text-slate-400 hover:text-white transition-colors shrink-0">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form action={savePagamento} className="p-6 space-y-4">
          <input type="hidden" name="divida_id" value={dividaId} />
          <input type="hidden" name="tipo" value="realizado" />

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Descrição</label>
            <input
              name="descricao"
              defaultValue={`Pagamento — ${dividaNome}`}
              className="w-full h-9 bg-surface/50 border border-surface-border rounded-lg px-3 text-sm text-white focus:outline-none focus:border-[#5DA832]/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Data</label>
              <input
                name="data"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                required
                className="w-full h-9 bg-surface/50 border border-surface-border rounded-lg px-3 text-sm text-white focus:outline-none focus:border-[#5DA832]/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Valor</label>
              <input
                name="valor"
                type="number"
                step="0.01"
                min="0.01"
                defaultValue={restante > 0 ? restante.toFixed(2) : undefined}
                required
                className="w-full h-9 bg-surface/50 border border-surface-border rounded-lg px-3 text-sm text-white focus:outline-none focus:border-[#5DA832]/50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Conta de saída</label>
            <select
              name="conta_id"
              defaultValue={contas[0]?.id ?? ""}
              className="w-full h-9 bg-surface/50 border border-surface-border rounded-lg px-3 text-sm text-white focus:outline-none focus:border-[#5DA832]/50"
            >
              <option value="">Nenhuma (não gera movimentação)</option>
              {contas.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Categoria</label>
            <select
              name="categoria_id"
              defaultValue=""
              className="w-full h-9 bg-surface/50 border border-surface-border rounded-lg px-3 text-sm text-white focus:outline-none focus:border-[#5DA832]/50"
            >
              <option value="">Sem categoria</option>
              {categorias.map((cat) => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
            </select>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setAberto(false)}
              className="flex-1 h-9 rounded-lg border border-surface-border text-slate-400 hover:bg-surface-2/60 hover:text-white transition-all text-sm font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={() => setAberto(false)}
              className="flex-1 h-9 rounded-lg bg-[#5DA832] hover:bg-[#6fc23b] text-white text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#5DA832]/20"
            >
              <CircleDollarSign className="h-4 w-4" />
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
