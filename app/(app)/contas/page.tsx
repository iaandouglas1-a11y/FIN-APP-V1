import { saveConta } from "@/app/(app)/actions";
import { Card, Button, Input, Select, FormGroup, IconChip, Surface, AmountText } from "@/components/ui";
import { accountBalance } from "@/lib/finance";
import { getContasWithMovs } from "@/lib/queries";
import { Wallet, Landmark, PiggyBank, Banknote, Plus } from "lucide-react";
import type { IconTone } from "@/components/ui";
import EditarContaBtn from "./EditarContaBtn";

const TYPE_META: Record<string, { icon: any; label: string; tone: IconTone; gradient: string }> = {
  corrente:     { icon: Landmark,  label: "Conta corrente", tone: "blue",   gradient: "from-[#173764] to-surface" },
  poupanca:     { icon: PiggyBank, label: "Poupança",       tone: "green",  gradient: "from-[#2c4f1a] to-surface" },
  investimento: { icon: Wallet,    label: "Investimento",   tone: "purple", gradient: "from-[#3d2a63] to-surface" },
  dinheiro:     { icon: Banknote,  label: "Dinheiro",       tone: "amber",  gradient: "from-[#4a3a14] to-surface" },
};

export default async function ContasPage() {
  const { contas, movimentacoes } = await getContasWithMovs();
  const withBalance = contas.map((c) => ({ ...c, balance: accountBalance(c.id, movimentacoes) }));

  return (
    <div className="space-y-6">
      {/* Carrossel horizontal de contas — visual de "cartão bancário" */}
      {withBalance.length > 0 && (
        <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-1 snap-x">
          {withBalance.map((conta) => {
            const meta = TYPE_META[conta.tipo] ?? TYPE_META.corrente;
            return (
              <div
                key={conta.id}
                className={`min-w-[210px] snap-start rounded-2xl p-4 bg-gradient-to-br ${meta.gradient} border border-surface-border/60 shrink-0`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wide text-white/65">{meta.label}</div>
                <AmountText value={conta.balance} size="lg" className="block mt-3 text-white" />
                <div className="text-[12px] text-white/70 mt-1 truncate">{conta.nome}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lista de todas as contas */}
      <div>
        <h3 className="text-[15px] font-bold text-ink-primary mb-2.5 px-1">Todas as contas</h3>
        {withBalance.length === 0 ? (
          <Card className="text-center py-14">
            <Wallet className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-[15px] font-semibold text-slate-300 mb-1">Nenhuma conta registrada</h3>
            <p className="text-ink-tertiary text-sm">Adicione uma conta abaixo para começar a rastrear seus saldos.</p>
          </Card>
        ) : (
          <Surface padded={false} className="divide-y divide-surface-border/50">
            {withBalance.map((conta) => {
              const meta = TYPE_META[conta.tipo] ?? TYPE_META.corrente;
              const Icon = meta.icon;
              return (
                <div key={conta.id} className="list-row">
                  <IconChip icon={Icon} tone={meta.tone} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-semibold text-ink-primary truncate">{conta.nome}</div>
                    <div className="text-[11.5px] text-ink-tertiary mt-0.5">{meta.label}</div>
                  </div>
                  <AmountText value={conta.balance} tone={conta.balance >= 0 ? "green" : "red"} />
                  <EditarContaBtn id={conta.id} nome={conta.nome} tipo={conta.tipo} />
                </div>
              );
            })}
          </Surface>
        )}
      </div>

      {/* Adicionar nova conta — card tracejado, discreto no fluxo */}
      <details className="group">
        <summary className="list-none cursor-pointer">
          <div className="flex items-center gap-3 p-4 rounded-2xl border border-dashed border-surface-border text-ink-secondary group-open:hidden">
            <div className="w-8 h-8 rounded-lg bg-[#5DA832]/[0.14] text-[#6fc23b] flex items-center justify-center">
              <Plus className="h-4 w-4" />
            </div>
            <span className="text-[13.5px] font-semibold">Adicionar nova conta</span>
          </div>
        </summary>

        <Card className="mt-2">
          <div className="flex items-center gap-2 mb-4 text-[#5DA832] font-bold uppercase text-xs tracking-widest">
            <Plus className="h-4 w-4" />
            <span>Nova conta</span>
          </div>
          <form action={saveConta} className="grid gap-3 sm:grid-cols-[1fr_180px_auto]">
            <FormGroup>
              <Input name="nome" placeholder="Nome da conta (Ex: Nubank, Bradesco...)" required className="h-9" />
            </FormGroup>
            <FormGroup>
              <Select name="tipo" defaultValue="corrente" className="h-9">
                <option value="corrente">Conta Corrente</option>
                <option value="poupanca">Poupança</option>
                <option value="investimento">Investimento</option>
                <option value="dinheiro">Dinheiro</option>
              </Select>
            </FormGroup>
            <div className="flex items-end">
              <Button type="submit" className="h-9 px-5 w-full sm:w-auto">
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
