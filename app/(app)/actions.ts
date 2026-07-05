"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabaseClient";

// Schemas de Validação
const nullableId = z.string().uuid().optional().or(z.literal("")).transform((v) => v || null);

const movSchema = z.object({ 
  tipo: z.enum(["receita", "despesa"]), 
  valor: z.coerce.number().positive("O valor deve ser maior que zero"), 
  data: z.string().min(10, "Data inválida"), 
  categoria_id: z.string().uuid("Selecione uma categoria"), 
  conta_id: nullableId, 
  cartao_id: nullableId, 
  fatura_id: nullableId, 
  status: z.enum(["previsto", "realizado"]),
  descricao: z.string().optional().or(z.literal(""))
}).refine(
  (v) => v.tipo === "receita" 
    ? !!v.conta_id && !v.cartao_id 
    : !!v.conta_id || !!v.cartao_id, 
  "Receita precisa de conta; despesa precisa de conta ou cartão."
);

const contaSchema = z.object({ 
  nome: z.string().min(2, "Nome muito curto"), 
  tipo: z.enum(["corrente", "poupanca", "investimento", "dinheiro"]) 
});

const cartaoSchema = z.object({ 
  nome: z.string().min(2, "Nome muito curto"), 
  limite: z.coerce.number().nonnegative("Limite inválido"), 
  conta_id: z.string().uuid("Selecione a conta de pagamento") 
});

const faturaSchema = z.object({ 
  cartao_id: z.string().uuid("Selecione o cartão"), 
  data_fechamento: z.string().min(10, "Data de fechamento inválida"), 
  data_vencimento: z.string().min(10, "Data de vencimento inválida"),
  observacao: z.string().optional().or(z.literal("")).transform(v => v || null),
});

// ALTERADO: categoria agora inclui "tipo"
const categoriaSchema = z.object({
  nome: z.string().min(2, "Nome da categoria muito curto"),
  tipo: z.enum(["receita", "despesa"], {
    required_error: "Selecione o tipo da categoria"
  })
});

function entries(formData: FormData) {
  return Object.fromEntries(formData.entries());
}

// --- Movimentações ---
export async function saveMovimentacao(formData: FormData) { 
  const id = String(formData.get("id") || ""); 
  const parsed = movSchema.safeParse(entries(formData)); 
  if (!parsed.success) throw new Error(parsed.error.errors[0].message);

  const s = await createServerSupabaseClient(); 
  const result = id 
    ? await (s.from("movimentacoes") as any).update(parsed.data).eq("id", id) 
    : await (s.from("movimentacoes") as any).insert(parsed.data); 
  
  if (result.error) throw new Error(result.error.message); 
  revalidatePath("/movimentacoes"); 
  revalidatePath("/dashboard"); 
  redirect("/movimentacoes"); 
}

export async function deleteMovimentacao(formData: FormData) { 
  const id = String(formData.get("id")); 
  const s = await createServerSupabaseClient(); 
  const { error } = await (s.from("movimentacoes") as any).delete().eq("id", id); 
  if (error) throw new Error(error.message); 
  revalidatePath("/movimentacoes"); 
  revalidatePath("/dashboard"); 
}

// --- Contas ---
export async function saveConta(formData: FormData) { 
  const id = String(formData.get("id") || ""); 
  const parsed = contaSchema.safeParse(entries(formData)); 
  if (!parsed.success) throw new Error(parsed.error.errors[0].message);

  const s = await createServerSupabaseClient(); 
  const result = id 
    ? await (s.from("contas") as any).update(parsed.data).eq("id", id) 
    : await (s.from("contas") as any).insert(parsed.data); 
  
  if (result.error) throw new Error(result.error.message); 
  revalidatePath("/contas"); 
  redirect("/contas"); 
}

// --- Cartões ---
export async function saveCartao(formData: FormData) { 
  const id = String(formData.get("id") || ""); 
  const parsed = cartaoSchema.safeParse(entries(formData)); 
  if (!parsed.success) throw new Error(parsed.error.errors[0].message);

  const s = await createServerSupabaseClient(); 
  const result = id 
    ? await (s.from("cartoes") as any).update(parsed.data).eq("id", id) 
    : await (s.from("cartoes") as any).insert(parsed.data); 
  
  if (result.error) throw new Error(result.error.message); 
  revalidatePath("/contas/cartoes"); 
  redirect("/contas/cartoes"); 
}

// --- Faturas ---
export async function saveFatura(formData: FormData) { 
  const parsed = faturaSchema.safeParse(entries(formData)); 
  if (!parsed.success) throw new Error(parsed.error.errors[0].message);

  const s = await createServerSupabaseClient(); 
  const { error } = await (s.from("faturas") as any).insert(parsed.data); 
  if (error) throw new Error(error.message); 
  revalidatePath("/faturas"); 
  redirect("/faturas"); 
}

// --- Categorias ---
export async function saveCategoria(formData: FormData) {
  try {
    const parsed = categoriaSchema.safeParse(entries(formData));
    if (!parsed.success) throw new Error(parsed.error.errors[0].message);

    const s = await createServerSupabaseClient();

    const { error } = await (s.from("categorias") as any).insert({
      ...parsed.data,
      tipo: parsed.data.tipo, // garante envio explícito da nova coluna
    });

    if (error) {
      console.error("Erro Supabase:", error);
      throw new Error(`Erro no Banco de Dados: ${error.message}`);
    }

    revalidatePath("/categorias");
    revalidatePath("/movimentacoes");
  } catch (e: any) {
    console.error("Erro completo:", e);

    redirect(`/categorias?error=${encodeURIComponent(e.message)}`);
  }

  redirect("/categorias");
}

export async function deleteCategoria(formData: FormData) {
  const id = String(formData.get("id"));

  const s = await createServerSupabaseClient();

  const { error } = await (s.from("categorias") as any)
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(
      "Não é possível excluir categorias com movimentações vinculadas."
    );
  }

  revalidatePath("/categorias");
}

// --- Pagar Fatura ---
export async function pagarFatura(formData: FormData) {
  const fatura_id  = String(formData.get("fatura_id"));
  const conta_id   = String(formData.get("conta_id"));
  const cartao_id  = String(formData.get("cartao_id"));
  const total      = Number(formData.get("total"));
  const categoria_id = String(formData.get("categoria_id") || "");

  if (!fatura_id || !conta_id || !cartao_id || !total) {
    throw new Error("Dados insuficientes para pagar a fatura.");
  }

  const s = await createServerSupabaseClient();

  // 1. Buscar ou criar categoria "Fatura"
  let catId = categoria_id;
  if (!catId) {
    const { data: existing } = await (s.from("categorias") as any)
      .select("id").eq("nome", "Fatura").limit(1).single();
    if (existing) {
      catId = existing.id;
    } else {
      const { data: nova } = await (s.from("categorias") as any)
        .insert({ nome: "Fatura", tipo: "despesa" }).select("id").single();
      catId = nova?.id || null;
    }
  }

  // 2. Criar movimentação de pagamento da fatura
  // Não vincula fatura_id nem cartao_id para não dobrar o total/limite
  const { error: movError } = await (s.from("movimentacoes") as any).insert({
    tipo:         "despesa",
    valor:        total,
    data:         new Date().toISOString().slice(0, 10),
    categoria_id: catId,
    conta_id:     conta_id,
    cartao_id:    null,
    fatura_id:    null,
    status:       "realizado",
    descricao:    `Pagamento de fatura - ${cartao_id}`,
  });
  if (movError) throw new Error(movError.message);

  // 3. Marcar fatura como paga
  const { error: fatError } = await (s.from("faturas") as any)
    .update({
      pago: true,
      pago_em: new Date().toISOString(),
      conta_pagamento_id: conta_id,
    })
    .eq("id", fatura_id);
  if (fatError) throw new Error(fatError.message);

  revalidatePath("/faturas");
  revalidatePath("/contas/cartoes");
  revalidatePath("/movimentacoes");
  revalidatePath("/dashboard");
  redirect("/faturas");
}

// --- Cancelar Pagamento de Fatura ---
export async function cancelarPagamentoFatura(formData: FormData) {
  const fatura_id  = String(formData.get("fatura_id"));
  const movimentacao_id = String(formData.get("movimentacao_id") || "");

  const s = await createServerSupabaseClient();

  // 1. Deletar a movimentação de pagamento
  // Busca pela descricao que inclui o cartao_id (sem fatura_id pois não vinculamos)
  const { data: faturaData } = await (s.from("faturas") as any)
    .select("cartao_id, conta_pagamento_id")
    .eq("id", fatura_id)
    .single();

  if (movimentacao_id) {
    await (s.from("movimentacoes") as any).delete().eq("id", movimentacao_id);
  } else if (faturaData) {
    await (s.from("movimentacoes") as any)
      .delete()
      .eq("conta_id", faturaData.conta_pagamento_id)
      .eq("descricao", `Pagamento de fatura - ${faturaData.cartao_id}`)
      .eq("status", "realizado");
  }

  // 2. Reverter fatura para não paga
  const { error } = await (s.from("faturas") as any)
    .update({ pago: false, pago_em: null, conta_pagamento_id: null })
    .eq("id", fatura_id);
  if (error) throw new Error(error.message);

  revalidatePath("/faturas");
  revalidatePath("/contas/cartoes");
  revalidatePath("/movimentacoes");
  revalidatePath("/dashboard");
  redirect("/faturas");
}
