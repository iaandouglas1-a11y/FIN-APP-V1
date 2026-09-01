import { saveCartao } from "@/app/(app)/actions";
import { Card, Button, Input, Select, FormGroup, AmountText, ProgressBar } from "@/components/ui";
import { currency } from "@/lib/format";
import { invoiceTotal } from "@/lib/finance";
import { getCartoesEFaturas, getContasWithMovs } from "@/lib/queries";
import { CreditCard, Plus } from "lucide-react";
import EditarCartaoBtn from "./EditarCartaoBtn";

const GRADIENTS = [
  "from-[#3d2a63] to-surface",
  "from-[#1e3a66] to-surface",
  "from-[#2c4f1a] to-surface",
  "from-[#4a3a14] to-surface",
];

export default async function CartoesPage() {
  const [{ cartoes, faturas, movimentacoes }, { contas }] = await Promise.all([
    getCartoesEFaturas(),
    getContasWithMovs()
  ]);

  return (
    <div className="space-y-4">
      {(cartoes as any[]).length === 0 && (
        <Card className="text-center py-14">
          <CreditCard className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-[15px] font-semibold text-slate-300 mb-1">Nenhum cartão cadastrado</h3>
          <p className="text-ink-tertiary text-sm">Adicione um cartão abaixo para acompanhar limite e faturas.</p>
        </Card>
      )}

      {(cartoes as any[]).map((card, i) => {
        const cardInvoices = faturas.filter((f) => f.cartao_id === card.id);
        const faturasEmAberto = cardInvoices.filter((f) => !(f as any).pago);
        const totalUsed = faturasEmAberto.reduce((sum, f) => sum + invoiceTotal(f.id, movimentacoes), 0);
        const utilization = (totalUsed / Number(card.limite)) * 100;
        const gradient = GRADIENTS[i % GRADIENTS.length];

        return (
          <div key={card.id} className={`rounded-2xl p-5 bg-gradient-to-br ${gradient} border border-surface-border/60`}>
            <div className="flex items-center justify-between">
              <div className="text-[13px] font-bold text-white">{card.nome}</div>
              <CreditCard className="h-4 w-4 text-white/50" />
            </div>
            <AmountText value={totalUsed} size="lg" className="block mt-2.5 text-white" />
            <div className="text-[11.5px] text-white/60 mt-0.5">de limite {currency(Number(card.limite))}</div>
            <ProgressBar pct={utilization} color={utilization > 90 ? "#F04438" : utilization > 70 ? "#F5A524" : "#5DA832"} />
            <div className="flex items-center justify-between mt-4">
              <span className="text-[11px] text-white/55">{Math.round(utilization)}% utilizado</span>
              <EditarCartaoBtn
                id={card.id}
                nome={card.nome}
                limite={Number(card.limite)}
                contaId={card.conta_id ?? ""}
                contas={contas.map(c => ({ id: c.id, nome: c.nome }))}
              />
            </div>
          </div>
        );
      })}

      {/* Adicionar novo cartão */}
      <details className="group">
        <summary className="list-none cursor-pointer">
          <div className="flex items-center gap-3 p-4 rounded-2xl border border-dashed border-surface-border text-ink-secondary group-open:hidden">
            <div className="w-8 h-8 rounded-lg bg-[#5DA832]/[0.14] text-[#6fc23b] flex items-center justify-center">
              <Plus className="h-4 w-4" />
            </div>
            <span className="text-[13.5px] font-semibold">Adicionar novo cartão</span>
          </div>
        </summary>
        <Card className="mt-2">
          <div className="flex items-center gap-2 mb-4 text-[#5DA832] font-bold uppercase text-xs tracking-widest">
            <Plus className="h-4 w-4" />
            <span>Novo cartão</span>
          </div>
          <form action={saveCartao} className="grid gap-3 md:grid-cols-[1fr_160px_1fr_auto]">
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
            <div className="flex items-end">
              <Button type="submit" className="h-9 px-5 w-full md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </form>
        </Card>
      </details>
    </div>
  );
}
