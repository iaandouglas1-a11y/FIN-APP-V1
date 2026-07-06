import { unstable_noStore as noStore } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabaseClient";
import { monthBounds } from "@/lib/finance";
import type { Movimentacao, Conta, Categoria, Cartao, Fatura, FaturaExtendida } from "@/types/database";

export async function getCategorias() { 
  noStore(); 
  const s = await createServerSupabaseClient(); 
  const { data, error } = await s.from("categorias").select("*").order("nome"); 
  if (error) throw error; 
  return data as Categoria[]; 
}

export async function getContasWithMovs() { 
  noStore(); 
  const s = await createServerSupabaseClient(); 
  const [contas, movs] = await Promise.all([
    s.from("contas").select("*").order("nome"), 
    s.from("movimentacoes").select("*")
  ]); 
  if (contas.error) throw contas.error; 
  if (movs.error) throw movs.error; 
  return { 
    contas: (contas.data || []) as Conta[], 
    movimentacoes: (movs.data || []) as Movimentacao[] 
  }; 
}

export async function getMovimentacoes(filters?: { inicio?: string; fim?: string; tipo?: "receita" | "despesa" | ""; categoriaId?: string }) { 
  noStore(); 
  const s = await createServerSupabaseClient(); 
  let q = s.from("movimentacoes").select("*, categorias(nome), contas(nome), cartoes(nome), faturas(data_vencimento)").order("data", { ascending: false }); 
  if (filters?.inicio) q = q.gte("data", filters.inicio); 
  if (filters?.fim) q = q.lte("data", filters.fim); 
  if (filters?.tipo) q = q.eq("tipo", filters.tipo); 
  if (filters?.categoriaId) q = q.eq("categoria_id", filters.categoriaId); 
  const { data, error } = await q; 
  if (error) throw error; 
  return (data || []) as any[]; 
}

export async function getDashboardData(filters?: { inicio?: string; fim?: string }) { 
  noStore(); 
  const s = await createServerSupabaseClient(); 
  const b = monthBounds(); 
  const start = filters?.inicio || b.start;
  const end = filters?.fim || b.end;
  const [allMovs, monthMovs] = await Promise.all([
    s.from("movimentacoes").select("*"), 
    s.from("movimentacoes").select("*, categorias(nome)").gte("data", start).lte("data", end)
  ]); 
  if (allMovs.error) throw allMovs.error; 
  if (monthMovs.error) throw monthMovs.error; 
  return { 
    allMovs: (allMovs.data || []) as Movimentacao[], 
    monthMovs: (monthMovs.data || []) as any[],
    filtro: { start, end }
  }; 
}

export async function getCartoesEFaturas(filters?: { inicio?: string; fim?: string }) { 
  noStore(); 
  const s = await createServerSupabaseClient(); 
  let faturasQuery = s.from("faturas").select("*").order("data_vencimento", { ascending: false });
  if (filters?.inicio) faturasQuery = faturasQuery.gte("data_vencimento", filters.inicio);
  if (filters?.fim) faturasQuery = faturasQuery.lte("data_vencimento", filters.fim);
  const [cartoes, faturas, movs] = await Promise.all([
    s.from("cartoes").select("*, contas(nome)").order("nome"), 
    faturasQuery, 
    s.from("movimentacoes").select("*, categorias(nome)").order("data", { ascending: false })
  ]); 
  if (cartoes.error) throw cartoes.error; 
  if (faturas.error) throw faturas.error; 
  if (movs.error) throw movs.error; 
  return { 
    cartoes: (cartoes.data || []) as any[], 
    faturas: (faturas.data || []) as FaturaExtendida[], 
    movimentacoes: (movs.data || []) as any[] 
  }; 
}

export function monthlyDre(movs: Movimentacao[]) { 
  const map = new Map<string, { mes: string; receitas: number; despesas: number; resultado: number }>(); 
  for (const m of movs) { 
    const mes = m.data.slice(0, 7); 
    const row = map.get(mes) ?? { mes, receitas: 0, despesas: 0, resultado: 0 }; 
    if (m.tipo === "receita") row.receitas += Number(m.valor); 
    else row.despesas += Number(m.valor); 
    row.resultado = row.receitas - row.despesas; 
    map.set(mes, row); 
  } 
  return [...map.values()].sort((a, b) => a.mes.localeCompare(b.mes)); 
}

// ── Listas ────────────────────────────────────────────────
import type { Lista, ListaItem } from "@/types/database";

export async function getListas(status?: "ativa" | "arquivada") {
  noStore();
  const s = await createServerSupabaseClient();
  let q = s.from("listas").select("*").order("created_at", { ascending: false });
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []) as Lista[];
}

export async function getListaComItens(listaId: string) {
  noStore();
  const s = await createServerSupabaseClient();
  const [lista, itens] = await Promise.all([
    s.from("listas").select("*").eq("id", listaId).single(),
    s.from("lista_itens").select("*").eq("lista_id", listaId).order("created_at", { ascending: true }),
  ]);
  if (lista.error) throw lista.error;
  if (itens.error) throw itens.error;
  return { lista: lista.data as Lista, itens: (itens.data || []) as ListaItem[] };
}

export async function getListasComItens(status?: "ativa" | "arquivada") {
  noStore();
  const s = await createServerSupabaseClient();
  let q = s.from("listas").select("*, lista_itens(*)").order("created_at", { ascending: false });
  if (status) q = q.eq("status", status);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []) as (Lista & { lista_itens: ListaItem[] })[];
}

// ── Dívidas ───────────────────────────────────────────────
import type { Divida, DividaPagamento } from "@/types/database";

export async function getDividas() {
  noStore();
  const s = await createServerSupabaseClient();
  const [dividas, pagamentos] = await Promise.all([
    s.from("dividas").select("*").order("data", { ascending: true }),
    s.from("divida_pagamentos").select("*").order("data", { ascending: true }),
  ]);
  if (dividas.error) throw dividas.error;
  if (pagamentos.error) throw pagamentos.error;
  return {
    dividas:    (dividas.data    || []) as Divida[],
    pagamentos: (pagamentos.data || []) as DividaPagamento[],
  };
}

// ── Investimentos ─────────────────────────────────────────
import type { Investimento, InvestimentoMovimento } from "@/types/database";

export async function getInvestimentos() {
  noStore();
  const s = await createServerSupabaseClient();
  const [invs, movs] = await Promise.all([
    s.from("investimentos").select("*, contas(nome)").order("nome"),
    s.from("investimento_movimentos").select("*").order("data", { ascending: false }),
  ]);
  if (invs.error) throw invs.error;
  if (movs.error) throw movs.error;
  return {
    investimentos: (invs.data || []) as (Investimento & { contas: { nome: string } | null })[],
    movimentos:    (movs.data || []) as InvestimentoMovimento[],
  };
}
