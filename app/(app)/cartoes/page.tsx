import { saveCartao } from "@/app/(app)/actions";
import { Button, Card, Input, Select, PageHeader, FormGroup } from "@/components/ui";
import { currency, dateBR } from "@/lib/format";
import { invoiceTotal } from "@/lib/finance";
import { getCartoesEFaturas, getContasWithMovs } from "@/lib/queries";
import { CreditCard, Calendar, ArrowRight, Plus, Check } from "lucide-react";

export default async function CartoesPage() {
  const [{ cartoes, faturas, movimentacoes }, { contas }] = await Promise.all([
    getCartoesEFaturas(),
    getContasWithMovs()
  ]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader 
        title="Meus Cartões"
        description="Gerencie seus limites, faturas e transações de cartão de crédito"
      />

      {/* Novo Cartão Card */}
      <Card className="border-[#5DA832]/30 bg-gradient-to-br from-[#5DA832]/10 to-[#5DA832]/5 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-32 h-32 bg-[#5DA832]/10 rounded-full blur-3xl" />
        
        <div className="flex items-center gap-2 mb-6 text-[#5DA832] font-bold uppercase text-xs tracking-widest relative z-10">
          <Plus className="h-4 w-4" />
          <span>Adicionar Novo Cartão</span>
        </div>
        
        <form action={saveCartao} className="grid gap-4 md:grid-cols-[1fr_160px_1fr_auto] relative z-10">
          <FormGroup>
            <Input 
              name="nome" 
              placeholder="Nome do cartão (Ex: Nubank Black)" 
              required 
              className="h-9"
            />
          </FormGroup>
          
          <FormGroup>
            <Input 
              name="limite" 
              type="number" 
              step="0.01" 
              min="0" 
              placeholder="Limite" 
              required 
              className="h-9"
            />
          </FormGroup>
          
          <FormGroup>
            <Select name="conta_id" required className="h-9">
              <option value="">Conta de pagamento</option>
              {contas.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </Select>
          </FormGroup>
          
          <div className="flex items-end">
            <Button type="submit" className="h-9 px-5">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </form>
      </Card>

      {/* Cartões Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {(cartoes as any[]).map((card) => {
          const cardInvoices = faturas.filter((f) => f.cartao_id === card.id);
          const totalUsed = cardInvoices.reduce((sum, f) => sum + invoiceTotal(f.id, movimentacoes), 0);
          const utilization = (totalUsed / Number(card.limite)) * 100;
          
          return (
            <Card 
              key={card.id} 
              className="group overflow-hidden border-slate-800/60 bg-gradient-to-br from-slate-900/50 to-slate-950/50 flex flex-col relative"
            >
              {/* Decorative Background */}
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#5DA832]/10 blur-3xl group-hover:bg-[#5DA832]/15 transition-all duration-300" />

              {/* Header */}
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-600/30 to-indigo-600/10 group-hover:from-indigo-600/40 group-hover:to-indigo-600/20 transition-all duration-300">
                    <CreditCard className="h-6 w-6 text-[#5DA832]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{card.nome}</h2>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
                      Limite: <span className="text-[#5DA832]">{currency(Number(card.limite))}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Utilization Bar */}
              <div className="mb-6 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Utilização</span>
                  <span className={`text-sm font-bold ${utilization > 80 ? "text-rose-400" : utilization > 50 ? "text-amber-400" : "text-emerald-400"}`}>
                    {Math.round(utilization)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800/40 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      utilization > 80 ? "bg-rose-500" : utilization > 50 ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(utilization, 100)}%` }}
                  />
                </div>
              </div>

              {/* Faturas Section */}
              <div className="mb-6 relative z-10">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-4">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  Faturas Recentes
                </h3>
                
                {cardInvoices.length === 0 ? (
                  <p className="text-sm text-slate-600 italic py-4">Nenhuma fatura registrada.</p>
                ) : (
                  <div className="grid gap-3">
                    {cardInvoices.map((f) => (
                      <div 
                        key={f.id} 
                        className="flex items-center justify-between rounded-lg bg-slate-800/30 p-4 border border-slate-800/40 group-hover:border-slate-700/60 transition-all duration-200 hover:bg-slate-800/50"
                      >
                        <div className="flex flex-col">
                          <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Vencimento</span>
                          <span className="text-sm font-semibold text-slate-200 mt-1">{dateBR(f.data_vencimento)}</span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Valor</span>
                          <span className="text-lg font-bold text-white mt-1">{currency(invoiceTotal(f.id, movimentacoes))}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="my-6 h-px bg-slate-800/40 relative z-10" />

              {/* Edit Form */}
              <form action={saveCartao} className="space-y-4 relative z-10">
                <input type="hidden" name="id" value={card.id} />
                
                <FormGroup label="Nome do Cartão">
                  <Input 
                    name="nome" 
                    defaultValue={card.nome} 
                    className="h-9 text-sm"
                  />
                </FormGroup>
                
                <FormGroup label="Limite">
                  <div className="flex gap-2">
                    <Input 
                      name="limite" 
                      type="number" 
                      step="0.01" 
                      defaultValue={card.limite} 
                      className="h-9 text-sm flex-1"
                    />
                    <Button 
                      type="submit" 
                      variant="secondary"
                      className="h-9 px-3"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </FormGroup>
              </form>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {cartoes.length === 0 && (
        <Card className="text-center py-16 border-slate-800/60 relative z-10">
          <CreditCard className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">Nenhum cartão registrado</h3>
          <p className="text-slate-500 mb-6">Comece adicionando um cartão para rastrear suas faturas</p>
          <Button variant="secondary">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Primeiro Cartão
          </Button>
        </Card>
      )}
    </div>
  );
}
