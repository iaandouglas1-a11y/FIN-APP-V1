import { Surface, AmountText } from "@/components/ui";
import { getFinancialOverview } from "@/lib/financialengine";
import ContasCartoesBody from "./ContasCartoesBody";

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

      <ContasCartoesBody contas={contas} cartoes={cartoes} />
    </div>
  );
}
