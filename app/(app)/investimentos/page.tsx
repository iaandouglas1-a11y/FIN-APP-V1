import { getInvestimentos, getContasWithMovs, getCategorias, getInvestimentoSaldos } from "@/lib/queries";
import { saveInvestimento, deleteInvestimento, saveMovimento, saveSaldoMensal } from "@/app/(app)/actions_investimentos";
import { Card, Button, Input, Select, FormGroup, StatPill } from "@/components/ui";
import { currency } from "@/lib/format";
import { TrendingUp, Plus, Trash2, BarChart3, LineChart as LineChartIcon, Repeat, Wallet } from "lucide-react";
import InvestimentoAccordion from "./InvestimentoAccordion";
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

      {/* Carteira — promovida pra cima, é o que mais importa ver primeiro */}
      <div>
        <h3 className="text-[15px] font-bold text-ink-primary mb-2.5 px-1">Carteira</h3>
        <div className="space-y-3">
          {investimentos.length === 0 ? (
            <Card className="text-center py-16 border-surface-border/60">
              <TrendingUp className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-base font-semibold text-slate-300 mb-2">Nenhum investimento cadastrado</h3>
              <p className="text-slate-500 text-sm">Adicione seu primeiro investimento abaixo</p>
            </Card>
          ) : (
            investimentos.map(inv => {
              const movInv = movimentos.filter(m => m.investimento_id === inv.id);
              return (
                <div key={inv.id} className="relative group/inv">
                  <InvestimentoAccordion
                    id={inv.id}
                    nome={inv.nome}
                    tipo={inv.tipo}
                    ticker={inv.ticker}
                    contaNome={inv.contas?.nome ?? null}
                    valorAtual={Number(inv.valor_atual)}
                    movimentos={movInv}
                  />
                  <form action={deleteInvestimento} className="absolute top-4 right-14 opacity-0 group-hover/inv:opacity-100 transition-opacity">
                    <input type="hidden" name="id" value={inv.id} />
                    <button type="submit" className="p-1.5 text-slate-600 hover:text-rose-400 rounded transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Formulários — colapsados em cards tracejados, mesmo padrão de Contas/Cartões */}
      <div className="space-y-2.5">
        <details className="group">
          <summary className="list-none cursor-pointer">
            <div className="flex items-center justify-between p-4 rounded-2xl border border-dashed border-surface-border text-ink-secondary group-open:hidden">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#5DA832]/[0.14] text-[#6fc23b] flex items-center justify-center">
                  <Plus className="h-4 w-4" />
                </div>
                <span className="text-[13.5px] font-semibold">Novo investimento</span>
              </div>
            </div>
          </summary>
          <Card className="mt-2">
            <div className="flex items-center gap-2 mb-4 text-[#5DA832] font-bold uppercase text-xs tracking-widest">
              <Plus className="h-4 w-4" />
              <span>Novo Investimento</span>
            </div>
            <form action={saveInvestimento} className="space-y-2">
              <FormGroup label="Nome">
                <Input name="nome" placeholder="Ex: CDB Nubank, PETR4..." required className="h-9 text-sm w-full" />
              </FormGroup>
              <div className="grid grid-cols-2 gap-2">
                <FormGroup label="Tipo">
                  <Select name="tipo" required className="h-9 text-sm w-full">
                    <option value="renda_fixa">Renda Fixa</option>
                    <option value="renda_variavel">Renda Variável</option>
                  </Select>
                </FormGroup>
                <FormGroup label="Ticker">
                  <Input name="ticker" placeholder="PETR4" className="h-9 text-sm font-mono w-full" />
                </FormGroup>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FormGroup label="Conta">
                  <Select name="conta_id" className="h-9 text-sm w-full">
                    <option value="">Nenhuma</option>
                    {contasList.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </Select>
                </FormGroup>
                <FormGroup label="Valor Atual">
                  <Input name="valor_atual" type="number" step="0.01" min="0" placeholder="0,00" className="h-9 text-sm w-full" />
                </FormGroup>
              </div>
              <Button type="submit" className="h-9 px-4 text-sm font-semibold inline-flex items-center justify-center w-full">
                <Plus className="h-4 w-4 mr-1.5" />
                Adicionar
              </Button>
            </form>
          </Card>
        </details>

        <details className="group">
          <summary className="list-none cursor-pointer">
            <div className="flex items-center justify-between p-4 rounded-2xl border border-dashed border-surface-border text-ink-secondary group-open:hidden">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-info/[0.14] text-[#60a5fa] flex items-center justify-center">
                  <Repeat className="h-4 w-4" />
                </div>
                <span className="text-[13.5px] font-semibold">Registrar aporte / resgate</span>
              </div>
            </div>
          </summary>
          <Card className="mt-2 border-surface-border/60">
            <div className="flex items-center gap-2 mb-4 text-slate-400 font-bold uppercase text-xs tracking-widest">
              <BarChart3 className="h-4 w-4" />
              <span>Registrar Aporte / Resgate</span>
            </div>
            <form action={saveMovimento} className="space-y-2">
              <FormGroup label="Investimento">
                <Select name="investimento_id" required className="h-9 text-sm w-full">
                  <option value="">Selecione...</option>
                  {investimentos.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
                </Select>
              </FormGroup>
              <div className="grid grid-cols-2 gap-2">
                <FormGroup label="Tipo">
                  <Select name="tipo" required className="h-9 text-sm w-full">
                    <option value="aporte">Aporte</option>
                    <option value="resgate">Resgate</option>
                  </Select>
                </FormGroup>
                <FormGroup label="Valor">
                  <Input name="valor" type="number" step="0.01" min="0.01" placeholder="0,00" required className="h-9 text-sm w-full" />
                </FormGroup>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FormGroup label="Data">
                  <Input name="data" type="date" required className="h-9 w-full text-sm" />
                </FormGroup>
                <FormGroup label="Conta">
                  <Select name="conta_id" className="h-9 text-sm w-full">
                    <option value="">Nenhuma</option>
                    {contasList.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </Select>
                </FormGroup>
              </div>
              <FormGroup label="Descrição">
                <Input name="descricao" placeholder="Opcional..." className="h-9 text-sm w-full" />
              </FormGroup>
              <Button type="submit" className="h-9 px-4 text-sm font-semibold inline-flex items-center justify-center w-full">
                <Plus className="h-4 w-4 mr-1.5" />
                Registrar
              </Button>
            </form>
          </Card>
        </details>

        <details className="group">
          <summary className="list-none cursor-pointer">
            <div className="flex items-center justify-between p-4 rounded-2xl border border-dashed border-surface-border text-ink-secondary group-open:hidden">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-warning/[0.14] text-[#f5a524] flex items-center justify-center">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <span className="text-[13.5px] font-semibold">Atualizar saldo mensal</span>
              </div>
            </div>
          </summary>
          <Card className="mt-2 border-surface-border/60">
            <div className="flex items-center gap-2 mb-4 text-slate-400 font-bold uppercase text-xs tracking-widest">
              <TrendingUp className="h-4 w-4" />
              <span>Atualizar Saldo Mensal</span>
            </div>
            <form action={saveSaldoMensal} className="space-y-2">
              <FormGroup label="Investimento">
                <Select name="investimento_id" required className="h-9 text-sm w-full">
                  <option value="">Selecione...</option>
                  {investimentos.map(i => <option key={i.id} value={i.id}>{i.nome}</option>)}
                </Select>
              </FormGroup>
              <div className="grid grid-cols-2 gap-2">
                <FormGroup label="Mês">
                  <Select name="mes" required className="h-9 text-sm w-full" defaultValue={mesAtual}>
                    {Array.from({ length: 12 }, (_, i) => {
                      const d = new Date(); d.setMonth(i);
                      const val = `${new Date().getFullYear()}-${String(i+1).padStart(2,"0")}`;
                      return <option key={val} value={val}>{d.toLocaleDateString("pt-BR",{month:"long"})} {new Date().getFullYear()}</option>;
                    })}
                  </Select>
                </FormGroup>
                <FormGroup label="Saldo">
                  <Input name="saldo" type="number" step="0.01" min="0" placeholder="0,00" required className="h-9 text-sm w-full" />
                </FormGroup>
              </div>
              <Button type="submit" className="h-9 px-4 text-sm font-semibold inline-flex items-center justify-center w-full">
                <Plus className="h-4 w-4 mr-1.5" />
                Salvar
              </Button>
            </form>
            <p className="text-[11px] text-slate-500 mt-3">
              Registrar o saldo do mês atualiza automaticamente o "Valor Atual" do investimento e alimenta o gráfico de evolução acima. Se já existir um registro para o mesmo mês, ele será substituído.
            </p>
          </Card>
        </details>
      </div>
    </div>
  );
}
