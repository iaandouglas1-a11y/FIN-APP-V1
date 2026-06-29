import { unstable_noStore as noStore } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabaseClient";
import { monthBounds } from "@/lib/finance";
import type { Movimentacao, Conta, Categoria, Cartao, Fatura } from "@/types/database";

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

export async function getDashboardData() { 
  noStore(); 
  const s = await createServerSupabaseClient(); 
  const b = monthBounds(); 
  const [allMovs, monthMovs] = await Promise.all([
    s.from("movimentacoes").select("*"), 
    s.from("movimentacoes").select("*, categorias(nome)").gte("data", b.start).lte("data", b.end)
  ]); 
  if (allMovs.error) throw allMovs.error; 
  if (monthMovs.error) throw monthMovs.error; 
  return { 
    allMovs: (allMovs.data || []) as Movimentacao[], 
    monthMovs: (monthMovs.data || []) as any[] 
  }; 
}

export async function getCartoesEFaturas() { 
  noStore(); 
  const s = await createServerSupabaseClient(); 
  const [cartoes, faturas, movs] = await Promise.all([
    s.from("cartoes").select("*, contas(nome)").order("nome"), 
    s.from("faturas").select("*").order("data_vencimento", { ascending: false }), 
    s.from("movimentacoes").select("*, categorias(nome)").order("data", { ascending: false })
  ]); 
  if (cartoes.error) throw cartoes.error; 
  if (faturas.error) throw faturas.error; 
  if (movs.error) throw movs.error; 
  return { 
    cartoes: (cartoes.data || []) as any[], 
    faturas: (faturas.data || []) as Fatura[], 
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
