import { Card, Surface, AmountText } from "@/components/ui";
import { FinancialRow } from "@/components/FinancialRow";
import { getFinancialItems } from "@/lib/financeiro";

export default async function ContasECartoesPage() {
  const items = await getFinancialItems();

  const contas = items.filter((i) => i.tipo === "conta");
  const cartoes = items.filter((i) => i.tipo === "cartao");

  // ⚠️ temporário (sem saldo real ainda)
  const totalContas = contas.length * 0;
  const totalCartoes = cartoes.length * 0;

  const saldoFinal = 0;

  return (
    <div className="space-y-6">
      <Surface className="p-5">
        <div>
          <p className="text-sm text-white/60">Saldo consolidado</p>
          <AmountText value={saldoFinal} size="lg" />
        </div>
      </Surface>

      <Card className="p-3 space-y-2">
        {items.map((item) => (
          <FinancialRow key={item.id} item={item} />
        ))}
      </Card>
    </div>
  );
}
