import { getInvestimentos, getContasWithMovs, getCategorias, getInvestimentoSaldos } from "@/lib/queries";
import { saveInvestimento, deleteInvestimento, saveMovimento, saveSaldoMensal } from "@/app/(app)/actions_investimentos";
import { Card, Button, Input, Select, PageHeader, FormGroup } from "@/components/ui";
import { currency } from "@/lib/format";
import { TrendingUp, Plus, Trash2, BarChart3, LineChart as LineChartIcon } from "lucide-react";
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
      <PageHeader
        title="Investimentos"
        description="Acompanhe seus aportes, resgates e rentabilidade"
      />

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-slate-700/40 p-4 flex flex-col justify-between min-h-[80px]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 leading-tight">Total Investido</p>
          <p className="text-base sm:text-lg font-bold text-white mt-2 tabular-nums">{currency(totalInvestido)}</p>
        </Card>
        <Card className="border-[#5DA832]/20 bg-[#5DA832]/5 p-4 flex flex-col justify-between min-h-[80px]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#5DA832]/70 leading-tight">Valor Atual</p>
          <p className="text-base sm:text-lg font-bold text-[#5DA832] mt-2 tabular-nums">{currency(totalAtual)}</p>
        </Card>
        <Card className={`p-4 flex flex-col justify-between min-h-[80px] border ${positivo ? "border-[#5DA832]/20 bg-[#5DA832]/5" : "border-rose-500/20 bg-rose-500/5"}`}>
          <p className={`text-[10px] font-bold uppercase tracking-widest leading-tight ${positivo ? "text-[#5DA832]/70" : "text-rose-400/70"}`}>Rentabilidade</p>
          <p className={`text-base sm:text-lg font-bold mt-2 tabular-nums ${positivo ? "text-[#5DA832]" : "text-rose-400"}`}>
            {positivo ? "+" : ""}{rentTotal.toFixed(2)}%
          </p>
        </Card>
      </div>

      {/* Gráfico de evolução do patrimônio */}
      <Card className="border-slate-800/60 p-4">
        <div className="flex items-center gap-2 mb-4 text-slate-400 font-bold uppercase text-xs tracking-widest">
          <LineChartIcon className="h-4 w-4" />
          <span>Evolução do Patrimônio</span>
        </div>
        {evolutionData.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-slate-500 text-sm">
              Registre o saldo mensal dos investimentos abaixo para acompanhar a evolução aqui.
            </p>
          </div>
        ) : (
          <InvestimentoEvolutionChart data={evolutionData} />
        )}
      </Card>

      {/* Formulário de atualização mensal de saldos */}
      <Card className="border-slate-800/60 p-4">
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

      {/* Formulário novo investimento */}
      <Card className="border-[#5DA832]/30 bg-gradient-to-br from-[#5DA832]/10 to-[#5DA832]/5 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-32 h-32 bg-[#5DA832]/10 rounded-full blur-3xl" />
        <div className="flex items-center gap-2 mb-4 text-[#5DA832] font-bold uppercase text-xs tracking-widest relative z-10">
          <Plus className="h-4 w-4" />
          <span>Novo Investimento</span>
        </div>
        <form action={saveInvestimento} className="relative z-10 space-y-2">
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

      {/* Formulário aporte/resgate */}
      <Card className="border-slate-800/60 p-4">
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

      {/* Lista de investimentos */}
      <div className="space-y-3">
        {investimentos.length === 0 ? (
          <Card className="text-center py-16 border-slate-800/60">
            <TrendingUp className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-base font-semibold text-slate-300 mb-2">Nenhum investimento cadastrado</h3>
            <p className="text-slate-500 text-sm">Adicione seu primeiro investimento acima</p>
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
  );
}
