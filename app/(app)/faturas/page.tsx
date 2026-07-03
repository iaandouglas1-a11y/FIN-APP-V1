import { saveFatura } from "@/app/(app)/actions";
import { Button, Card, Input, Select, Badge, PageHeader, FormGroup } from "@/components/ui";
import { currency, dateBR } from "@/lib/format";
import { invoiceTotal } from "@/lib/finance";
import { getCartoesEFaturas, getContasWithMovs } from "@/lib/queries";
import { Receipt, CalendarDays, Plus, Clock } from "lucide-react";
import PagarFaturaBtn from "./PagarFaturaBtn";

export default async function FaturasPage() {
  const [{ cartoes, faturas, movimentacoes }, contasData] = await Promise.all([
    getCartoesEFaturas(),
    getContasWithMovs(),
  ]);

  const contas = contasData.contas.map((c) => ({ id: c.id, nome: c.nome }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Faturas"
        description="Controle o fechamento e vencimento de seus cartões de crédito"
      />

      {/* Nova Fatura */}
      <Card className="border-[#5DA832]/30 bg-gradient-to-br from-[#5DA832]/10 to-[#5DA832]/5 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-32 h-32 bg-[#5DA832]/10 rounded-full blur-3xl" />
        <div className="flex items-center gap-2 mb-4 text-[#5DA832] font-bold uppercase text-xs tracking-widest relative z-10">
          <Plus className="h-4 w-4" />
          <span>Criar Nova Fatura</span>
        </div>
        <form action={saveFatura} className="grid gap-3 md:grid-cols-[1fr_180px_180px_auto] relative z-10">
          <FormGroup>
            <Select name="cartao_id" required className="h-9">
              <option value="">Selecione o Cartão</option>
              {cartoes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="Fechamento">
            <Input name="data_fechamento" type="date" required className="h-9 w-full block" />
          </FormGroup>
          <FormGroup label="Vencimento">
            <Input name="data_vencimento" type="date" required className="h-9 w-full block" />
          </FormGroup>
          <div className="flex items-end">
            <Button type="submit" className="h-9 px-5 inline-flex items-center justify-center">
              <Plus className="h-4 w-4 mr-1.5" />
              Criar
            </Button>
          </div>
        </form>
      </Card>

      {/* Lista de Faturas */}
      <div className="grid gap-6">
        {(faturas as any[]).map((f) => {
          const card   = (cartoes as any[]).find((c) => c.id === f.cartao_id);
          const expenses = (movimentacoes as any[]).filter((m) => m.fatura_id === f.id);
          const total  = invoiceTotal(f.id, movimentacoes);

          const today      = new Date();
          const vencimento = new Date(f.data_vencimento);
          const pago       = f.pago === true;
          const isOverdue  = vencimento < today && !pago;
          const isDue      = !pago && Math.abs(vencimento.getTime() - today.getTime()) < 7 * 24 * 60 * 60 * 1000;

          return (
            <Card key={f.id} className={`border-slate-800/60 relative overflow-hidden group p-0 ${pago ? "opacity-70" : ""}`}>
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#5DA832]/10 blur-3xl group-hover:bg-[#5DA832]/15 transition-all duration-300" />

              {/* Header */}
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-6 border-b border-slate-800/40 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-[#5DA832]/15 text-[#5DA832] flex items-center justify-center">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">{card?.nome ?? "Cartão"}</h2>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <CalendarDays className="h-3 w-3" />
                        <span>Fecha: <span className="text-slate-300">{dateBR(f.data_fechamento)}</span></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock className="h-3 w-3" />
                        <span>Vence: <span className="text-slate-300">{dateBR(f.data_vencimento)}</span></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total + status + botão pagar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 relative z-10">
                  <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total</p>
                    <p className={`text-2xl font-bold ${pago ? "text-[#5DA832]" : "text-white"}`}>{currency(total)}</p>
                    <div className="flex gap-1.5 mt-1 justify-end">
                      {pago    && <Badge variant="success">✓ Paga</Badge>}
                      {isOverdue && <Badge variant="error">Vencida</Badge>}
                      {isDue   && <Badge variant="warning">Vence em breve</Badge>}
                    </div>
                  </div>

                  <PagarFaturaBtn
                    faturaId={f.id}
                    cartaoId={f.cartao_id}
                    total={total}
                    pago={pago}
                    pagoEm={f.pago_em ?? null}
                    contas={contas}
                  />
                </div>
              </div>

              {/* Detalhamento */}
              <div className="p-6 relative z-10">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Detalhamento</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b border-slate-800/40 text-xs text-slate-500">
                        <th className="pb-2 font-semibold">Data</th>
                        <th className="pb-2 font-semibold">Categoria</th>
                        <th className="pb-2 font-semibold">Status</th>
                        <th className="pb-2 font-semibold text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/30">
                      {expenses.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-slate-600 italic text-xs">
                            Nenhuma despesa vinculada a esta fatura.
                          </td>
                        </tr>
                      ) : (
                        expenses.map((m: any) => (
                          <tr key={m.id} className="hover:bg-slate-800/20 transition-colors">
                            <td className="py-2 text-slate-400 text-xs">{dateBR(m.data)}</td>
                            <td className="py-2 text-slate-300 text-xs">{m.categorias?.nome}</td>
                            <td className="py-2">
                              <Badge variant={m.status === "realizado" ? "success" : "warning"} className="text-[10px]">
                                {m.status === "realizado" ? "✓ Realizado" : "◐ Previsto"}
                              </Badge>
                            </td>
                            <td className="py-2 text-right font-semibold text-white text-xs">{currency(Number(m.valor))}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          );
        })}

        {faturas.length === 0 && (
          <Card className="text-center py-16 border-slate-800/60">
            <Receipt className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-base font-semibold text-slate-300 mb-2">Nenhuma fatura registrada</h3>
            <p className="text-slate-500 text-sm">Crie uma fatura para seus cartões acima</p>
          </Card>
        )}
      </div>
    </div>
  );
}
