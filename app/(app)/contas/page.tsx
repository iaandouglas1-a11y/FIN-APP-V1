import { Surface, Card, AmountText, EntityLogo } from "@/components/ui";
import { FinancialRow } from "@/components/FinancialRow";

import { getContasEFaturas } from "@/lib/finance";
import { currency } from "@/lib/format";

type FinancialEntity = {
  id: string;
  name: string;
  type: "conta" | "cartao";
  balance: number;
  limit?: number;
  used?: number;
  logo_url?: string;
};

function normalizeData(contas: any[], cartoes: any[]): FinancialEntity[] {
  const contasNorm: FinancialEntity[] = contas.map((c) => ({
    id: c.id,
    name: c.nome,
    type: "conta",
    balance: c.saldo,
    logo_url: c.logo_url,
  }));

  const cartoesNorm: FinancialEntity[] = cartoes.map((c) => ({
    id: c.id,
    name: c.nome,
    type: "cartao",
    balance: -(c.fatura_atual ?? 0), // negativo visual padrão financeiro
    limit: c.limite,
    used: c.fatura_atual,
    logo_url: c.logo_url,
  }));

  return [...contasNorm, ...cartoesNorm];
}

export default async function ContasECartoesPage() {
  const { contas, cartoes } = await getContasEFaturas();

  const items = normalizeData(contas, cartoes);

  const totalContas = contas.reduce((acc: number, c: any) => acc + c.saldo, 0);
  const totalCartoes = cartoes.reduce((acc: number, c: any) => acc + (c.fatura_atual ?? 0), 0);

  const saldoFinal = totalContas - totalCartoes;

  return (
    <div className="space-y-6">
      {/* HEADER FINANCEIRO PADRONIZADO */}
      <Surface className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/60">Saldo consolidado</p>
            <AmountText value={saldoFinal} size="lg" />
          </div>

          <div className="text-right">
            <p className="text-xs text-white/50">Contas</p>
            <p className="text-sm">{currency(totalContas)}</p>

            <p className="text-xs text-white/50 mt-2">Cartões</p>
            <p className="text-sm text-red-400">-{currency(totalCartoes)}</p>
          </div>
        </div>
      </Surface>

      {/* LISTA UNIFICADA */}
      <Card className="p-3">
        <div className="space-y-2">
          {items.map((item) => (
            <FinancialRow key={item.id} item={item} />
          ))}
        </div>
      </Card>
    </div>
  );
}
