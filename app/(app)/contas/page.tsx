import { Surface, AmountText } from "@/components/ui";
import { getFinancialOverview } from "@/lib/financialengine";
import ContasCartoesBody from "./ContasCartoesBody";

export default async function ContasECartoesPage() {
  const items = await getFinancialOverview();

  const contas = items
    .filter((i) => i.tipo === "conta")
    .map((c) => ({
      id: c.id,
      nome: c.nome,
      tipo: "conta" as const,
      logo_url: c.logo_url,
      saldo: c.saldo,
    }));

  const cartoes = items
    .filter((i) => i.tipo === "cartao")
    .map((c) => ({
      id: c.id,
      nome: c.nome,
      tipo: "cartao" as const,
      logo_url: c.logo_url,
      saldo: c.saldo,
      limite: c.limite || 0,
      usado: c.usado || 0,
      disponivel: c.disponivel || 0,
    }));

  const saldoConsolidado = contas.reduce((s, c) => s + c.saldo, 0);

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
