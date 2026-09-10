import { Card, AmountText, ProgressBar, EntityLogo } from "@/components/ui";
import { currency } from "@/lib/format";
import { invoiceTotal } from "@/lib/finance";
import { getCartoesEFaturas, getContasWithMovs } from "@/lib/queries";
import { CreditCard } from "lucide-react";
import EditarCartaoBtn from "./EditarCartaoBtn";
import CartaoQuickInline from "./CartaoQuickInline";

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
      
      {/* Empty state */}
      {(cartoes as any[]).length === 0 && (
        <Card className="text-center py-14">
          <CreditCard className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-[15px] font-semibold text-slate-300 mb-1">
            Nenhum cartão cadastrado
          </h3>
          <p className="text-ink-tertiary text-sm">
            Adicione um cartão abaixo para acompanhar limite e faturas.
          </p>
        </Card>
      )}

      {/* Cards */}
      {(cartoes as any[]).map((card, i) => {
        const cardInvoices = faturas.filter((f) => f.cartao_id === card.id);
        const faturasEmAberto = cardInvoices.filter((f) => !(f as any).pago);

        const totalUsed = faturasEmAberto.reduce(
          (sum, f) => sum + invoiceTotal(f.id, movimentacoes),
          0
        );

        const utilization = (totalUsed / Number(card.limite)) * 100;
        const gradient = GRADIENTS[i % GRADIENTS.length];

        return (
          <div
            key={card.id}
            className={`rounded-2xl p-5 bg-gradient-to-br ${gradient} border border-surface-border/60`}
          >
            <div className="flex items-center justify-between">
              <div className="text-[13px] font-bold text-white">
                {card.nome}
              </div>

              <EntityLogo
                src={(card as any).logo_url}
                icon={CreditCard}
                size={26}
                iconSize={13}
                rounded="rounded-md"
              />
            </div>

            <AmountText
              value={totalUsed}
              size="lg"
              className="block mt-2.5 text-white"
            />

            <div className="text-[11.5px] text-white/60 mt-0.5">
              de limite {currency(Number(card.limite))}
            </div>

            <ProgressBar
              pct={utilization}
              color={
                utilization > 90
                  ? "#F04438"
                  : utilization > 70
                  ? "#F5A524"
                  : "#5DA832"
              }
            />

            <div className="flex items-center justify-between mt-4">
              <span className="text-[11px] text-white/55">
                {Math.round(utilization)}% utilizado
              </span>

              <EditarCartaoBtn
                id={card.id}
                nome={card.nome}
                limite={Number(card.limite)}
                contaId={card.conta_id ?? ""}
                contas={contas.map((c) => ({
                  id: c.id,
                  nome: c.nome,
                }))}
              />
            </div>
          </div>
        );
      })}

      {/* NOVO PADRÃO */}
      <CartaoQuickInline
        contas={contas.map((c) => ({
          id: c.id,
          nome: c.nome,
        }))}
      />

    </div>
  );
}
