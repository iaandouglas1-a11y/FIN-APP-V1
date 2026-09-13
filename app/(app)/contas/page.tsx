import { Surface, AmountText } from "@/components/ui";
import { createServerSupabaseClient } from "@/lib/supabase";
import type { Conta, Cartao } from "@/types/database";
import ContasCartoesBody from "./ContasCartoesBody";

export default async function ContasECartoesPage() {
  const supabase = await createServerSupabaseClient();

  const [contasRes, cartoesRes] = await Promise.all([
    supabase.from("contas").select("*").order("nome"),
    supabase.from("cartoes").select("*").order("nome"),
  ]);

  if (contasRes.error) throw contasRes.error;
  if (cartoesRes.error) throw cartoesRes.error;

  const contasRaw = (contasRes.data || []) as Conta[];
  const cartoesRaw = (cartoesRes.data || []) as Cartao[];

  const contas = contasRaw.map((c) => ({
    id: c.id,
    nome: c.nome,
    tipo: "conta" as const,
    logo_url: c.logo_url,
    saldo: Number(c.saldo || 0),
  }));

  const cartoes = cartoesRaw.map((c) => ({
    id: c.id,
    nome: c.nome,
    tipo: "cartao" as const,
    logo_url: c.logo_url,
    saldo: -Number(c.saldo_usado || 0),
    limite: Number(c.limite || 0),
    usado: Number(c.saldo_usado || 0),
    disponivel: Number(c.limite || 0) - Number(c.saldo_usado || 0),
  }));

  const saldoConsolidado = contas.reduce((s, c) => s + c.saldo, 0);

  return (
    <div className="space-y-6">
      <Surface className="p-5">
        <p className="text-sm text-ink-secondary">Saldo consolidado</p>
        <AmountText value={saldoConsolidado} size="lg" />
      </Surface>

      <ContasCartoesBody contas={contas} cartoes={cartoes} />
    </div>
  );
}
