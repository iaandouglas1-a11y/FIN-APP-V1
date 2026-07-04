"use client";

import { useState } from "react";
import { Receipt, CalendarDays, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui";
import { currency, dateBR } from "@/lib/format";
import PagarFaturaBtn from "./PagarFaturaBtn";

interface Movimentacao {
  id: string;
  data: string;
  valor: number;
  descricao: string | null;
  categorias?: { nome: string } | null;
}

interface Props {
  faturaId:        string;
  cartaoId:        string;
  cartaoNome:      string;
  dataFechamento:  string;
  dataVencimento:  string;
  pago:            boolean;
  pagoEm:          string | null;
  observacao:      string | null;
  total:           number;
  isOverdue:       boolean;
  isDue:           boolean;
  expenses:        Movimentacao[];
  contas:          { id: string; nome: string }[];
}

export default function FaturaAccordion({
  faturaId, cartaoId, cartaoNome, dataFechamento, dataVencimento,
  pago, pagoEm, observacao, total, isOverdue, isDue, expenses, contas,
}: Props) {
  const [aberta, setAberta] = useState(false);

  return (
    <div className={`glass-card border-slate-800/60 relative overflow-hidden group p-0 ${pago ? "opacity-70" : ""}`}>
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#5DA832]/10 blur-3xl group-hover:bg-[#5DA832]/15 transition-all duration-300" />

      {/* Header — clicável */}
      <button
        type="button"
        onClick={() => setAberta((v) => !v)}
        className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 text-left hover:bg-slate-800/10 transition-colors duration-200 relative z-10"
      >
        {/* Esquerda: ícone + info */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#5DA832]/15 text-[#5DA832] flex items-center justify-center shrink-0">
            <Receipt className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white">{cartaoNome}</h2>
              {pago     && <Badge variant="success" className="text-[10px]">✓ Paga</Badge>}
              {isOverdue && <Badge variant="error"   className="text-[10px]">Vencida</Badge>}
              {isDue    && <Badge variant="warning"  className="text-[10px]">Vence em breve</Badge>}
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-0.5">
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <CalendarDays className="h-3 w-3" />
                <span>Fecha: <span className="text-slate-400">{dateBR(dataFechamento)}</span></span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Clock className="h-3 w-3" />
                <span>Vence: <span className="text-slate-400">{dateBR(dataVencimento)}</span></span>
              </div>
              {observacao && (
                <span className="text-xs text-slate-500 italic truncate max-w-[160px]">{observacao}</span>
              )}
            </div>
          </div>
        </div>

        {/* Direita: total + chevron */}
        <div className="flex items-center gap-3 shrink-0 ml-12 sm:ml-0">
          <div className="text-right">
            <p className="text-xs text-slate-500 uppercase tracking-wider">Total</p>
            <p className={`text-lg font-bold ${pago ? "text-[#5DA832]" : "text-white"}`}>{currency(total)}</p>
          </div>
          <div className="text-slate-500 shrink-0">
            {aberta ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </button>

      {/* Conteúdo expandido */}
      {aberta && (
        <div className="border-t border-slate-800/40 relative z-10">
          {/* Botão pagar */}
          <div className="px-5 py-3 border-b border-slate-800/30 flex items-center justify-between">
            <p className="text-xs text-slate-500">{expenses.length} {expenses.length === 1 ? "lançamento" : "lançamentos"}</p>
            <div onClick={(e) => e.stopPropagation()}>
              <PagarFaturaBtn
                faturaId={faturaId}
                cartaoId={cartaoId}
                total={total}
                pago={pago}
                pagoEm={pagoEm}
                contas={contas}
              />
            </div>
          </div>

          {/* Tabela de lançamentos */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800/40 bg-[#0D2340]/40">
                  <th className="px-5 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Data</th>
                  <th className="px-5 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Categoria</th>
                  <th className="px-5 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 hidden sm:table-cell">Observação</th>
                  <th className="px-5 py-2 text-right text-[10px] font-bold uppercase tracking-widest text-slate-500">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-6 text-center text-slate-600 italic text-xs">
                      Nenhuma despesa vinculada a esta fatura.
                    </td>
                  </tr>
                ) : expenses.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-5 py-2.5 text-slate-400 text-xs whitespace-nowrap">{dateBR(m.data)}</td>
                    <td className="px-5 py-2.5 text-slate-300 text-xs">{m.categorias?.nome || "—"}</td>
                    <td className="px-5 py-2.5 text-slate-500 text-xs hidden sm:table-cell truncate max-w-[180px]">
                      {m.descricao || "—"}
                    </td>
                    <td className="px-5 py-2.5 text-right font-semibold text-white text-xs whitespace-nowrap">
                      {currency(Number(m.valor))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
