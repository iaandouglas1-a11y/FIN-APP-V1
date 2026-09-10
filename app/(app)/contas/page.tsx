import { Card, EntityLogo, Surface, AmountText } from "@/components/ui";
import { Wallet, Landmark, PiggyBank, Banknote, CreditCard } from "lucide-react";
import type { IconTone } from "@/components/ui";

import EditarContaBtn from "./EditarContaBtn";
import ContaQuickInline from "./ContaQuickInline";

import { getFinancialItems } from "@/lib/financeiro";

const TYPE_META: Record<string, { icon: any; label: string; tone: IconTone }> = {
  corrente:     { icon: Landmark,    label: "Conta corrente", tone: "blue" },
  poupanca:     { icon: PiggyBank,   label: "Poupança",       tone: "green" },
  investimento: { icon: Wallet,      label: "Investimento",   tone: "purple" },
  dinheiro:     { icon: Banknote,    label: "Dinheiro",       tone: "amber" },

  // cartões (novo modelo)
  cartao:       { icon: CreditCard,  label: "Cartão",         tone: "blue" },
};

export default async function ContasPage() {
  const items = await getFinancialItems();

  const contas = items.filter((i) => i.tipo === "conta");
  const cartoes = items.filter((i) => i.tipo === "cartao");

  return (
    <div className="space-y-6">

      {/* CONTAS */}
      <div>
        <h3 className="text-[15px] font-bold text-ink-primary mb-2.5 px-1">
          Contas
        </h3>

        {contas.length === 0 ? (
          <Card className="text-center py-14">
            <Wallet className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-[15px] font-semibold text-slate-300 mb-1">
              Nenhuma conta registrada
            </h3>
            <p className="text-ink-tertiary text-sm">
              Adicione uma conta abaixo para começar.
            </p>
          </Card>
        ) : (
          <Surface padded={false} className="divide-y divide-surface-border/50">
            {contas.map((conta) => {
              const meta = TYPE_META[conta.tipo] ?? TYPE_META.corrente;
              const Icon = meta.icon;

              return (
                <div key={conta.id} className="list-row">
                  <EntityLogo
                    src={conta.logo_url}
                    icon={Icon}
                    tone={meta.tone}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-semibold text-ink-primary truncate">
                      {conta.nome}
                    </div>
                    <div className="text-[11.5px] text-ink-tertiary mt-0.5">
                      {meta.label}
                    </div>
                  </div>

                  <AmountText value={0} tone="green" />

                  <EditarContaBtn
                    id={conta.id}
                    nome={conta.nome}
                    tipo={conta.tipo}
                  />
                </div>
              );
            })}
          </Surface>
        )}
      </div>

      {/* CARTÕES */}
      <div>
        <h3 className="text-[15px] font-bold text-ink-primary mb-2.5 px-1">
          Cartões
        </h3>

        {cartoes.length === 0 ? (
          <Card className="text-center py-14">
            <CreditCard className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-[15px] font-semibold text-slate-300 mb-1">
              Nenhum cartão registrado
            </h3>
            <p className="text-ink-tertiary text-sm">
              Adicione um cartão abaixo para começar.
            </p>
          </Card>
        ) : (
          <Surface padded={false} className="divide-y divide-surface-border/50">
            {cartoes.map((cartao) => {
              const meta = TYPE_META.cartao;
              const Icon = meta.icon;

              return (
                <div key={cartao.id} className="list-row">
                  <EntityLogo
                    src={cartao.logo_url}
                    icon={Icon}
                    tone={meta.tone}
                  />

                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-semibold text-ink-primary truncate">
                      {cartao.nome}
                    </div>
                    <div className="text-[11.5px] text-ink-tertiary mt-0.5">
                      Limite disponível
                    </div>
                  </div>

                  <AmountText value={cartao.limite || 0} tone="blue" />

                  <EditarContaBtn
                    id={cartao.id}
                    nome={cartao.nome}
                    tipo="cartao"
                  />
                </div>
              );
            })}
          </Surface>
        )}
      </div>

      {/* CRIAÇÃO (ainda legado-safe via inline antigo) */}
      <ContaQuickInline />

    </div>
  );
}
