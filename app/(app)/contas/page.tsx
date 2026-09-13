import { Surface, AmountText } from "@/components/ui";
import { getContasWithMovs } from "@/lib/queries";
import ContasCartoesBody from "./ContasCartoesBody";

export default async function ContasECartoesPage() {
  const contasData = await getContasWithMovs();
  
  const contas = contasData.contas.map(c => ({
    id: c.id,
    nome: c.nome,
    tipo: "conta" as const,
    logo_url: c.logo_url,
    saldo: Number(c.saldo || 0),
  }));

  const cartoes = contasData.cartoes.map(c => ({
    id: c.id,
    nome: c.nome,
    tipo: "cartao" as const,
    logo_url: c.logo_url,
    saldo: -Number(c.saldo_usado || 0),
    limite: Number(c.limite || 0),
    usado: Number(c.saldo_usado || 0),
    disponivel: Number(c.limite || 0) - Number(c.saldo_usado || 0),
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
