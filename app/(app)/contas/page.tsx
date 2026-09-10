import { Card, EntityLogo, Surface, AmountText } from "@/components/ui";
import { accountBalance } from "@/lib/finance";
import { getContasWithMovs } from "@/lib/queries";
import { Wallet, Landmark, PiggyBank, Banknote } from "lucide-react";
import type { IconTone } from "@/components/ui";
import EditarContaBtn from "./EditarContaBtn";
import ContaQuickInline from "./ContaQuickInline";

const TYPE_META: Record<string, { icon: any; label: string; tone: IconTone }> = {
  corrente:     { icon: Landmark,  label: "Conta corrente", tone: "blue" },
  poupanca:     { icon: PiggyBank, label: "Poupança",       tone: "green" },
  investimento: { icon: Wallet,    label: "Investimento",   tone: "purple" },
  dinheiro:     { icon: Banknote,  label: "Dinheiro",       tone: "amber" },
};

export default async function ContasPage() {
  const { contas, movimentacoes } = await getContasWithMovs();

  const withBalance = contas.map((c) => ({
    ...c,
    balance: accountBalance(c.id, movimentacoes),
  }));

  return (
    <div className="space-y-6">

      {/* Lista */}
      <div>
        <h3 className="text-[15px] font-bold text-ink-primary mb-2.5 px-1">
          Todas as contas
        </h3>

        {withBalance.length === 0 ? (
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
            {withBalance.map((conta) => {
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

                  <AmountText
                    value={conta.balance}
                    tone={conta.balance >= 0 ? "green" : "red"}
                  />

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

      {/* Criar conta */}
      <ContaQuickInline />

    </div>
  );
}
