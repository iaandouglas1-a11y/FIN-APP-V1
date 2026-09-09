import { getInvestimentos, getContasWithMovs, getInvestimentoSaldos } from "@/lib/queries";
import { Card, StatPill, Input, Button } from "@/components/ui";
import { currency } from "@/lib/format";
import { TrendingUp, LineChart as LineChartIcon, PieChart as PieChartIcon, Filter } from "lucide-react";
import InvestimentoAccordion from "./InvestimentoAccordion";
import InvestimentoQuickForms from "./InvestimentoQuickForms";
import { InvestimentoEvolutionChart, CategoryPie } from "@/components/Charts";

function formatMesLabel(mes: string) {
  const [ano, m] = mes.split("-");
  const nomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${nomes[Number(m) - 1]}/${ano.slice(2)}`;
}

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
  };
}

export default async function InvestimentosPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const [{ investimentos, movimentos }, { contas }, { saldos }] = await Promise.all([
    getInvestimentos(),
    getContasWithMovs(),
    getInvestimentoSaldos(),
  ]);

  const contasList = contas.map(c => ({ id: c.id, nome: c.nome }));
  const investimentosList = investimentos.map(i => ({ id: i.id, nome: i.nome }));

  // Evolução do patrimônio: soma dos saldos registrados por mês
  const saldosPorMes = new Map<string, number>();
  for (const s of saldos) {
    const mesKey = s.mes.slice(0, 7); // yyyy-MM
    saldosPorMes.set(mesKey, (saldosPorMes.get(mesKey) || 0) + Number(s.saldo));
  }
  const evolutionData = Array.from(saldosPorMes.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, saldo]) => ({ mes: formatMesLabel(mes), saldo }));

  // Mês atual no formato yyyy-MM, para pré-preencher o formulário
  const mesAtual = new Date().toISOString().slice(0, 7);

  // Resumo geral (patrimônio e rentabilidade são sempre "de todo o período" —
  // são posições atuais, não faz sentido recortá-las por data)
  const totalAtual     = investimentos.reduce((s, i) => s + Number(i.valor_atual), 0);
  const totalAportadoGeral  = movimentos.filter(m => m.tipo === "aporte").reduce((s, m) => s + Number(m.valor), 0);
  const totalResgatadoGeral = movimentos.filter(m => m.tipo === "resgate").reduce((s, m) => s + Number(m.valor), 0);
  const totalInvestidoGeral = totalAportadoGeral - totalResgatadoGeral;
  const rentTotal      = totalInvestidoGeral > 0 ? ((totalAtual - totalInvestidoGeral) / totalInvestidoGeral) * 100 : 0;
  const positivo       = rentTotal >= 0;

  // Movimentos filtrados pelo período selecionado — alimentam os 3 stat pills
  // abaixo (sem filtro = todo o histórico, igual ao comportamento de Movimentações)
  const movimentosPeriodo = movimentos.filter((m) => {
    if (sp.inicio && m.data < sp.inicio) return false;
    if (sp.fim && m.data > sp.fim) return false;
    return true;
  });
  const totalAportado  = movimentosPeriodo.filter(m => m.tipo === "aporte").reduce((s, m) => s + Number(m.valor), 0);
  const totalResgatado = movimentosPeriodo.filter(m => m.tipo === "resgate").reduce((s, m) => s + Number(m.valor), 0);
  const totalInvestido = totalAportado - totalResgatado;

  // Distribuição da carteira: Renda Fixa x Renda Variável (por valor atual)
  const distribuicao = [
    { name: "Renda Fixa", value: investimentos.filter(i => i.tipo === "renda_fixa").reduce((s, i) => s + Number(i.valor_atual), 0) },
    { name: "Renda Variável", value: investimentos.filter(i => i.tipo === "renda_variavel").reduce((s, i) => s + Number(i.valor_atual), 0) },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Hero: patrimônio + rentabilidade lado a lado (sempre geral, não filtrado) */}
      <div className="glass-card p-6 flex items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-ink-secondary">Patrimônio investido</div>
          <div className="num text-[32px] leading-tight font-extrabold tracking-tight text-ink-primary mt-1.5">{currency(totalAtual)}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[10px] font-bold uppercase tracking-wide text-ink-secondary">Rentabilidade</div>
          <div className={`num text-base font-extrabold mt-1 ${positivo ? "text-[#6fc23b]" : "text-[#f87171]"}`}>
            {positivo ? "+" : ""}{rentTotal.toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <StatPill label="Total investido" value={currency(totalInvestido)} />
        <StatPill label="Total aportado" value={currency(totalAportado)} tone="green" />
      </div>
      <StatPill label="Total resgatado" value={currency(totalResgatado)} tone="amber" />

      {/* Filtro de período — mesmo estilo discreto de Movimentações: chips + popover */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1.5 overflow-x-auto flex-1 no-scrollbar">
          {MESES_RAPIDOS.map(({ label, offset }) => {
            const r = monthRange(offset);
            const isActive = sp.inicio === r.inicio && sp.fim === r.fim;
            return (
              <a
                key={offset}
                href={`/investimentos?inicio=${r.inicio}&fim=${r.fim}`}
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

        {(sp.inicio || sp.fim) && (
          <a
            href="/investimentos"
            title="Limpar filtro"
            className="shrink-0 w-8 h-8 rounded-full bg-surface border border-surface-border/50 flex items-center justify-center text-ink-tertiary hover:text-[#f87171] transition-colors"
          >
            ×
          </a>
        )}

        <details className="relative shrink-0">
          <summary className="list-none cursor-pointer w-8 h-8 rounded-full bg-surface border border-surface-border/50 flex items-center justify-center text-ink-tertiary hover:text-ink-primary transition-colors">
            <Filter className="h-3.5 w-3.5" />
          </summary>
          <form className="absolute right-0 top-10 z-20 w-64 p-3.5 rounded-xl bg-surface border border-surface-border shadow-navy space-y-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wide text-ink-tertiary">Período personalizado</p>
            <div className="flex items-center gap-1.5">
              <Input type="date" name="inicio" defaultValue={sp.inicio} className="h-9 flex-1 min-w-0 text-xs" />
              <span className="text-slate-600 text-[10px] shrink-0">até</span>
              <Input type="date" name="fim" defaultValue={sp.fim} className="h-9 flex-1 min-w-0 text-xs" />
            </div>
            <Button type="submit" variant="secondary" className="w-full h-8 text-xs">Aplicar</Button>
          </form>
        </details>
      </div>

      {/* Investimento / Aporte-Resgate / Saldo mensal — botões lado a lado */}
      <InvestimentoQuickForms contas={contasList} investimentos={investimentosList} mesAtual={mesAtual} />

      {/* Distribuição da carteira — Renda Fixa x Renda Variável */}
      {distribuicao.length > 0 && (
        <Card className="border-surface-border/60 p-4">
          <div className="flex items-center gap-2 mb-4 text-slate-400 font-bold uppercase text-xs tracking-widest">
            <PieChartIcon className="h-4 w-4" />
            <span>Distribuição da Carteira</span>
          </div>
          <CategoryPie data={distribuicao} />
        </Card>
      )}

      {/* Gráfico de evolução do patrimônio — exige ao menos 2 meses registrados */}
      <Card className="border-surface-border/60 p-4">
        <div className="flex items-center gap-2 mb-4 text-slate-400 font-bold uppercase text-xs tracking-widest">
          <LineChartIcon className="h-4 w-4" />
          <span>Evolução do Patrimônio</span>
        </div>
        {evolutionData.length < 2 ? (
          <div className="text-center py-8 px-2 border border-dashed border-surface-border/70 rounded-xl">
            <p className="text-slate-500 text-[13px] leading-relaxed">
              Registre o saldo de pelo menos 2 meses<br />para visualizar o gráfico de evolução.
            </p>
          </div>
        ) : (
          <InvestimentoEvolutionChart data={evolutionData} />
        )}
      </Card>

      {/* Carteira */}
      <div>
        <h3 className="text-[15px] font-bold text-ink-primary mb-2.5 px-1">Carteira</h3>
        <div className="space-y-3">
          {investimentos.length === 0 ? (
            <Card className="text-center py-16 border-surface-border/60">
              <TrendingUp className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-base font-semibold text-slate-300 mb-2">Nenhum investimento cadastrado</h3>
              <p className="text-slate-500 text-sm">Adicione seu primeiro investimento acima</p>
            </Card>
          ) : (
            investimentos.map(inv => {
              const movInv = movimentos.filter(m => m.investimento_id === inv.id);
              return (
                <InvestimentoAccordion
                  key={inv.id}
                  id={inv.id}
                  nome={inv.nome}
                  tipo={inv.tipo}
                  subcategoria={inv.subcategoria}
                  ticker={inv.ticker}
                  contaNome={inv.contas?.nome ?? null}
                  valorAtual={Number(inv.valor_atual)}
                  movimentos={movInv}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
