import { CategoryPie, DreChart, EvolutionChart } from "@/components/Charts";
import { Card, MetricCard, PageHeader } from "@/components/ui";
import { currency } from "@/lib/format";
import { totalBalance } from "@/lib/finance";
import { getDashboardData, monthlyDre } from "@/lib/queries";
import { TrendingUp, TrendingDown, Wallet, CreditCard } from "lucide-react";

export default async function DashboardPage() {
  const { allMovs, monthMovs } = await getDashboardData();
  const receitas = monthMovs.filter((m) => m.tipo === "receita").reduce((s, m) => s + Number(m.valor), 0);
  const despesas = monthMovs.filter((m) => m.tipo === "despesa").reduce((s, m) => s + Number(m.valor), 0);
  const saldo = totalBalance(allMovs);
  
  const cat = new Map<string, number>();
  for (const m of monthMovs as any[]) {
    if (m.tipo === "despesa") {
      const name = m.categorias?.nome ?? "Sem categoria";
      cat.set(name, (cat.get(name) ?? 0) + Number(m.valor));
    }
  }
  
  const dre = monthlyDre(allMovs);
  
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader 
        title="Dashboard"
        description="Visão geral do seu controle financeiro pessoal"
      />

      {/* Metrics Grid - Bento Style */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 auto-rows-max">
        <div className="lg:col-span-1">
          <MetricCard 
            title="Saldo em Contas" 
            value={currency(saldo)} 
            tone="default"
            icon={<Wallet className="h-12 w-12" />}
            trend={saldo > 0 ? "up" : "down"}
          />
        </div>
        <div className="lg:col-span-1">
          <MetricCard 
            title="Receitas (Mês)" 
            value={currency(receitas)} 
            tone="good"
            icon={<TrendingUp className="h-12 w-12" />}
            trend="up"
          />
        </div>
        <div className="lg:col-span-1">
          <MetricCard 
            title="Despesas (Mês)" 
            value={currency(despesas)} 
            tone="bad"
            icon={<TrendingDown className="h-12 w-12" />}
            trend="up"
          />
        </div>
      </section>

      {/* Charts Section */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Despesas por Categoria */}
        <Card className="flex flex-col h-full">
          <div className="mb-6 pb-4 border-b border-slate-800/40">
            <h2 className="text-lg font-bold text-white">Despesas por Categoria</h2>
            <p className="text-xs text-slate-500 mt-1">Distribuição do mês atual</p>
          </div>
          <div className="flex-1 min-h-[300px] flex items-center justify-center">
            <CategoryPie data={[...cat.entries()].map(([name, value]) => ({ name, value }))} />
          </div>
        </Card>

        {/* Evolução Mensal */}
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

      {/* DRE Chart - Full Width */}
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
