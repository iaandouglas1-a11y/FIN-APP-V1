import { CategoryPie, EvolutionChart, WaterfallChart } from "@/components/Charts";
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
      <Card className="border-slate-800/60 p-4">
        {/* Chips — linha 1 */}
        <div className="flex gap-2 mb-3">
          {MESES_RAPIDOS.map(({ label, offset }) => {
            const r = monthRange(offset);
            const isActive = sp.inicio === r.inicio && sp.fim === r.fim;
            return (
              <a
                key={offset}
                href={`/dashboard?inicio=${r.inicio}&fim=${r.fim}`}
                className={`flex-1 text-center px-2 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${
                  isActive
                    ? "bg-[#5DA832]/20 border-[#5DA832]/40 text-[#6fc23b]"
                    : "bg-[#142d52]/40 border-[#1e3a66]/40 text-slate-400 hover:text-slate-200 hover:bg-[#142d52]/60"
                }`}
              >
                {label}
              </a>
            );
          })}
        </div>

        {/* Inputs + botão — linha 2 */}
        <form className="flex items-center gap-2">
          <Input type="date" name="inicio" defaultValue={sp.inicio ?? filtro.start} className="h-9 flex-1 min-w-0 block text-xs" />
          <span className="text-slate-600 text-xs shrink-0">até</span>
          <Input type="date" name="fim" defaultValue={sp.fim ?? filtro.end} className="h-9 flex-1 min-w-0 block text-xs" />
          <Button type="submit" variant="secondary" className="h-9 px-3 text-xs shrink-0 inline-flex items-center justify-center gap-1.5">
            <Filter className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Filtrar</span>
          </Button>
          {(sp.inicio || sp.fim) && (
            <a href="/dashboard" className="h-9 px-2 flex items-center text-xs text-slate-500 hover:text-slate-300 transition-colors shrink-0">
              ✕
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
          <h2 className="text-lg font-bold text-white">Fluxo de Caixa</h2>
          <p className="text-xs text-slate-500 mt-1">Saldo inicial → entradas → saídas → saldo final</p>
        </div>
        <div className="min-h-[350px] flex items-center justify-center">
          <WaterfallChart
            saldoInicial={saldo}
            entradas={receitas}
            saidas={despesas}
          />
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
