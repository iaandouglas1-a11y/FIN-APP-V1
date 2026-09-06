"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabaseClient";

// ── Schemas ───────────────────────────────────────────────
const dividaSchema = z.object({
  descricao:    z.string().min(2, "Descrição muito curta"),
  valor:        z.coerce.number().positive("Valor deve ser maior que zero"),
  observacao:   z.string().optional().or(z.literal("")),
  data:         z.string().min(10, "Data inválida"),
  situacao:     z.enum(["pendente", "liquidado", "parcial"]).default("pendente"),
  categoria_id: z.string().uuid().optional().or(z.literal("")).transform(v => v || null),
});

const pagamentoSchema = z.object({
  divida_id:    z.string().uuid().optional().or(z.literal("")).transform(v => v || null),
  descricao:    z.string().min(2, "Descrição muito curta"),
  data:         z.string().min(10, "Data inválida"),
  valor:        z.coerce.number().positive("Valor deve ser maior que zero"),
  tipo:         z.enum(["orcado", "realizado"]),
  conta_id:     z.string().uuid().optional().or(z.literal("")).transform(v => v || null),
  categoria_id: z.string().uuid().optional().or(z.literal("")).transform(v => v || null),
});

function entries(f: FormData) { return Object.fromEntries(f.entries()); }

// ── Dívidas ───────────────────────────────────────────────
export async function saveDivida(formData: FormData) {
  const id     = String(formData.get("id") || "");
  const parsed = dividaSchema.safeParse(entries(formData));
  if (!parsed.success) throw new Error(parsed.error.errors[0].message);

  const s = await createServerSupabaseClient();
  const result = id
    ? await (s.from("dividas") as any).update(parsed.data).eq("id", id)
    : await (s.from("dividas") as any).insert(parsed.data);
  if (result.error) throw new Error(result.error.message);
  revalidatePath("/dividas");
}

export async function deleteDivida(formData: FormData) {
  const id = String(formData.get("id"));
  const s  = await createServerSupabaseClient();
  const { error } = await (s.from("dividas") as any).delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dividas");
}

export async function alterarSituacaoDivida(formData: FormData) {
  const id = String(formData.get("id"));
  const atual = String(formData.get("situacao"));
  
  // Ciclo: pendente -> parcial -> liquidado -> pendente
  let novaSituacao: "pendente" | "parcial" | "liquidado" = "pendente";
  if (atual === "pendente") novaSituacao = "parcial";
  else if (atual === "parcial") novaSituacao = "liquidado";
  else novaSituacao = "pendente";

  const s = await createServerSupabaseClient();
  const { error } = await (s.from("dividas") as any).update({ situacao: novaSituacao }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dividas");
  // Removido o retorno para evitar erro de tipagem no formulário (action espera void)
}

// ── Pagamentos ────────────────────────────────────────────
export async function savePagamento(formData: FormData) {
  const id     = String(formData.get("id") || "");
  const parsed = pagamentoSchema.safeParse(entries(formData));
  if (!parsed.success) throw new Error(parsed.error.errors[0].message);

  const s = await createServerSupabaseClient();

  // Se realizado → criar movimentação automaticamente
  let movimentacao_id: string | null = null;
  if (parsed.data.tipo === "realizado" && parsed.data.conta_id) {
    const { data: mov, error: movErr } = await (s.from("movimentacoes") as any)
      .insert({
        tipo:         "despesa",
        valor:        parsed.data.valor,
        data:         parsed.data.data,
        categoria_id: parsed.data.categoria_id,
        conta_id:     parsed.data.conta_id,
        status:       "realizado",
        descricao:    parsed.data.descricao,
      })
      .select("id").single();
    if (movErr) throw new Error(movErr.message);
    movimentacao_id = mov?.id || null;
  }

  const payload = {
    divida_id:      parsed.data.divida_id,
    descricao:      parsed.data.descricao,
    data:           parsed.data.data,
    valor:          parsed.data.valor,
    tipo:           parsed.data.tipo,
    categoria_id:   parsed.data.categoria_id,
    movimentacao_id,
  };

  const result = id
    ? await (s.from("divida_pagamentos") as any).update(payload).eq("id", id)
    : await (s.from("divida_pagamentos") as any).insert(payload);
  if (result.error) throw new Error(result.error.message);

  revalidatePath("/dividas");
  revalidatePath("/movimentacoes");
  revalidatePath("/dashboard");
}

export async function realizarPagamento(formData: FormData) {
  const id          = String(formData.get("id"));
  const conta_id    = String(formData.get("conta_id"));
  const descricao   = String(formData.get("descricao"));
  const valor       = Number(formData.get("valor"));
  const data        = String(formData.get("data"));
  const categoria_id = formData.get("categoria_id") ? String(formData.get("categoria_id")) : null;

  const s = await createServerSupabaseClient();

  // Cria movimentação com a categoria escolhida
  const { data: mov, error: movErr } = await (s.from("movimentacoes") as any)
    .insert({
      tipo: "despesa", valor, data,
      categoria_id, conta_id,
      status: "realizado", descricao,
    })
    .select("id").single();
  if (movErr) throw new Error(movErr.message);

  // Atualiza pagamento
  const { error } = await (s.from("divida_pagamentos") as any)
    .update({ tipo: "realizado", movimentacao_id: mov?.id })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/dividas");
  revalidatePath("/movimentacoes");
  revalidatePath("/dashboard");
}

export async function deletePagamento(formData: FormData) {
  const id = String(formData.get("id"));
  const s  = await createServerSupabaseClient();

  // Deletar movimentação vinculada se existir
  const { data: pag } = await (s.from("divida_pagamentos") as any)
    .select("movimentacao_id").eq("id", id).single();
  if (pag?.movimentacao_id) {
    await (s.from("movimentacoes") as any).delete().eq("id", pag.movimentacao_id);
  }

  const { error } = await (s.from("divida_pagamentos") as any).delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/dividas");
  revalidatePath("/movimentacoes");
}

export async function desfazerPagamento(formData: FormData) {
  const id = String(formData.get("id"));
  const s  = await createServerSupabaseClient();

  // Buscar o pagamento para saber se tem movimentação
  const { data: pag } = await (s.from("divida_pagamentos") as any)
    .select("movimentacao_id, tipo").eq("id", id).single();

  if (!pag) throw new Error("Pagamento não encontrado");

  // Se era realizado e tinha movimentação, deleta a movimentação
  if (pag.movimentacao_id) {
    await (s.from("movimentacoes") as any).delete().eq("id", pag.movimentacao_id);
  }

  if (pag.tipo === "realizado") {
    const { error } = await (s.from("divida_pagamentos") as any)
      .update({ tipo: "orcado", movimentacao_id: null })
      .eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    // Se for orçado, removemos o registro de pagamento (a previsão)
    const { error } = await (s.from("divida_pagamentos") as any).delete().eq("id", id);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/dividas");
  revalidatePath("/movimentacoes");
  revalidatePath("/dashboard");
  // Removido o retorno para evitar erro de tipagem no formulário (action espera void)
}
