"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabaseClient";

// ── Schemas ───────────────────────────────────────────────
const listaSchema = z.object({
  nome: z.string().min(2, "Nome muito curto"),
  descricao: z.string().optional().or(z.literal("")),
});

const itemSchema = z.object({
  lista_id: z.string().uuid("Lista inválida"),
  nome: z.string().min(1, "Informe o nome do item"),
  descricao: z.string().optional().or(z.literal("")),
  valor: z.coerce.number().nonnegative("Valor inválido").optional().or(z.literal("")),
});

function entries(f: FormData) {
  return Object.fromEntries(f.entries());
}

// ── Listas ────────────────────────────────────────────────
export async function saveLista(formData: FormData) {
  const id = String(formData.get("id") || "");
  const parsed = listaSchema.safeParse(entries(formData));
  if (!parsed.success) throw new Error(parsed.error.errors[0].message);

  const s = await createServerSupabaseClient();
  const payload = { nome: parsed.data.nome, descricao: parsed.data.descricao || null };
  const result = id
    ? await (s.from("listas") as any).update(payload).eq("id", id)
    : await (s.from("listas") as any).insert(payload);

  if (result.error) throw new Error(result.error.message);
  revalidatePath("/listas");
}

export async function deleteLista(formData: FormData) {
  const id = String(formData.get("id"));
  const s = await createServerSupabaseClient();
  const { error } = await (s.from("listas") as any).delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/listas");
}

export async function arquivarLista(formData: FormData) {
  const id = String(formData.get("id"));
  const status = String(formData.get("status")) === "arquivada" ? "ativa" : "arquivada";
  const s = await createServerSupabaseClient();
  const { error } = await (s.from("listas") as any).update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/listas");
}

export async function duplicarLista(formData: FormData) {
  const id = String(formData.get("id"));
  const s = await createServerSupabaseClient();

  // Busca lista e itens originais
  const { data: original, error: e1 } = await (s.from("listas") as any)
    .select("*").eq("id", id).single();
  if (e1) throw new Error(e1.message);

  const { data: itens, error: e2 } = await (s.from("lista_itens") as any)
    .select("*").eq("lista_id", id);
  if (e2) throw new Error(e2.message);

  // Insere nova lista
  const { data: novaLista, error: e3 } = await (s.from("listas") as any)
    .insert({ nome: `${original.nome} (cópia)`, descricao: original.descricao, status: "ativa" })
    .select().single();
  if (e3) throw new Error(e3.message);

  // Insere itens na nova lista
  if (itens && itens.length > 0) {
    const novosItens = itens.map((item: any) => ({
      lista_id: novaLista.id,
      nome: item.nome,
      valor: item.valor,
      concluido: false,
    }));
    const { error: e4 } = await (s.from("lista_itens") as any).insert(novosItens);
    if (e4) throw new Error(e4.message);
  }

  revalidatePath("/listas");
}

// ── Itens ─────────────────────────────────────────────────
export async function saveItem(formData: FormData) {
  const id = String(formData.get("id") || "");
  const raw = entries(formData);
  const parsed = itemSchema.safeParse(raw);
  if (!parsed.success) throw new Error(parsed.error.errors[0].message);

  const s = await createServerSupabaseClient();
  const payload = {
    lista_id: parsed.data.lista_id,
    nome: parsed.data.nome,
    descricao: parsed.data.descricao || null,
    valor: parsed.data.valor || null,
  };

  const result = id
    ? await (s.from("lista_itens") as any).update({ nome: payload.nome, descricao: payload.descricao, valor: payload.valor }).eq("id", id)
    : await (s.from("lista_itens") as any).insert(payload);

  if (result.error) throw new Error(result.error.message);
  revalidatePath("/listas");
}

export async function toggleItem(formData: FormData) {
  const id = String(formData.get("id"));
  const concluido = formData.get("concluido") === "true";
  const s = await createServerSupabaseClient();
  const { error } = await (s.from("lista_itens") as any)
    .update({ concluido: !concluido }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/listas");
}

export async function deleteItem(formData: FormData) {
  const id = String(formData.get("id"));
  const s = await createServerSupabaseClient();
  const { error } = await (s.from("lista_itens") as any).delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/listas");
}

export async function editarItem(formData: FormData) {
  const id = String(formData.get("id"));
  const nome = String(formData.get("nome") || "").trim();
  const valor = formData.get("valor");

  if (!nome) throw new Error("Nome do item é obrigatório");

  const s = await createServerSupabaseClient();
  const { error } = await (s.from("lista_itens") as any)
    .update({ nome, valor: valor ? Number(valor) : null })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/listas");
}
