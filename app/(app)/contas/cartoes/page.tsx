import { Card, EntityLogo, Surface, AmountText } from "@/components/ui";
import { currency } from "@/lib/format";
import { invoiceTotal } from "@/lib/finance";
import { getCartoesEFaturas, getContasWithMovs } from "@/lib/queries";
import { CreditCard } from "lucide-react";
import EditarCartaoBtn from "./EditarCartaoBtn";
import CartaoQuickInline from "./CartaoQuickInline";

export default async function CartoesPage() {
  const [{ cartoes, faturas, movimentacoes }, { contas }] = await Promise.all([
    getCartoesEFaturas(),
    getContasWithMovs()
  ]);

  return (
    <div className="space-y-6">

      {/* Lista */}
      <div>
        <h3 className="text-[15px] font-bold text-ink-primary mb-2.5 px-1">
          Todos os cartões
        </h3>

        {(cartoes as any[]).length === 0 ? (
          <Card className="text-center py-14">
            <CreditCard className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-[15px] font-semibold text-slate-300 mb-1">
              Nenhum cartão cadastrado
            </h3>
            <p className="text-ink-tertiary text-sm">
              Adicione um cartão abaixo para começar.
            </p>
          </Card>
        ) : (
          <Surface padded={false} className="divide-y divide-surface-border/50">
            {(cartoes as any[]).map((card) => {
              const cardInvoices = faturas.filter((f) => f.cartao_id === card.id);
              const faturasEmAberto = cardInvoices.filter((f) => !(f as any).pago);

              const totalUsed = faturasEmAberto.reduce(
                (sum, f) => sum + invoiceTotal(f.id, movimentacoes),
                0
              );

              return (
                <div key={card.id} className="list-row">
                  <EntityLogo
                    src={(card as any).logo_url}
                    icon={CreditCard}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-semibold text-ink-primary truncate">
                      {card.nome}
                    </div>
                    <div className="text-[11.5px] text-ink-tertiary mt-0.5">
                      Limite {currency(Number(card.limite))}
                    </div>
                  </div>

                  <AmountText
                    value={totalUsed}
                    tone={totalUsed >= 0 ? "red" : "green"} // cartão = gasto
                  />

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
              );
            })}
          </Surface>
        )}
      </div>

      {/* Criar cartão */}
      <CartaoQuickInline
        contas={contas.map((c) => ({
          id: c.id,
          nome: c.nome,
        }))}
      />

    </div>
  );
}
