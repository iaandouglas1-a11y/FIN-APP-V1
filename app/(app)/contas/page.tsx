import { Surface, AmountText } from "@/components/ui";
import { getFinancialOverview } from "@/lib/financialengine";
import ContasCartoesBody from "./ContasCartoesBody";

// Normaliza -0 para 0 (evita apresentação de -0,00)
function normalizeZero(value: number): number {
  return Object.is(value, -0) ? 0 : value;
}

export default async function ContasECartoesPage() {
  const items = await getFinancialOverview();

  const contas = items
    .filter((i) => i.tipo === "conta")
    .map((c) => ({
      id: c.id,
      nome: c.nome,
      tipo: "conta" as const,
      ativo: c.ativo,
      logo_url: c.logo_url,
      saldo: normalizeZero(c.saldo),
    }));

  const cartoes = items
    .filter((i) => i.tipo === "cartao")
    .map((c) => ({
      id: c.id,
      nome: c.nome,
      tipo: "cartao" as const,
      ativo: c.ativo,
      logo_url: c.logo_url,
      saldo: normalizeZero(c.saldo),
      limite: normalizeZero(c.limite || 0),
      usado: normalizeZero(c.usado || 0),
      disponivel: normalizeZero(c.disponivel || 0),
    }));

  const saldoConsolidado = normalizeZero(contas.reduce((s, c) => s + c.saldo, 0));

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
