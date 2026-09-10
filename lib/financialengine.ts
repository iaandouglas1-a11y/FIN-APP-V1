import {
  getFinancialItems,
  getMovimentacoes,
  getFaturas,
} from "@/lib/datafinance";

import type { Movimentacao } from "@/types/database";

type EnrichedFinancialItem = {
  id: string;
  nome: string;
  tipo: "conta" | "cartao";
  logo_url?: string;

  // métricas calculadas
  saldo: number;
  limite?: number;
  usado?: number;
  disponivel?: number;
};

function signedValue(mov: Movimentacao) {
  return mov.tipo === "receita"
    ? Number(mov.valor)
    : -Number(mov.valor);
}

function calcContaSaldo(contaId: string, movs: Movimentacao[]) {
  return movs
    .filter((m) => m.conta_id === contaId && m.status === "realizado")
    .reduce((sum, m) => sum + signedValue(m), 0);
}

function calcCartaoFatura(cartaoId: string, movs: Movimentacao[]) {
  return movs
    .filter((m) => m.cartao_id === cartaoId && m.tipo === "despesa")
    .reduce((sum, m) => sum + Number(m.valor), 0);
}

export async function getFinancialOverview(): Promise<
  EnrichedFinancialItem[]
> {
  const [items, movs] = await Promise.all([
    getFinancialItems(),
    getMovimentacoes(),
  ]);

  const enriched: EnrichedFinancialItem[] = items.map((item: any) => {
    if (item.tipo === "conta") {
      const saldo = calcContaSaldo(item.id, movs);

      return {
        id: item.id,
        nome: item.nome,
        tipo: "conta",
        logo_url: item.logo_url,
        saldo,
      };
    }

    if (item.tipo === "cartao") {
      const fatura = calcCartaoFatura(item.id, movs);
      const limite = Number(item.limite || 0);

      return {
        id: item.id,
        nome: item.nome,
        tipo: "cartao",
        logo_url: item.logo_url,

        saldo: -fatura,
        limite,
        usado: fatura,
        disponivel: limite - fatura,
      };
    }

    return item;
  });

  return enriched;
}
