
import { getInvestimentos, getContasWithMovs, getInvestimentoSaldos } from "@/lib/queries";
import { Card, StatPill } from "@/components/ui";
import { currency } from "@/lib/format";
import { TrendingUp, LineChart as LineChartIcon } from "lucide-react";
import InvestimentoAccordion from "./InvestimentoAccordion";
import InvestimentoQuickForms from "./InvestimentoQuickForms";
import { InvestimentoEvolutionChart } from "@/components/Charts";

function formatMesLabel(mes: string) {
  const [ano, m] = mes.split("-");
  const nomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${nomes[Number(m) - 1]}/${ano.slice(2)}`;
}

export default async function InvestimentosPage() {
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

  // Resumo geral
  const totalAtual     = investimentos.reduce((s, i) => s + Number(i.valor_atual), 0);
  const totalAportado  = movimentos.filter(m => m.tipo === "aporte").reduce((s, m) => s + Number(m.valor), 0);
  const totalResgatado = movimentos.filter(m => m.tipo === "resgate").reduce((s, m) => s + Number(m.valor), 0);
  const totalInvestido = totalAportado - totalResgatado;
  const rentTotal      = totalInvestido > 0 ? ((totalAtual - totalInvestido) / totalInvestido) * 100 : 0;
  const positivo       = rentTotal >= 0;

  return (
    <div className="space-y-6">
      {/* Hero: patrimônio + rentabilidade lado a lado */}
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

      {/* Investimento / Aporte-Resgate / Saldo mensal — botões lado a lado, no topo */}
      <InvestimentoQuickForms contas={contasList} investimentos={investimentosList} mesAtual={mesAtual} />

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
