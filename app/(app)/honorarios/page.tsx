import { getHonorarios, getContasWithMovs } from "@/lib/queries";
import { saveHonorario, deleteHonorario } from "@/app/(app)/actions_honorarios";
import { Card, Button, Input, Select, FormGroup, Badge, IconChip, AmountText, StatPill, Surface } from "@/components/ui";
import { currency, dateBR } from "@/lib/format";
import { HandCoins, Plus, Trash2, User } from "lucide-react";
import PagarHonorarioBtn from "./PagarHonorarioBtn";
import EditarHonorarioBtn from "./EditarHonorarioBtn";

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
      <h1 className="text-[22px] font-bold text-ink-primary tracking-tight px-1">Honorários</h1>

      {/* Resumo — grade 2x2 */}
      <div className="flex gap-3">
        <StatPill label="Total do mês" value={currency(totalMes)} />
        <StatPill label="Recebido" value={currency(recebidoMes)} tone="green" />
      </div>
      <div className="flex gap-3">
        <StatPill label="Pendente" value={currency(pendenteMes)} tone="amber" />
        <StatPill label="Atrasado" value={currency(totalAtrasado)} tone={totalAtrasado > 0 ? "red" : "neutral"} />
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
              <Select name="competencia" required className="h-9 text-sm w-full" defaultValue={mesAtual}>
                {Array.from({ length: 12 }, (_, i) => {
                  const d = new Date(); d.setMonth(i);
                  const val = `${new Date().getFullYear()}-${String(i+1).padStart(2,"0")}`;
                  return <option key={val} value={val}>{d.toLocaleDateString("pt-BR",{month:"long"})} {new Date().getFullYear()}</option>;
                })}
              </Select>
            </FormGroup>
            <FormGroup label="Valor">
              <Input name="valor" type="number" step="0.01" min="0" placeholder="0,00" required className="h-9 text-sm w-full" />
            </FormGroup>
          </div>
          {/* Linha 3: Vencimento | Observação */}
          <div className="grid grid-cols-2 gap-2">
            <FormGroup label="Vencimento">
              <Input name="vencimento" type="date" required className="h-9 w-full text-sm" />
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
      <Card className="p-0 overflow-hidden border-surface-border/60">
        <div className="px-4 py-3 border-b border-surface-border/40 flex items-center justify-between">
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
          <div className="divide-y divide-surface-border/40">
            {ordenados.map(h => {
              const atrasado = !h.pago && h.vencimento < hojeStr;
              const tone = h.pago ? "green" : atrasado ? "red" : "amber";
              return (
                <div key={h.id} className="p-4 flex flex-wrap items-center gap-3">
                  <IconChip icon={User} tone={tone} />
                  <div className="min-w-[160px] flex-1">
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

                  <AmountText value={Number(h.valor)} tone={h.pago ? "green" : "neutral"} className="w-24 text-right shrink-0" />

                  <PagarHonorarioBtn
                    honorarioId={h.id}
                    clienteNome={clienteNome(h.cliente_id)}
                    valor={Number(h.valor)}
                    pago={h.pago}
                    pagoEm={h.pago_em}
                    contas={contasList}
                  />

                  <EditarHonorarioBtn
                    honorario={{
                      id: h.id,
                      cliente_id: h.cliente_id,
                      competencia: h.competencia,
                      valor: Number(h.valor),
                      vencimento: h.vencimento,
                      observacao: h.observacao,
                    }}
                    clientes={clientes.map(c => ({ id: c.id, nome: c.nome }))}
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
