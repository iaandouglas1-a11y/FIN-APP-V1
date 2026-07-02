import { saveFatura } from "@/app/(app)/actions";
import { Button, Card, Input, Select, Badge, PageHeader, FormGroup } from "@/components/ui";
import { currency, dateBR } from "@/lib/format";
import { invoiceTotal } from "@/lib/finance";
import { getCartoesEFaturas } from "@/lib/queries";
import { Receipt, CalendarDays, ArrowDownCircle, Plus, Clock } from "lucide-react";

export default async function FaturasPage() {
  const { cartoes, faturas, movimentacoes } = await getCartoesEFaturas();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader 
        title="Faturas"
        description="Controle o fechamento e vencimento de seus cartões de crédito"
      />

      {/* Nova Fatura Card */}
      <Card className="border-[#5DA832]/30 bg-gradient-to-br from-[#5DA832]/10 to-[#5DA832]/5 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-32 h-32 bg-[#5DA832]/10 rounded-full blur-3xl" />
        
        <div className="flex items-center gap-2 mb-6 text-[#5DA832] font-bold uppercase text-xs tracking-widest relative z-10">
          <Plus className="h-4 w-4" />
          <span>Criar Nova Fatura</span>
        </div>
        
        <form action={saveFatura} className="grid gap-4 md:grid-cols-[1fr_180px_180px_auto] relative z-10">
          <FormGroup>
            <Select name="cartao_id" required className="h-9">
              <option value="">Selecione o Cartão</option>
              {cartoes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </Select>
          </FormGroup>
          
          <FormGroup label="Fechamento">
            <Input name="data_fechamento" type="date" required className="h-9" />
          </FormGroup>
          
          <FormGroup label="Vencimento">
            <Input name="data_vencimento" type="date" required className="h-9" />
          </FormGroup>
          
          <div className="flex items-end">
            <Button type="submit" className="h-9 px-5">
              <Plus className="h-4 w-4 mr-2" />
              Criar
            </Button>
          </div>
        </form>
      </Card>

      {/* Faturas List */}
      <div className="grid gap-6">
        {(faturas as any[]).map((f) => {
          const card = (cartoes as any[]).find((c) => c.id === f.cartao_id);
          const expenses = (movimentacoes as any[]).filter((m) => m.fatura_id === f.id);
          const total = invoiceTotal(f.id, movimentacoes);
          
          // Determine status
          const today = new Date();
          const vencimento = new Date(f.data_vencimento);
          const isPaid = false; // You can add a status field if needed
          const isOverdue = vencimento < today && !isPaid;
          const isDue = Math.abs(vencimento.getTime() - today.getTime()) < 7 * 24 * 60 * 60 * 1000;

          return (
            <Card 
              key={f.id} 
              className="border-slate-800/60 bg-slate-900/30 relative overflow-hidden group"
            >
              {/* Decorative Background */}
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#5DA832]/10 blur-3xl group-hover:bg-[#5DA832]/15 transition-all duration-300" />

              {/* Header Section */}
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600/30 to-indigo-600/10 text-[#5DA832] group-hover:from-indigo-600/40 group-hover:to-indigo-600/20 transition-all duration-300">
                    <Receipt className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{card?.nome ?? "Cartão"}</h2>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <CalendarDays className="h-3.5 w-3.5" />
                        <span>Fecha: <span className="text-slate-300 font-medium">{dateBR(f.data_fechamento)}</span></span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Vence: <span className="text-slate-300 font-medium">{dateBR(f.data_vencimento)}</span></span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right relative z-10">
                  <p className="text-xs text-slate-500 uppercase font-semibold tracking-wider mb-2">Total da Fatura</p>
                  <p className="text-4xl font-bold text-white">{currency(total)}</p>
                  {isOverdue && <Badge variant="error" className="mt-2">Vencida</Badge>}
                  {isDue && !isOverdue && <Badge variant="warning" className="mt-2">Próximo Vencimento</Badge>}
                </div>
              </div>

              {/* Divider */}
              <div className="my-6 h-px bg-slate-800/40 relative z-10" />

              {/* Detalhamento */}
              <div className="relative z-10">
                <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-slate-500" />
                  Detalhamento da Fatura
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-800/30 text-slate-400 text-left border-b border-slate-800/40">
                        <th className="px-4 py-3 font-semibold">Data</th>
                        <th className="px-4 py-3 font-semibold">Categoria</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40">
                      {expenses.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-slate-600 italic">
                            Nenhuma despesa vinculada a esta fatura.
                          </td>
                        </tr>
                      ) : (
                        expenses.map((m) => (
                          <tr 
                            key={m.id} 
                            className="hover:bg-slate-800/20 transition-all duration-200 border-slate-800/40"
                          >
                            <td className="px-4 py-3 text-slate-400 font-medium">
                              {dateBR(m.data)}
                            </td>
                            <td className="px-4 py-3 text-slate-300 font-medium">
                              {m.categorias?.nome}
                            </td>
                            <td className="px-4 py-3">
                              <Badge 
                                variant={m.status === "realizado" ? "success" : "warning"}
                                className="text-[10px]"
                              >
                                {m.status === "realizado" ? "✓ Realizado" : "◐ Previsto"}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-white">
                              {currency(Number(m.valor))}
                            </td>
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
      </div>

      {/* Empty State */}
      {faturas.length === 0 && (
        <Card className="text-center py-16 border-slate-800/60 relative z-10">
          <Receipt className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">Nenhuma fatura registrada</h3>
          <p className="text-slate-500 mb-6">Comece criando uma fatura para seus cartões</p>
          <Button variant="secondary">
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeira Fatura
          </Button>
        </Card>
      )}
    </div>
  );
}
