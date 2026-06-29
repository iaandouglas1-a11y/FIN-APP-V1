export type Database = {
  public: {
    Tables: {
      contas: { Row: { id: string; nome: string; tipo: string }; Insert: { id?: string; nome: string; tipo: string }; Update: { id?: string; nome?: string; tipo?: string } };
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
      cartoes: { Row: { id: string; nome: string; limite: number; conta_id: string }; Insert: { id?: string; nome: string; limite: number; conta_id: string }; Update: { id?: string; nome?: string; limite?: number; conta_id?: string } };
      faturas: { Row: { id: string; cartao_id: string; data_fechamento: string; data_vencimento: string }; Insert: { id?: string; cartao_id: string; data_fechamento: string; data_vencimento: string }; Update: { id?: string; cartao_id?: string; data_fechamento?: string; data_vencimento?: string } };
      movimentacoes: { Row: { id: string; tipo: "receita" | "despesa"; valor: number; data: string; categoria_id: string; conta_id: string | null; cartao_id: string | null; fatura_id: string | null; status: "previsto" | "realizado" }; Insert: { id?: string; tipo: "receita" | "despesa"; valor: number; data: string; categoria_id: string; conta_id?: string | null; cartao_id?: string | null; fatura_id?: string | null; status: "previsto" | "realizado" }; Update: Partial<Database["public"]["Tables"]["movimentacoes"]["Insert"]> };
    }; Views: Record<string, never>; Functions: Record<string, never>; Enums: Record<string, never>; CompositeTypes: Record<string, never>;
  };
};
export type Conta = Database["public"]["Tables"]["contas"]["Row"];
export type Categoria = Database["public"]["Tables"]["categorias"]["Row"];
export type Cartao = Database["public"]["Tables"]["cartoes"]["Row"];
export type Fatura = Database["public"]["Tables"]["faturas"]["Row"];
export type Movimentacao = Database["public"]["Tables"]["movimentacoes"]["Row"];
