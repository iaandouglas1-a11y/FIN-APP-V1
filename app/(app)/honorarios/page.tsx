import { getHonorarios, getContasWithMovs } from "@/lib/queries";
import { saveHonorario, deleteHonorario } from "@/app/(app)/actions_honorarios";
import { Card, Button, Input, Select, PageHeader, FormGroup, Badge } from "@/components/ui";
import { currency, dateBR } from "@/lib/format";
import { HandCoins, Plus, Trash2 } from "lucide-react";
import PagarHonorarioBtn from "./PagarHonorarioBtn";

function formatCompetencia(competencia: string) {
  const [ano, mes] = competencia.slice(0, 7).split("-");
  const nomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${nomes[Number(mes) - 1]}/${ano}`;
}

export default async function HonorariosPage() {
  const [{ honorarios, clientes }, { contas }] = await Promise.all([
    getHonorarios(),
    getContasWithMovs(),
  ]);

  const contasList = contas.map(c => ({ id: c.id, nome: c.nome }));
  const clienteNome = (id: string) => clientes.find(c => c.id === id)?.nome ?? "Cliente removido";

  const hoje = new Date();
  const hojeStr = hoje.toISOString().slice(0, 10);
  const mesAtual = hojeStr.slice(0, 7);

  // Resumo do mês corrente (por competência)
  const doMes = honorarios.filter(h => h.competencia.slice(0, 7) === mesAtual);
  const totalMes     = doMes.reduce((s, h) => s + Number(h.valor), 0);
  const recebidoMes  = doMes.filter(h => h.pago).reduce((s, h) => s + Number(h.valor), 0);
  const pendenteMes  = totalMes - recebidoMes;

  // Atrasados (qualquer competência, vencimento passado e não pago)
  const atrasados = honorarios.filter(h => !h.pago && h.vencimento < hojeStr);
  const totalAtrasado = atrasados.reduce((s, h) => s + Number(h.valor), 0);

  // Ordena por vencimento (mais próximos/atrasados primeiro), pagos por último
  const ordenados = [...honorarios].sort((a, b) => {
    if (a.pago !== b.pago) return a.pago ? 1 : -1;
    return a.vencimento.localeCompare(b.vencimento);
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Honorários"
        description="Controle os honorários mensais cobrados de cada cliente"
      />

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-slate-700/40 p-4 flex flex-col justify-between min-h-[80px]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 leading-tight">Total do Mês</p>
          <p className="text-base sm:text-lg font-bold text-white mt-2 tabular-nums">{currency(totalMes)}</p>
        </Card>
        <Card className="border-[#5DA832]/20 bg-[#5DA832]/5 p-4 flex flex-col justify-between min-h-[80px]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#5DA832]/70 leading-tight">Recebido no Mês</p>
          <p className="text-base sm:text-lg font-bold text-[#5DA832] mt-2 tabular-nums">{currency(recebidoMes)}</p>
        </Card>
        <Card className={`p-4 flex flex-col justify-between min-h-[80px] border ${totalAtrasado > 0 ? "border-rose-500/20 bg-rose-500/5" : "border-slate-700/40"}`}>
          <p className={`text-[10px] font-bold uppercase tracking-widest leading-tight ${totalAtrasado > 0 ? "text-rose-400/70" : "text-slate-500"}`}>Atrasado</p>
          <p className={`text-base sm:text-lg font-bold mt-2 tabular-nums ${totalAtrasado > 0 ? "text-rose-400" : "text-white"}`}>
            {currency(totalAtrasado)}
          </p>
        </Card>
      </div>

      {/* Formulário novo honorário */}
      <Card className="border-[#5DA832]/30 bg-gradient-to-br from-[#5DA832]/10 to-[#5DA832]/5 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-32 h-32 bg-[#5DA832]/10 rounded-full blur-3xl" />
        <div className="flex items-center gap-2 mb-4 text-[#5DA832] font-bold uppercase text-xs tracking-widest relative z-10">
          <Plus className="h-4 w-4" />
          <span>Lançar Honorário</span>
        </div>
        <form action={saveHonorario} className="relative z-10 space-y-2">
          {/* Linha 1: Cliente (largura total) */}
          <FormGroup label="Cliente">
            <Select name="cliente_id" required className="h-9 text-sm w-full">
              <option value="">Selecione...</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </Select>
          </FormGroup>
          {/* Linha 2: Competência | Valor */}
          <div className="grid grid-cols-2 gap-2">
            <FormGroup label="Competência">
              <Input name="competencia" type="month" required defaultValue={mesAtual} className="h-9 w-full block text-sm" />
            </FormGroup>
            <FormGroup label="Valor">
              <Input name="valor" type="number" step="0.01" min="0" placeholder="0,00" required className="h-9 text-sm w-full" />
            </FormGroup>
          </div>
          {/* Linha 3: Vencimento | Observação */}
          <div className="grid grid-cols-2 gap-2">
            <FormGroup label="Vencimento">
              <Input name="vencimento" type="date" required className="h-9 w-full block text-sm" />
            </FormGroup>
            <FormGroup label="Observação">
              <Input name="observacao" placeholder="Ex: Honorário contábil..." className="h-9 text-sm w-full" />
            </FormGroup>
          </div>
          {/* Botão */}
          <Button type="submit" className="h-9 px-4 text-sm font-semibold inline-flex items-center justify-center w-full">
            <Plus className="h-4 w-4 mr-1.5" />
            Lançar
          </Button>
        </form>
      </Card>

      {/* Lista de honorários */}
      <Card className="p-0 overflow-hidden border-slate-800/60">
        <div className="px-4 py-3 border-b border-slate-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HandCoins className="h-4 w-4 text-[#5DA832]" />
            <h3 className="font-semibold text-white text-sm">Honorários Lançados</h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#5DA832]/10 text-[#5DA832] border border-[#5DA832]/30">
            {honorarios.length} {honorarios.length === 1 ? "lançamento" : "lançamentos"}
          </span>
        </div>

        {ordenados.length === 0 ? (
          <div className="text-center py-16">
            <HandCoins className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-base font-semibold text-slate-300 mb-2">Nenhum honorário lançado</h3>
            <p className="text-slate-500 text-sm">Lance o primeiro honorário usando o formulário acima</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/40">
            {ordenados.map(h => {
              const atrasado = !h.pago && h.vencimento < hojeStr;
              return (
                <div key={h.id} className="p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-[180px] flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-white text-sm">{clienteNome(h.cliente_id)}</p>
                      <Badge variant="default" className="text-[10px]">{formatCompetencia(h.competencia)}</Badge>
                      {atrasado && <Badge variant="error" className="text-[10px]">Atrasado</Badge>}
                      {!h.pago && !atrasado && <Badge variant="warning" className="text-[10px]">Pendente</Badge>}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Vencimento: {dateBR(h.vencimento)}
                      {h.observacao && <span className="ml-2 text-slate-600">— {h.observacao}</span>}
                    </p>
                  </div>

                  <p className="text-sm font-bold text-white tabular-nums w-24 text-right shrink-0">
                    {currency(Number(h.valor))}
                  </p>

                  <PagarHonorarioBtn
                    honorarioId={h.id}
                    clienteNome={clienteNome(h.cliente_id)}
                    valor={Number(h.valor)}
                    pago={h.pago}
                    pagoEm={h.pago_em}
                    contas={contasList}
                  />

                  <form action={deleteHonorario}>
                    <input type="hidden" name="id" value={h.id} />
                    <button type="submit" className="p-1.5 text-slate-600 hover:text-rose-400 rounded transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
