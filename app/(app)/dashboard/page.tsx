import { CategoryPie, DreChart, EvolutionChart } from "@/components/Charts";
import { Card, MetricCard, PageHeader, Button, Input, FormGroup } from "@/components/ui";
import { currency } from "@/lib/format";
import { totalBalance } from "@/lib/finance";
import { getDashboardData, monthlyDre } from "@/lib/queries";
import { TrendingUp, TrendingDown, Wallet, Filter, CalendarRange } from "lucide-react";

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
  const { allMovs, monthMovs, filtro } = await getDashboardData({ inicio: sp.inicio, fim: sp.fim });

  const receitas = monthMovs.filter((m) => m.tipo === "receita").reduce((s, m) => s + Number(m.valor), 0);
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

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Dashboard"
        description="Visão geral do seu controle financeiro pessoal"
      />

      {/* Filtro de Data */}
      <Card className="border-slate-800/60">
        <div className="flex items-center gap-2 mb-4 text-slate-300 font-bold uppercase text-xs tracking-widest">
          <CalendarRange className="h-4 w-4" />
          <span>Período</span>
        </div>

        {/* Atalhos rápidos */}
        <div className="flex flex-wrap gap-2 mb-4">
          {MESES_RAPIDOS.map(({ label, offset }) => {
            const r = monthRange(offset);
            const isActive = sp.inicio === r.inicio && sp.fim === r.fim;
            return (
              <a
                key={offset}
                href={`/dashboard?inicio=${r.inicio}&fim=${r.fim}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${
                  isActive
                    ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300"
                    : "bg-slate-800/40 border-slate-700/40 text-slate-400 hover:text-slate-200 hover:bg-slate-700/40"
                }`}
              >
                {label}
              </a>
            );
          })}
        </div>

        {/* Período customizável */}
        <form className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[140px]">
            <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2 block">De</label>
            <Input type="date" name="inicio" defaultValue={sp.inicio ?? filtro.start} className="h-10 text-sm w-full block" />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2 block">Até</label>
            <Input type="date" name="fim" defaultValue={sp.fim ?? filtro.end} className="h-10 text-sm w-full block" />
          </div>
          <Button type="submit" variant="secondary" className="h-10 px-5 text-sm mb-[1px] inline-flex items-center justify-center">
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
          {(sp.inicio || sp.fim) && (
            <a href="/dashboard" className="h-10 px-4 flex items-center text-xs text-slate-500 hover:text-slate-300 transition-colors mb-[1px]">
              Limpar
            </a>
          )}
        </form>
      </Card>

      {/* Metrics Grid */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 auto-rows-max">
        <MetricCard 
          title="Saldo em Contas" 
          value={currency(saldo)} 
          tone="default"
          icon={<Wallet className="h-12 w-12" />}
          trend={saldo > 0 ? "up" : "down"}
        />
        <MetricCard 
          title={`Receitas — ${periodoLabel}`}
          value={currency(receitas)} 
          tone="good"
          icon={<TrendingUp className="h-12 w-12" />}
          trend="up"
        />
        <MetricCard 
          title={`Despesas — ${periodoLabel}`}
          value={currency(despesas)} 
          tone="bad"
          icon={<TrendingDown className="h-12 w-12" />}
          trend="up"
        />
      </section>

      {/* Charts Section */}
      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="flex flex-col h-full">
          <div className="mb-6 pb-4 border-b border-slate-800/40">
            <h2 className="text-lg font-bold text-white">Despesas por Categoria</h2>
            <p className="text-xs text-slate-500 mt-1">Distribuição do período selecionado</p>
          </div>
          <div className="flex-1 min-h-[300px] flex items-center justify-center">
            <CategoryPie data={[...cat.entries()].map(([name, value]) => ({ name, value }))} />
          </div>
        </Card>

        <Card className="flex flex-col h-full">
          <div className="mb-6 pb-4 border-b border-slate-800/40">
            <h2 className="text-lg font-bold text-white">Evolução Mensal</h2>
            <p className="text-xs text-slate-500 mt-1">Tendência dos últimos meses</p>
          </div>
          <div className="flex-1 min-h-[300px] flex items-center justify-center">
            <EvolutionChart data={dre} />
          </div>
        </Card>
      </section>

      <Card className="flex flex-col">
        <div className="mb-6 pb-4 border-b border-slate-800/40">
          <h2 className="text-lg font-bold text-white">Demonstrativo Mensal (DRE)</h2>
          <p className="text-xs text-slate-500 mt-1">Receitas, despesas e resultado</p>
        </div>
        <div className="min-h-[350px] flex items-center justify-center">
          <DreChart data={dre} />
        </div>
      </Card>

      {/* Quick Stats Footer */}
      <section className="grid gap-4 sm:grid-cols-3 text-center">
        <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/40">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Transações</p>
          <p className="text-2xl font-bold text-white mt-2">{monthMovs.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/40">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Categorias</p>
          <p className="text-2xl font-bold text-white mt-2">{cat.size}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/40">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Taxa Poupança</p>
          <p className="text-2xl font-bold text-emerald-400 mt-2">
            {receitas > 0 ? Math.round(((receitas - despesas) / receitas) * 100) : 0}%
          </p>
        </div>
      </section>
    </div>
  );
}
