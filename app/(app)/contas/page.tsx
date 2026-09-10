import { Card, Surface, AmountText, EntityLogo, EmptyState, ProgressBar } from "@/components/ui";
import { currency } from "@/lib/format";
import { getFinancialOverview } from "@/lib/financialengine";
import { Wallet, CreditCard } from "lucide-react";
import { EditarFinancialBtn } from "./EditarFinancialBtn";

export default async function ContasECartoesPage() {
  const items = await getFinancialOverview();

  const contas = items.filter((i) => i.tipo === "conta");
  const cartoes = items.filter((i) => i.tipo === "cartao");

  // Saldo consolidado considera apenas contas (mesmo critério do card
  // "Saldo em Contas" do Dashboard) — cartão é limite/uso, não entra na soma.
  const saldoConsolidado = contas.reduce((sum, c) => sum + c.saldo, 0);

  return (
    <div className="space-y-6">
      <Surface className="p-5">
        <p className="text-sm text-ink-secondary">Saldo consolidado</p>
        <AmountText value={saldoConsolidado} size="lg" />
      </Surface>

      {/* Contas */}
      <Card className="p-0 overflow-hidden border-surface-border/60">
        <div className="px-4 py-3 border-b border-surface-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-[#5DA832]" />
            <h3 className="font-semibold text-white text-sm">Contas</h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#5DA832]/10 text-[#5DA832] border border-[#5DA832]/30">
            {contas.length}
          </span>
        </div>

        {contas.length === 0 ? (
          <EmptyState icon={<Wallet className="h-10 w-10" />} title="Nenhuma conta cadastrada" />
        ) : (
          <div className="divide-y divide-surface-border/40">
            {contas.map((c) => (
              <div key={c.id} className="p-4 flex items-center gap-3">
                <EntityLogo src={c.logo_url} icon={Wallet} tone={c.saldo >= 0 ? "green" : "red"} size={48} iconSize={22} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white text-sm truncate">{c.nome}</p>
                  <p className="text-xs text-slate-500">Conta</p>
                </div>
                <AmountText value={c.saldo} tone={c.saldo >= 0 ? "green" : "red"} className="shrink-0" />
                <EditarFinancialBtn item={c} />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Cartões */}
      <Card className="p-0 overflow-hidden border-surface-border/60">
        <div className="px-4 py-3 border-b border-surface-border/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-[#5DA832]" />
            <h3 className="font-semibold text-white text-sm">Cartões</h3>
          </div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#5DA832]/10 text-[#5DA832] border border-[#5DA832]/30">
            {cartoes.length}
          </span>
        </div>

        {cartoes.length === 0 ? (
          <EmptyState icon={<CreditCard className="h-10 w-10" />} title="Nenhum cartão cadastrado" />
        ) : (
          <div className="divide-y divide-surface-border/40">
            {cartoes.map((c) => {
              const limite = c.limite ?? 0;
              const usado = c.usado ?? 0;
              const pct = limite > 0 ? (usado / limite) * 100 : 0;
              const tone = pct > 90 ? "red" : pct > 60 ? "amber" : "blue";
              const barColor = pct > 90 ? "#f87171" : pct > 60 ? "#f5a524" : "#5DA832";
              return (
                <div key={c.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <EntityLogo src={c.logo_url} icon={CreditCard} tone={tone} size={48} iconSize={22} />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white text-sm truncate">{c.nome}</p>
                      <p className="text-xs text-slate-500">
                        {currency(usado)} de {currency(limite)}
                      </p>
                    </div>
                    <AmountText value={c.disponivel ?? 0} className="shrink-0" />
                    <EditarFinancialBtn item={c} />
                  </div>
                  <ProgressBar pct={pct} color={barColor} />
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
