import { createServerSupabaseClient } from "@/lib/supabaseClient";
import type { Cliente } from "@/types/database";
import ClientesBody from "./ClientesBody";

async function getClientes(): Promise<Cliente[]> {
  const s = await createServerSupabaseClient();
  const { data, error } = await (s.from("clientes") as any)
    .select("*")
    .order("nome", { ascending: true });
  if (error) throw error;
  return data || [];
}

export default async function ClientesPage() {
  const clientes = await getClientes();
  const ativos = clientes.filter((c) => c.ativo !== false);
  const inativos = clientes.filter((c) => c.ativo === false);

  return (
    <div className="space-y-6">
      <h1 className="text-[22px] font-semibold text-ink-primary tracking-tight px-1">Clientes</h1>
      <ClientesBody ativos={ativos} inativos={inativos} />
    </div>
  );
}
