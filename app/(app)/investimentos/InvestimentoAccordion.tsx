"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Trash2, Pencil } from "lucide-react";
import { currency, dateBR } from "@/lib/format";
import { deleteMovimento, atualizarValorAtual } from "@/app/(app)/actions_investimentos";
import type { InvestimentoMovimento } from "@/types/database";

interface Props {
  id:          string;
  nome:        string;
  tipo:        "renda_fixa" | "renda_variavel";
  ticker:      string | null;
  contaNome:   string | null;
  valorAtual:  number;
  movimentos:  InvestimentoMovimento[];
}

export default function InvestimentoAccordion({ id, nome, tipo, ticker, contaNome, valorAtual, movimentos }: Props) {
  const [open, setOpen]           = useState(false);
  const [editando, setEditando]   = useState(false);
  const [novoValor, setNovoValor] = useState(String(valorAtual));

  const totalAportado = movimentos
    .filter(m => m.tipo === "aporte")
    .reduce((s, m) => s + Number(m.valor), 0);
  const totalResgatado = movimentos
    .filter(m => m.tipo === "resgate")
    .reduce((s, m) => s + Number(m.valor), 0);
  const valorInvestido = totalAportado - totalResgatado;
  const rentabilidade  = valorInvestido > 0 ? ((valorAtual - valorInvestido) / valorInvestido) * 100 : 0;
  const positivo       = rentabilidade >= 0;

  return (
    <div className="rounded-xl border border-surface-border/60 bg-[#0D2340]/50 overflow-hidden">

      {/* HEADER */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-2/30 transition text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
            tipo === "renda_fixa" ? "bg-blue-500/15 text-blue-400" : "bg-[#5DA832]/15 text-[#5DA832]"
          }`}>
            {tipo === "renda_fixa"
              ? <TrendingUp className="h-4 w-4" />
              : <TrendingUp className="h-4 w-4" />
            }
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-slate-200">{nome}</p>
              {ticker && <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-2 text-slate-400 font-mono">{ticker}</span>}
              <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${
                tipo === "renda_fixa"
                  ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                  : "bg-[#5DA832]/10 border-[#5DA832]/30 text-[#5DA832]"
              }`}>
                {tipo === "renda_fixa" ? "Renda Fixa" : "Renda Variável"}
              </span>
            </div>
            {contaNome && <p className="text-xs text-slate-500 mt-0.5">{contaNome}</p>}
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <p className="text-sm font-bold text-white">{currency(valorAtual)}</p>
            <p className={`text-xs font-semibold ${positivo ? "text-[#5DA832]" : "text-rose-400"}`}>
              {positivo ? "+" : ""}{rentabilidade.toFixed(2)}%
            </p>
          </div>
          {open ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
        </div>
      </button>

      {/* BODY */}
      {open && (
        <div className="border-t border-surface-border/40 px-5 py-4 space-y-4">

          {/* Métricas */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-bg/60 rounded-lg p-3 border border-surface-border/40">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Total Aportado</p>
              <p className="text-sm font-bold text-white">{currency(totalAportado)}</p>
            </div>
            <div className="bg-bg/60 rounded-lg p-3 border border-surface-border/40">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Valor Investido</p>
              <p className="text-sm font-bold text-white">{currency(valorInvestido)}</p>
            </div>
            <div className={`rounded-lg p-3 border ${positivo ? "bg-[#5DA832]/5 border-[#5DA832]/20" : "bg-rose-500/5 border-rose-500/20"}`}>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Rentabilidade</p>
              <p className={`text-sm font-bold ${positivo ? "text-[#5DA832]" : "text-rose-400"}`}>
                {positivo ? "+" : ""}{currency(valorAtual - valorInvestido)}
              </p>
            </div>
          </div>

          {/* Atualizar valor atual */}
          <div className="flex items-center gap-2">
            {!editando ? (
              <button
                type="button"
                onClick={() => setEditando(true)}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#5DA832] transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
                Atualizar valor atual
              </button>
            ) : (
              <form action={atualizarValorAtual} className="flex items-center gap-2">
                <input type="hidden" name="id" value={id} />
                <input
                  type="number"
                  name="valor_atual"
                  value={novoValor}
                  onChange={e => setNovoValor(e.target.value)}
                  step="0.01"
                  min="0"
                  className="input-modern h-8 w-36 text-sm"
                />
                <button type="submit" className="px-3 py-1.5 rounded-lg bg-[#5DA832] text-white text-xs font-semibold hover:bg-[#6fc23b] transition-colors">
                  Salvar
                </button>
                <button type="button" onClick={() => setEditando(false)} className="text-xs text-slate-500 hover:text-slate-300">
                  Cancelar
                </button>
              </form>
            )}
          </div>

          {/* Histórico de movimentos */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Histórico</p>
            {movimentos.length === 0 ? (
              <p className="text-xs text-slate-600 italic">Nenhum aporte ou resgate registrado.</p>
            ) : (
              <div className="space-y-1">
                {movimentos.map(m => (
                  <div key={m.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface-2/40 group/mov">
                    <div className={`h-5 w-5 rounded flex items-center justify-center shrink-0 ${
                      m.tipo === "aporte" ? "bg-[#5DA832]/15 text-[#5DA832]" : "bg-rose-500/15 text-rose-400"
                    }`}>
                      {m.tipo === "aporte"
                        ? <TrendingUp className="h-3 w-3" />
                        : <TrendingDown className="h-3 w-3" />
                      }
                    </div>
                    <span className="text-xs text-slate-500 w-16 shrink-0">{dateBR(m.data)}</span>
                    <span className="text-xs text-slate-300 flex-1 truncate">{m.descricao || (m.tipo === "aporte" ? "Aporte" : "Resgate")}</span>
                    <span className={`text-xs font-semibold shrink-0 ${m.tipo === "aporte" ? "text-[#5DA832]" : "text-rose-400"}`}>
                      {m.tipo === "aporte" ? "+" : "-"}{currency(Number(m.valor))}
                    </span>
                    <form action={deleteMovimento} className="shrink-0">
                      <input type="hidden" name="id" value={m.id} />
                      <button type="submit" className="opacity-0 group-hover/mov:opacity-100 p-1 text-slate-600 hover:text-rose-400 rounded transition-all">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
