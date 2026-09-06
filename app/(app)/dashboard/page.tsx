import { CategoryPie, EvolutionChart, WaterfallChart } from "@/components/Charts";
import { Card, Input, Button, AmountText, StatPill, Surface } from "@/components/ui";
import { currency } from "@/lib/format";
import { totalBalance, invoiceTotal } from "@/lib/finance";
import { getDashboardData, monthlyDre, getCartoesEFaturas } from "@/lib/queries";
import { TrendingUp, Filter } from "lucide-react";
import FiltroDataPersist from "@/components/FiltroDataPersist";

const MESES_RAPIDOS = [
  { label: "Este mês", offset: 0 },
  { label: "Mês anterior", offset: -1 },
  { label: "2 meses atrás", offset: -2 },
];

function monthRange(offset: number) {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  const start = new Date(Date.UTC(d.getFullYear(), d.getMonth(), 1));
  const end   = new Date(Date.UTC(d.getFullYear(), d.getMonth() + 1, 0));
  return {
    inicio: start.toISOString().slice(0, 10),
    fim:    end.toISOString().slice(0, 10),
    label: start.toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" }),
  };
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const [{ allMovs, monthMovs, filtro }, { faturas, movimentacoes: faturaMovs }] = await Promise.all([
    getDashboardData({ inicio: sp.inicio, fim: sp.fim }),
    getCartoesEFaturas(),
  ]);

  const receitas = monthMovs.filter((m) => m.tipo === "receita").reduce((s, m) => s + Number(m.valor), 0);
  const totalFaturasAberto = (faturas as any[])
    .filter(f => !f.pago)
    .reduce((sum, f) => sum + invoiceTotal(f.id, faturaMovs), 0);
  const despesas = monthMovs.filter((m) => m.tipo === "despesa").reduce((s, m) => s + Number(m.valor), 0);
  const saldo    = totalBalance(allMovs);

  const cat = new Map<string, number>();
  for (const m of monthMovs as any[]) {
    if (m.tipo === "despesa") {
      const name = m.categorias?.nome ?? "Sem categoria";
      cat.set(name, (cat.get(name) ?? 0) + Number(m.valor));
    }
  }

  const dre = monthlyDre(allMovs);
  const periodoLabel = new Date(filtro.start + "T00:00:00Z").toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });
  const poupanca = receitas > 0 ? Math.round(((receitas - despesas) / receitas) * 100) : 0;

  // Últimos lançamentos, mais recentes primeiro — pra seção "Últimas movimentações"
  const recentes = [...(monthMovs as any[])]
    .sort((a, b) => (a.data < b.data ? 1 : -1))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <FiltroDataPersist pagina="dashboard" basePath="/dashboard" inicio={sp.inicio} fim={sp.fim} />

      {/* ── Hero: saldo consolidado ───────────────────────────────── */}
      <div className="glass-card p-6">
        <div className="text-[11px] font-bold uppercase tracking-widest text-ink-secondary">Saldo consolidado</div>
        <AmountText value={saldo} size="hero" className="block mt-1.5" />
        <div className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full text-xs font-bold ${poupanca >= 0 ? "bg-[#5DA832]/[0.14] text-[#6fc23b]" : "bg-danger/[0.14] text-[#f87171]"}`}>
          <TrendingUp className="h-3.5 w-3.5" />
          Taxa de poupança de {poupanca}% em {periodoLabel}
        </div>
      </div>

      {/* ── Stat pills ────────────────────────────────────────────── */}
      <div className="flex gap-3">
        <StatPill label={`Receitas · ${periodoLabel.split(" ")[0]}`} value={currency(receitas)} tone="green" />
        <StatPill label={`Despesas · ${periodoLabel.split(" ")[0]}`} value={currency(despesas)} tone="red" />
      </div>
      <div className="flex gap-3">
        <StatPill label="Faturas em aberto" value={currency(totalFaturasAberto)} tone="amber" />
        <StatPill label="Transações no período" value={String(monthMovs.length)} />
      </div>

      {/* ── Filtro de período — discreto: chips + ícone de calendário p/ período customizado ── */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1.5 overflow-x-auto flex-1 no-scrollbar">
          {MESES_RAPIDOS.map(({ label, offset }) => {
            const r = monthRange(offset);
            const isActive = sp.inicio === r.inicio && sp.fim === r.fim;
            return (
              <a
                key={offset}
                href={`/dashboard?inicio=${r.inicio}&fim=${r.fim}`}
                className={`shrink-0 text-center px-3 py-1.5 rounded-full text-[11.5px] font-semibold transition-all duration-200 border whitespace-nowrap ${
                  isActive
                    ? "bg-[#5DA832]/15 border-[#5DA832]/35 text-[#6fc23b]"
                    : "bg-transparent border-surface-border/50 text-ink-tertiary hover:text-ink-secondary hover:bg-surface-2/40"
                }`}
              >
                {label}
              </a>
            );
          })}
        </div>

        <details className="relative shrink-0">
          <summary className="list-none cursor-pointer w-8 h-8 rounded-full bg-surface border border-surface-border/50 flex items-center justify-center text-ink-tertiary hover:text-ink-primary transition-colors">
            <Filter className="h-3.5 w-3.5" />
          </summary>
          <form className="absolute right-0 top-10 z-20 w-64 p-3.5 rounded-xl bg-surface border border-surface-border shadow-navy space-y-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wide text-ink-tertiary">Período personalizado</p>
            <div className="flex items-center gap-1.5">
              <Input type="date" name="inicio" defaultValue={sp.inicio ?? filtro.start} className="h-9 flex-1 min-w-0 text-xs" />
              <span className="text-slate-600 text-[10px] shrink-0">até</span>
              <Input type="date" name="fim" defaultValue={sp.fim ?? filtro.end} className="h-9 flex-1 min-w-0 text-xs" />
            </div>
            <Button type="submit" variant="secondary" className="w-full h-8 text-xs">Aplicar</Button>
          </form>
        </details>
      </div>

      {/* ── Últimas movimentações ─────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <h3 className="text-[15px] font-bold text-ink-primary">Últimas movimentações</h3>
          <a href="/movimentacoes" className="text-xs font-semibold text-[#5DA832]">Ver todas</a>
        </div>
        <Surface padded={false} className="divide-y divide-surface-border/50">
          {recentes.length === 0 && (
            <p className="text-sm text-ink-tertiary px-4 py-6 text-center">Nenhuma movimentação no período.</p>
          )}
          {recentes.map((m: any) => (
            <div key={m.id} className="list-row">
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-semibold text-ink-primary truncate">{m.categorias?.nome ?? "Sem categoria"}</div>
                <div className="text-[11.5px] text-ink-tertiary mt-0.5 truncate">{m.descricao || (m.contas?.nome ?? "")}</div>
              </div>
              <AmountText value={Number(m.valor)} signed tone={m.tipo === "receita" ? "green" : "red"} />
            </div>
          ))}
        </Surface>
      </div>

      {/* ── Análises ──────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="flex flex-col h-full">
          <div className="mb-5 pb-3 border-b border-surface-border/50">
            <h2 className="text-[15px] font-bold text-white">Despesas por categoria</h2>
            <p className="text-xs text-ink-tertiary mt-1">Distribuição do período selecionado</p>
          </div>
          <div className="flex-1 min-h-[280px] flex items-center justify-center">
            <CategoryPie data={
              [...cat.entries()]
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 10)
            } />
          </div>
        </Card>

        <Card className="flex flex-col h-full">
          <div className="mb-5 pb-3 border-b border-surface-border/50">
            <h2 className="text-[15px] font-bold text-white">Evolução mensal</h2>
            <p className="text-xs text-ink-tertiary mt-1">Tendência dos últimos meses</p>
          </div>
          <div className="flex-1 min-h-[280px] flex items-center justify-center">
            <EvolutionChart data={dre} />
          </div>
        </Card>
      </div>

      <Card className="flex flex-col">
        <div className="mb-5 pb-3 border-b border-surface-border/50">
          <h2 className="text-[15px] font-bold text-white">Fluxo de caixa</h2>
          <p className="text-xs text-ink-tertiary mt-1">Saldo inicial → entradas → saídas → saldo final</p>
        </div>
        <div className="min-h-[320px] flex items-center justify-center">
          <WaterfallChart saldoInicial={saldo} entradas={receitas} saidas={despesas} />
        </div>
      </Card>
    </div>
  );
}
