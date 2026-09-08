
import { getDividas, getCategorias, getContasWithMovs } from "@/lib/queries";
import { Card, StatPill } from "@/components/ui";
import type { IconTone } from "@/components/ui";
import { currency } from "@/lib/format";
import { TrendingDown, AlertCircle } from "lucide-react";
import DividaAccordion from "./DividaAccordion";
import PagamentoAccordion from "./PagamentoAccordion";
import DividaQuickForms from "./DividaQuickForms";
import { clsx } from "clsx";

export default async function DividasPage({ searchParams }: { searchParams: Promise<{ aba?: string }> }) {
  const sp = await searchParams;
  const abaLiquidadas = sp.aba === "liquidadas";

  const [{ dividas, pagamentos }, { contas }, categorias] = await Promise.all([
    getDividas(),
    getContasWithMovs(),
    getCategorias(),
  ]);

  const contasList = contas.map((c) => ({ id: c.id, nome: c.nome }));

  // Resumo
  const totalDevido  = dividas.reduce((s, d) => s + Number(d.valor), 0); // total de TODAS as dívidas
  const totalPago    = pagamentos.filter(p => p.tipo === "realizado").reduce((s, p) => s + Number(p.valor), 0);
  const saldoAtual   = totalDevido - totalPago; // diferença entre total e pago

  // Fluxo de pagamentos, mais recentes primeiro (blindado contra data nula/vazia)
  const fluxo = [...pagamentos].sort((a, b) => (b.data || "").localeCompare(a.data || ""));

  // Separação em abas: dívidas em aberto vs. liquidadas
  const abertas = dividas.filter(d => d.situacao !== "liquidado");
  const liquidadas = dividas.filter(d => d.situacao === "liquidado");
  const listaAtual = abaLiquidadas ? liquidadas : abertas;

  // Progresso de pagamento por dívida — soma pagamentos realizados vinculados a ela
  function progressoDivida(dividaId: string, valorTotal: number) {
    const pagos = pagamentos
      .filter((p) => (p as any).divida_id === dividaId && p.tipo === "realizado")
      .reduce((s, p) => s + Number(p.valor), 0);
    const pct = valorTotal > 0 ? Math.min(100, (pagos / valorTotal) * 100) : 0;
    return { pagos, pct };
  }

  return (
    <div className="space-y-6">
      <h1 className="text-[22px] font-bold text-ink-primary tracking-tight px-1">Dívidas</h1>

      {/* Resumo */}
      <div className="flex gap-3">
        <StatPill label="Total devido" value={currency(totalDevido)} tone="red" />
        <StatPill label="Total pago" value={currency(totalPago)} tone="green" />
      </div>
      <StatPill label="Saldo em aberto" value={currency(saldoAtual)} tone={saldoAtual > 0 ? "amber" : "green"} />

      {/* Nova dívida / Novo pagamento — botões lado a lado, no topo (mesmo padrão de Movimentações) */}
      <DividaQuickForms categorias={categorias} contas={contasList} dividasAbertas={abertas} />

      {/* Abas: Em aberto / Liquidadas */}
      <div className="flex bg-surface border border-surface-border/60 rounded-xl p-1 gap-0.5">
        <a
          href="/dividas"
          className={clsx(
            "flex-1 text-center py-2 text-[12.5px] font-semibold rounded-lg transition-all duration-150",
            !abaLiquidadas ? "bg-[#5DA832] text-[#06111F]" : "text-ink-secondary hover:text-ink-primary"
          )}
        >
          Em aberto ({abertas.length})
        </a>
        <a
          href="/dividas?aba=liquidadas"
          className={clsx(
            "flex-1 text-center py-2 text-[12.5px] font-semibold rounded-lg transition-all duration-150",
            abaLiquidadas ? "bg-[#5DA832] text-[#06111F]" : "text-ink-secondary hover:text-ink-primary"
          )}
        >
          Liquidadas ({liquidadas.length})
        </a>
      </div>

      {/* Lista de dívidas — accordion: colapsada mostra só o essencial */}
      <div className="space-y-2.5">
        {listaAtual.length === 0 ? (
          <Card className="text-center py-10">
            <AlertCircle className="h-8 w-8 text-slate-600 mx-auto mb-2.5" />
            <p className="text-sm text-slate-400">
              {abaLiquidadas ? "Nenhuma dívida liquidada ainda." : "Nenhuma dívida em aberto. 🎉"}
            </p>
          </Card>
        ) : (
          listaAtual.map((d) => {
            const categoriaNome = d.categoria_id ? categorias.find(c => c.id === d.categoria_id)?.nome : undefined;
            const liquidada = d.situacao === "liquidado";
            const { pct, pagos } = progressoDivida(d.id, Number(d.valor));
            const tone: IconTone = liquidada ? "green" : pct > 0 ? "amber" : "red";

            return (
              <DividaAccordion
                key={d.id}
                divida={d as any}
                categorias={categorias}
                categoriaNome={categoriaNome}
                tone={tone}
                pct={pct}
                pagos={pagos}
              />
            );
          })
        )}
      </div>

      {/* Fluxo de Pagamentos */}
      <Card className="p-0 overflow-hidden border-surface-border/60">
        <div className="px-4 py-3 border-b border-surface-border/40 flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-[#5DA832]" />
          <h3 className="font-semibold text-white text-sm">Fluxo de Pagamentos</h3>
        </div>

        {/* Lista de pagamentos — accordion: colapsada mostra só descrição/valor/status */}
        <div className="divide-y divide-surface-border/40">
          {fluxo.length === 0 ? (
            <p className="px-4 py-8 text-center text-slate-600 italic text-xs">Nenhum pagamento lançado.</p>
          ) : fluxo.map((p: any) => {
            const categoriaNome = p.categoria_id
              ? categorias.find(cat => cat.id === p.categoria_id)?.nome ?? null
              : null;
            return (
              <PagamentoAccordion
                key={p.id}
                pagamento={p}
                categoriaNome={categoriaNome}
                contas={contasList}
                categorias={categorias}
              />
            );
          })}
        </div>
      </Card>
    </div>
  );
}
