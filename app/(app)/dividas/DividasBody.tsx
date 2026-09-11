"use client";

import { useState, useMemo } from "react";
import { Plus, TrendingDown } from "lucide-react";
import { Card, StatPill } from "@/components/ui";
import { currency } from "@/lib/format";
import DividaAccordion from "./DividaAccordion";
import PagamentoAccordion from "./PagamentoAccordion";
import DividaQuickForms from "./DividaQuickForms";

type Props = {
  totalDevido: number;
  totalPago: number;
  saldoAtual: number;
  dividasAbertas: any[];
  dividasLiquidadas: any[];
  fluxo: any[];
  categorias: any[];
  contas: any[];
};

export default function DividasBody({
  totalDevido,
  totalPago,
  saldoAtual,
  dividasAbertas,
  dividasLiquidadas,
  fluxo,
  categorias,
  contas,
}: Props) {
  const [aba, setAba] = useState<"aberto" | "liquidado">("aberto");
  const [filtroFluxo, setFiltroFluxo] = useState<"este_mes" | "mes_anterior" | "2_meses">("este_mes");

  const lista = aba === "aberto" ? dividasAbertas : dividasLiquidadas;

  // Filtro de datas pro fluxo
  const hoje = new Date();
  const fluxoFiltrado = useMemo(() => {
    if (fluxo.length === 0) return [];

    let dataInicio: Date;
    if (filtroFluxo === "este_mes") {
      dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    } else if (filtroFluxo === "mes_anterior") {
      dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
    } else {
      dataInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 2, 1);
    }

    return fluxo.filter(p => {
      if (!p.data) return false;
      const dataPag = new Date(p.data);
      return dataPag >= dataInicio && dataPag <= hoje;
    });
  }, [fluxo, filtroFluxo, hoje]);

  return (
    <>
      {/* Métricas — 3 pills */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface/50 border border-surface-border/40 rounded-lg p-3.5">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Total devido</p>
          <p className="text-lg font-bold text-rose-400">{currency(totalDevido)}</p>
        </div>
        <div className="bg-surface/50 border border-surface-border/40 rounded-lg p-3.5">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Total pago</p>
          <p className="text-lg font-bold text-emerald-400">{currency(totalPago)}</p>
        </div>
      </div>

      <div className="bg-surface/50 border border-surface-border/40 rounded-lg p-3.5">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Saldo em aberto</p>
        <p className="text-lg font-bold text-amber-400">{currency(saldoAtual)}</p>
      </div>

      {/* Botões — Nova dívida | Novo pagamento */}
      <DividaQuickForms categorias={categorias} contas={contas} dividasAbertas={dividasAbertas} />

      {/* Toggle Aberto/Liquidado */}
      <div className="flex gap-1.5 bg-surface-2/60 rounded-xl p-1">
        <button
          type="button"
          onClick={() => setAba("aberto")}
          className={`flex-1 text-center py-2 rounded-lg text-[12.5px] font-semibold transition-all duration-200 ${
            aba === "aberto" ? "bg-[#5DA832]/20 text-[#6fc23b]" : "text-ink-tertiary hover:text-ink-secondary"
          }`}
        >
          Em aberto ({dividasAbertas.length})
        </button>
        <button
          type="button"
          onClick={() => setAba("liquidado")}
          className={`flex-1 text-center py-2 rounded-lg text-[12.5px] font-semibold transition-all duration-200 ${
            aba === "liquidado" ? "bg-[#5DA832]/20 text-[#6fc23b]" : "text-ink-tertiary hover:text-ink-secondary"
          }`}
        >
          Liquidadas ({dividasLiquidadas.length})
        </button>
      </div>

      {/* Lista de dívidas */}
      <Card className="border-surface-border/60 p-4">
        <div className="mb-4 pb-3 border-b border-surface-border/50">
          <h2 className="text-[15px] font-bold text-white">
            {aba === "aberto" ? "Dívidas em aberto" : "Dívidas liquidadas"}
          </h2>
          <p className="text-xs text-ink-tertiary mt-1">
            {lista.length} {lista.length === 1 ? "dívida" : "dívidas"}
          </p>
        </div>

        <div className="space-y-2.5">
          {lista.length === 0 ? (
            <p className="text-center py-6 text-sm text-slate-600 italic">
              {aba === "aberto" ? "Nenhuma dívida em aberto. 🎉" : "Nenhuma dívida liquidada ainda."}
            </p>
          ) : (
            lista.map((d) => (
              <DividaAccordion
                key={d.id}
                divida={d}
                categorias={categorias}
                categoriaNome={d.categoriaNome}
                tone={d.situacao === "liquidado" ? "green" : d.pct > 0 ? "amber" : "red"}
                pct={d.pct}
                pagos={d.pagos}
              />
            ))
          )}
        </div>
      </Card>

      {/* Fluxo de Pagamentos */}
      <Card className="border-surface-border/60 p-4">
        <div className="mb-4 pb-3 border-b border-surface-border/50">
          <h2 className="text-[15px] font-bold text-white">Fluxo de pagamentos</h2>
          <p className="text-xs text-ink-tertiary mt-1">Pagamentos registrados por data</p>
        </div>

        {/* Filtro de datas */}
        <div className="flex gap-2 mb-4 pb-3 border-b border-surface-border/40 flex-wrap">
          <button
            type="button"
            onClick={() => setFiltroFluxo("este_mes")}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-150 ${
              filtroFluxo === "este_mes"
                ? "bg-surface-2 border-[#5DA832]/50 text-white"
                : "bg-surface/30 border-surface-border/40 text-slate-500 hover:text-slate-400"
            }`}
          >
            Este mês
          </button>
          <button
            type="button"
            onClick={() => setFiltroFluxo("mes_anterior")}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-150 ${
              filtroFluxo === "mes_anterior"
                ? "bg-surface-2 border-[#5DA832]/50 text-white"
                : "bg-surface/30 border-surface-border/40 text-slate-500 hover:text-slate-400"
            }`}
          >
            Mês anterior
          </button>
          <button
            type="button"
            onClick={() => setFiltroFluxo("2_meses")}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all duration-150 ${
              filtroFluxo === "2_meses"
                ? "bg-surface-2 border-[#5DA832]/50 text-white"
                : "bg-surface/30 border-surface-border/40 text-slate-500 hover:text-slate-400"
            }`}
          >
            2 meses atrás
          </button>
        </div>

        {/* Lista de pagamentos */}
        <div className="space-y-0 divide-y divide-surface-border/40">
          {fluxoFiltrado.length === 0 ? (
            <p className="text-center py-6 text-sm text-slate-600 italic">
              Nenhum pagamento neste período.
            </p>
          ) : (
            fluxoFiltrado.map((p) => {
              const categoriaNome = p.categoria_id
                ? categorias.find(cat => cat.id === p.categoria_id)?.nome ?? null
                : null;
              return (
                <PagamentoAccordion
                  key={p.id}
                  pagamento={p}
                  categoriaNome={categoriaNome}
                  contas={contas}
                  categorias={categorias}
                />
              );
            })
          )}
        </div>
      </Card>
    </>
  );
}
