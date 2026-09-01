export type Database = {
  public: {
    Tables: {
      contas: { Row: { id: string; nome: string; tipo: string; logo_url: string | null }; Insert: { id?: string; nome: string; tipo: string; logo_url?: string | null }; Update: { id?: string; nome?: string; tipo?: string; logo_url?: string | null } };
      categorias: {
  Row: {
    id: string;
    nome: string;
    categoria_pai_id: string | null;
    tipo: string;
  };
  Insert: {
    id?: string;
    nome: string;
    categoria_pai_id?: string | null;
    tipo: string;
  };
  Update: {
    id?: string;
    nome?: string;
    categoria_pai_id?: string | null;
    tipo?: string;
  };
};
      cartoes: { Row: { id: string; nome: string; limite: number; conta_id: string; logo_url: string | null }; Insert: { id?: string; nome: string; limite: number; conta_id: string; logo_url?: string | null }; Update: { id?: string; nome?: string; limite?: number; conta_id?: string; logo_url?: string | null } };
      faturas: { Row: { id: string; cartao_id: string; data_fechamento: string; data_vencimento: string; pago: boolean; pago_em: string | null; conta_pagamento_id: string | null }; Insert: { id?: string; cartao_id: string; data_fechamento: string; data_vencimento: string; pago?: boolean; pago_em?: string | null; conta_pagamento_id?: string | null }; Update: { id?: string; cartao_id?: string; data_fechamento?: string; data_vencimento?: string; pago?: boolean; pago_em?: string | null; conta_pagamento_id?: string | null } };
      movimentacoes: { Row: { id: string; tipo: "receita" | "despesa"; valor: number; data: string; categoria_id: string; conta_id: string | null; cartao_id: string | null; fatura_id: string | null; status: "previsto" | "realizado"; descricao: string | null }; Insert: { id?: string; tipo: "receita" | "despesa"; valor: number; data: string; categoria_id: string; conta_id?: string | null; cartao_id?: string | null; fatura_id?: string | null; status: "previsto" | "realizado" }; Update: Partial<Database["public"]["Tables"]["movimentacoes"]["Insert"]> };
    }; Views: Record<string, never>; Functions: Record<string, never>; Enums: Record<string, never>; CompositeTypes: Record<string, never>;
  };
};
export type Conta = Database["public"]["Tables"]["contas"]["Row"];
export type Categoria = Database["public"]["Tables"]["categorias"]["Row"];
export type Cartao = Database["public"]["Tables"]["cartoes"]["Row"];
export type Fatura = Database["public"]["Tables"]["faturas"]["Row"];
export type Movimentacao = Database["public"]["Tables"]["movimentacoes"]["Row"];

// ── Listas ────────────────────────────────────────────────
export interface Lista {
  id: string;
  nome: string;
  descricao: string | null;
  status: "ativa" | "arquivada";
  created_at: string;
}

export interface ListaItem {
  id: string;
  lista_id: string;
  nome: string;
  descricao: string | null;
  valor: number | null;
  concluido: boolean;
  created_at: string;
}

// ── Clientes ──────────────────────────────────────────────
export interface Cliente {
  id: string;
  nome: string;
  cpf: string | null;
  cnpj: string | null;
  senha_gov: string | null;
  created_at: string;
}

// ── Honorários ────────────────────────────────────────────
export interface Honorario {
  id: string;
  cliente_id: string;
  competencia: string;      // primeiro dia do mês, ex: "2026-07-01"
  valor: number;
  vencimento: string;
  pago: boolean;
  pago_em: string | null;
  conta_id: string | null;
  movimentacao_id: string | null;
  observacao: string | null;
  created_at: string;
}

// ── Fatura estendida (com campos de pagamento) ────────────
export interface FaturaExtendida {
  id: string;
  cartao_id: string;
  data_fechamento: string;
  data_vencimento: string;
  pago: boolean;
  pago_em: string | null;
  conta_pagamento_id: string | null;
  observacao: string | null;
}

// ── Dívidas ───────────────────────────────────────────────
export interface Divida {
  id: string;
  descricao: string;
  valor: number;
  observacao: string | null;
  situacao: "pendente" | "liquidado" | "parcial";
  data: string;
  categoria_id: string | null;
  created_at: string;
}

export interface DividaPagamento {
  id: string;
  divida_id: string | null;
  descricao: string;
  data: string;
  valor: number;
  tipo: "orcado" | "realizado";
  movimentacao_id: string | null;
  categoria_id: string | null;
  created_at: string;
}

// ── Investimentos ─────────────────────────────────────────
export interface Investimento {
  id: string;
  nome: string;
  tipo: "renda_fixa" | "renda_variavel";
  ticker: string | null;
  conta_id: string | null;
  valor_atual: number;
  created_at: string;
}

export interface InvestimentoMovimento {
  id: string;
  investimento_id: string;
  tipo: "aporte" | "resgate";
  valor: number;
  data: string;
  descricao: string | null;
  movimentacao_id: string | null;
  created_at: string;
}

export interface InvestimentoSaldo {
  id: string;
  investimento_id: string;
  mes: string; // sempre primeiro dia do mês, ex: "2026-07-01"
  saldo: number;
  created_at: string;
}
