import { CategoryPie, EvolutionChart, WaterfallChart } from "@/components/Charts";
import { AmountText, Card, Input, Button, Surface, MetricCard, ProgressBar } from "@/components/ui";
import { currency } from "@/lib/format";
import { totalBalance, invoiceTotal } from "@/lib/finance";
import { getDashboardData, monthlyDre, getCartoesEFaturas } from "@/lib/queries";
import { Activity, CalendarDays, CreditCard, Filter, Receipt, TrendingUp, WalletCards } from "lucide-react";
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
  const end = new Date(Date.UTC(d.getFullYear(), d.getMonth() + 1, 0));
  return {
    inicio: start.toISOString().slice(0, 10),
    fim: end.toISOString().slice(0, 10),
    label: start.toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" }),
  };
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const [{ allMovs, monthMovs, filtro }, { faturas, movimentacoes: faturaMovs }] = await Promise.all([
    getDashboardData({ inicio: sp.inicio, fim: sp.fim }),
    getCartoesEFaturas(),
  ]);

  const receitas = monthMovs.filter((m) => m.tipo === "receita").reduce((sum, m) => sum + Number(m.valor), 0);
  const despesas = monthMovs.filter((m) => m.tipo === "despesa").reduce((sum, m) => sum + Number(m.valor), 0);
  const saldo = totalBalance(allMovs);
  const totalFaturasAberto = (faturas as any[]).filter((f) => !f.pago).reduce((sum, f) => sum + invoiceTotal(f.id, faturaMovs), 0);
  const periodoLabel = new Date(filtro.start + "T00:00:00Z").toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });
  const poupanca = receitas > 0 ? Math.round(((receitas - despesas) / receitas) * 100) : 0;

  const cat = new Map<string, number>();
  for (const m of monthMovs as any[]) {
    if (m.tipo === "despesa") {
      const name = m.categorias?.nome ?? "Sem categoria";
      cat.set(name, (cat.get(name) ?? 0) + Number(m.valor));
    }
  }

  const dre = monthlyDre(allMovs);
  const recentes = [...(monthMovs as any[])].sort((a, b) => (a.data < b.data ? 1 : -1)).slice(0, 5);
  const receitasDespesas = receitas - despesas;

  return (
    <div className="space-y-7">
      <FiltroDataPersist pagina="dashboard" basePath="/dashboard" inicio={sp.inicio} fim={sp.fim} />

      <section className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#5DA832]">Sua visão financeira</p>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] text-ink-primary sm:text-4xl">Seu dinheiro, em perspectiva.</h1>
          <p className="mt-2 max-w-xl text-sm text-ink-secondary">Uma leitura clara para você decidir o próximo movimento com mais confiança.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-xl border border-surface-border/70 bg-surface px-3 py-2 text-xs text-ink-secondary">
          <CalendarDays className="h-4 w-4 text-[#8FCB5E]" />
          <span>Período</span>
          <strong className="capitalize text-ink-primary">{periodoLabel}</strong>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Patrimônio consolidado" value={currency(saldo)} tone="default" icon={<WalletCards className="h-7 w-7" />} change={`${poupanca}% no período`} trend={poupanca >= 0 ? "up" : "down"} />
        <MetricCard title="Receitas no período" value={currency(receitas)} tone="good" icon={<TrendingUp className="h-7 w-7" />} change={`${monthMovs.filter((m) => m.tipo === "receita").length} recebimentos`} trend="up" />
        <MetricCard title="Despesas no período" value={currency(despesas)} tone="bad" icon={<Activity className="h-7 w-7" />} change={`${monthMovs.filter((m) => m.tipo === "despesa").length} lançamentos`} trend="down" />
        <MetricCard title="Faturas em aberto" value={currency(totalFaturasAberto)} tone="amber" icon={<CreditCard className="h-7 w-7" />} change={`${faturas.filter((f: any) => !f.pago).length} pendentes`} trend="down" />
      </section>

      <div className="flex items-center gap-2">
        <div className="no-scrollbar flex flex-1 gap-1.5 overflow-x-auto">
          {MESES_RAPIDOS.map(({ label, offset }) => {
            const range = monthRange(offset);
            const isActive = sp.inicio === range.inicio && sp.fim === range.fim;
            return <a key={offset} href={`/dashboard?inicio=${range.inicio}&fim=${range.fim}`} className={`shrink-0 rounded-full border px-3 py-1.5 text-[11.5px] font-semibold transition-colors ${isActive ? "border-[#5DA832]/35 bg-[#5DA832]/15 text-[#8FCB5E]" : "border-surface-border/50 text-ink-tertiary hover:bg-surface-2/40 hover:text-ink-secondary"}`}>{label}</a>;
          })}
        </div>
        <details className="relative shrink-0">
          <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-xl border border-surface-border/70 bg-surface text-ink-tertiary transition-colors hover:text-ink-primary"><Filter className="h-4 w-4" /></summary>
          <form className="absolute right-0 top-11 z-20 w-72 space-y-3 rounded-2xl border border-surface-border bg-surface p-4 shadow-navy">
            <p className="text-xs font-semibold text-ink-secondary">Período personalizado</p>
            <div className="flex items-center gap-2"><Input type="date" name="inicio" defaultValue={sp.inicio ?? filtro.start} /><span className="text-[11px] text-ink-tertiary">até</span><Input type="date" name="fim" defaultValue={sp.fim ?? filtro.end} /></div>
            <Button type="submit" variant="secondary" className="w-full text-xs">Aplicar período</Button>
          </form>
        </details>
      </div>

      <section className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
        <Card className="min-h-[360px] p-5 md:p-6">
          <div className="mb-4 flex items-start justify-between border-b border-surface-border/50 pb-4"><div><h2 className="text-base font-semibold text-ink-primary">Evolução financeira</h2><p className="mt-1 text-xs text-ink-tertiary">Receitas e despesas ao longo dos últimos meses</p></div><span className="text-xs font-semibold text-[#8FCB5E]">{receitasDespesas >= 0 ? "Saldo crescendo" : "Atenção ao saldo"}</span></div>
          <div className="flex min-h-[280px] items-center justify-center"><EvolutionChart data={dre} /></div>
        </Card>
        <Card className="min-h-[360px] p-5 md:p-6">
          <div className="mb-4 border-b border-surface-border/50 pb-4"><h2 className="text-base font-semibold text-ink-primary">Saúde financeira</h2><p className="mt-1 text-xs text-ink-tertiary">Uma leitura do seu momento atual</p></div>
          <div className="flex items-center gap-5 py-5"><div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-[10px] border-surface-2" style={{ borderTopColor: "#5DA832", borderRightColor: poupanca >= 0 ? "#5DA832" : "#F87171" }}><strong className="text-2xl text-ink-primary">{Math.max(0, poupanca)}</strong></div><div><strong className="text-sm text-ink-primary">{poupanca >= 50 ? "Momento saudável" : "Em construção"}</strong><p className="mt-1 text-xs leading-relaxed text-ink-tertiary">Sua taxa de poupança indica quanto da receita permaneceu disponível no período.</p></div></div>
          <div className="space-y-4 border-t border-surface-border/50 pt-4"><div><div className="flex justify-between text-xs text-ink-secondary"><span>Receitas comprometidas</span><strong className="text-ink-primary">{receitas ? Math.round((despesas / receitas) * 100) : 0}%</strong></div><ProgressBar pct={receitas ? (despesas / receitas) * 100 : 0} color="#F5A524" /></div><div><div className="flex justify-between text-xs text-ink-secondary"><span>Saldo preservado</span><strong className="text-ink-primary">{Math.max(0, poupanca)}%</strong></div><ProgressBar pct={Math.max(0, poupanca)} color="#5DA832" /></div></div>
        </Card>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.15fr_1fr_1fr]">
        <Card className="p-0"><div className="flex items-center justify-between border-b border-surface-border/50 px-5 py-4"><div><h2 className="text-base font-semibold text-ink-primary">Atividade recente</h2><p className="mt-1 text-xs text-ink-tertiary">Últimos lançamentos do período</p></div><a href="/movimentacoes" className="text-xs font-semibold text-[#5DA832]">Ver tudo</a></div><Surface padded={false} className="divide-y divide-surface-border/50 rounded-none border-0">{recentes.length === 0 ? <p className="px-5 py-8 text-center text-sm text-ink-tertiary">Nenhuma movimentação no período.</p> : recentes.map((m: any) => <div key={m.id} className="flex items-center gap-3 px-5 py-3.5"><div className={`h-2.5 w-2.5 shrink-0 rounded-full ${m.tipo === "receita" ? "bg-[#5DA832]" : "bg-[#F87171]"}`} /><div className="min-w-0 flex-1"><strong className="block truncate text-[13px] text-ink-primary">{m.categorias?.nome ?? "Sem categoria"}</strong><span className="mt-0.5 block truncate text-[11px] text-ink-tertiary">{m.descricao || m.contas?.nome || "Lançamento"}</span></div><AmountText value={m.tipo === "receita" ? Number(m.valor) : -Number(m.valor)} signed tone={m.tipo === "receita" ? "green" : "red"} size="sm" /></div>)}</Surface></Card>
        <Card className="p-5"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-base font-semibold text-ink-primary">Resumo do período</h2><p className="mt-1 text-xs text-ink-tertiary">{periodoLabel}</p></div><Receipt className="h-5 w-5 text-ink-tertiary" /></div><div className="space-y-4"><div><span className="text-xs text-ink-tertiary">Entradas</span><AmountText value={receitas} tone="green" size="lg" className="mt-1 block" /></div><div><span className="text-xs text-ink-tertiary">Saídas</span><AmountText value={despesas} tone="red" size="lg" className="mt-1 block" /></div><div className="border-t border-surface-border/50 pt-4"><span className="text-xs text-ink-tertiary">Saldo do período</span><AmountText value={receitasDespesas} size="lg" className="mt-1 block" /></div></div></Card>
        <Card className="p-5"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-base font-semibold text-ink-primary">Próximos compromissos</h2><p className="mt-1 text-xs text-ink-tertiary">Acompanhe o que merece atenção</p></div><CreditCard className="h-5 w-5 text-ink-tertiary" /></div><div className="space-y-4"><div className="flex items-center justify-between border-b border-surface-border/50 pb-4"><div><strong className="block text-sm text-ink-primary">Faturas em aberto</strong><span className="text-xs text-ink-tertiary">Vencimentos sob controle</span></div><strong className="text-sm text-[#F5A524]">{currency(totalFaturasAberto)}</strong></div><div className="flex items-center justify-between"><div><strong className="block text-sm text-ink-primary">Transações</strong><span className="text-xs text-ink-tertiary">Movimentos registrados</span></div><strong className="text-sm text-ink-primary">{monthMovs.length}</strong></div></div></Card>
      </section>

      <Card className="p-5 md:p-6"><div className="mb-4 border-b border-surface-border/50 pb-4"><h2 className="text-base font-semibold text-ink-primary">Fluxo de caixa</h2><p className="mt-1 text-xs text-ink-tertiary">Saldo inicial, entradas, saídas e saldo final</p></div><div className="min-h-[320px] flex items-center justify-center"><WaterfallChart saldoInicial={saldo} entradas={receitas} saidas={despesas} /></div></Card>

      <Card className="p-5 md:p-6"><div className="mb-4 border-b border-surface-border/50 pb-4"><h2 className="text-base font-semibold text-ink-primary">Despesas por categoria</h2><p className="mt-1 text-xs text-ink-tertiary">Distribuição do período selecionado</p></div><div className="flex min-h-[300px] items-center justify-center"><CategoryPie data={[...cat.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10)} /></div></Card>
    </div>
  );
}
