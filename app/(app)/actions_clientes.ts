"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabaseClient";

const clienteSchema = z.object({
  nome:      z.string().min(2, "Nome muito curto"),
  cpf:       z.string().optional().or(z.literal("")),
  cnpj:      z.string().optional().or(z.literal("")),
  senha_gov: z.string().optional().or(z.literal("")),
});

function entries(f: FormData) {
  return Object.fromEntries(f.entries());
}

export async function saveCliente(formData: FormData) {
  const id = String(formData.get("id") || "");
  const parsed = clienteSchema.safeParse(entries(formData));
  if (!parsed.success) throw new Error(parsed.error.errors[0].message);

  const payload = {
    nome:      parsed.data.nome,
    cpf:       parsed.data.cpf || null,
    cnpj:      parsed.data.cnpj || null,
    senha_gov: parsed.data.senha_gov || null,
  };

  const s = await createServerSupabaseClient();
  const result = id
    ? await (s.from("clientes") as any).update(payload).eq("id", id)
    : await (s.from("clientes") as any).insert(payload);

  if (result.error) throw new Error(result.error.message);
  revalidatePath("/clientes");
  redirect("/clientes");
}

export async function deleteCliente(formData: FormData) {
  const id = String(formData.get("id"));
  const s = await createServerSupabaseClient();
  const { error } = await (s.from("clientes") as any).delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/clientes");
}
