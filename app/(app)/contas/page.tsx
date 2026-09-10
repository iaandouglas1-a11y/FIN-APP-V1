import { Card, Surface, AmountText } from "@/components/ui";
import { FinancialRow } from "@/components/FinancialRow";

import { getFinancialItems } from "@/lib/financeiro";

function normalize(items: any[]) {
  return items.map((item) => ({
    id: item.id,
    name: item.nome,
    type: item.tipo,
    logo_url: item.logo_url,
    limit: item.limite,
  }));
}

export default async function ContasECartoesPage() {
  const items = await getFinancialItems();

  const normalized = normalize(items);

  const totalContas = items
    .filter((i) => i.tipo === "conta")
    .reduce((acc, i) => acc + (i.saldo ?? 0), 0);

  const totalCartoes = items
    .filter((i) => i.tipo === "cartao")
    .reduce((acc, i) => acc + (i.fatura ?? 0), 0);

  const saldoFinal = totalContas - totalCartoes;

  return (
    <div className="space-y-6">
      <Surface className="p-5">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-white/60">Saldo consolidado</p>
            <AmountText value={saldoFinal} size="lg" />
          </div>
        </div>
      </Surface>

      <Card className="p-3 space-y-2">
        {normalized.map((item) => (
          <FinancialRow key={item.id} item={item} />
        ))}
      </Card>
    </div>
  );
}
