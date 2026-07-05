import { saveCartao } from "@/app/(app)/actions";
import { Button, Card, Input, Select, FormGroup } from "@/components/ui";
import { currency, dateBR } from "@/lib/format";
import { invoiceTotal } from "@/lib/finance";
import { getCartoesEFaturas, getContasWithMovs } from "@/lib/queries";
import { CreditCard, Calendar, Plus, Check } from "lucide-react";

export default async function CartoesPage() {
  const [{ cartoes, faturas, movimentacoes }, { contas }] = await Promise.all([
    getCartoesEFaturas(),
    getContasWithMovs()
  ]);

  return (
    <div className="space-y-8">
      {/* Novo Cartão */}
      <Card className="border-[#5DA832]/30 bg-gradient-to-br from-[#5DA832]/10 to-[#5DA832]/5 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-32 h-32 bg-[#5DA832]/10 rounded-full blur-3xl" />
        
        <div className="flex items-center gap-2 mb-6 text-[#5DA832] font-bold uppercase text-xs tracking-widest relative z-10">
          <Plus className="h-4 w-4" />
          <span>Adicionar Novo Cartão</span>
        </div>
        
        <form action={saveCartao} className="grid gap-4 md:grid-cols-[1fr_160px_1fr_1fr_auto] relative z-10">
          <FormGroup>
            <Input name="nome" placeholder="Nome do cartão" required className="h-9" />
          </FormGroup>
          
          <FormGroup>
            <Input name="limite" type="number" step="0.01" min="0" placeholder="Limite" required className="h-9" />
          </FormGroup>
          
          <FormGroup>
            <Select name="conta_id" required className="h-9">
              <option value="">Conta de pagamento</option>
              {contas.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </Select>
          </FormGroup>

          <FormGroup label="Logo (opcional)">
            <Input name="logo" type="file" className="h-9 text-xs" />
          </FormGroup>
          
          <div className="flex items-end">
            <Button type="submit" className="h-9 px-5">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </div>
        </form>
      </Card>

      {/* Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {(cartoes as any[]).map((card) => {
          const cardInvoices = faturas.filter((f) => f.cartao_id === card.id);
          const faturasEmAberto = cardInvoices.filter((f) => !(f as any).pago);
          const totalUsed = faturasEmAberto.reduce((sum, f) => sum + invoiceTotal(f.id, movimentacoes), 0);
          const utilization = (totalUsed / Number(card.limite)) * 100;

          return (
            <Card key={card.id} className="group overflow-hidden border-slate-800/60 flex flex-col relative">
              
              {/* Header */}
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">

                  {/* 🔥 LOGO CORRIGIDO */}
                  <div className={`h-12 w-12 rounded-xl overflow-hidden ${
                    card.logo_url
                      ? ""
                      : "bg-gradient-to-br from-[#5DA832]/30 to-[#5DA832]/10 flex items-center justify-center"
                  }`}>
                    {card.logo_url ? (
                      <img
                        src={card.logo_url}
                        alt={card.nome}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <CreditCard className="h-6 w-6 text-[#5DA832]" />
                    )}
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-white">{card.nome}</h2>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">
                      Limite: <span className="text-[#5DA832]">{currency(Number(card.limite))}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Barra */}
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-xs text-slate-400">Utilização</span>
                  <span className="text-sm font-bold">{Math.round(utilization)}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${Math.min(utilization, 100)}%` }}
                  />
                </div>
              </div>

              {/* Edit */}
              <form action={saveCartao} className="space-y-3">
                <input type="hidden" name="id" value={card.id} />

                <FormGroup label="Nome">
                  <Input name="nome" defaultValue={card.nome} className="h-9" />
                </FormGroup>

                <FormGroup label="Limite">
                  <div className="flex gap-2">
                    <Input name="limite" defaultValue={card.limite} className="h-9 flex-1" />
                    <Button type="submit" className="h-9 px-3">
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </FormGroup>

                <FormGroup label="Trocar logo">
                  <Input name="logo" type="file" className="h-9 text-xs" />
                </FormGroup>
              </form>
            </Card>
          );
        })}
      </div>
    </div>
  );
}