import { getCategorias } from "@/lib/queries";
import CategoriasBody from "./CategoriasBody";

export default async function CategoriasPage() {
  const categorias = await getCategorias();

  const despesas = categorias.filter((c) => c.tipo?.toLowerCase() === "despesa");
  const receitas = categorias.filter((c) => c.tipo?.toLowerCase() === "receita");

  return (
    <div className="space-y-6">
      <h1 className="text-[22px] font-bold text-ink-primary tracking-tight px-1">Categorias</h1>
      <CategoriasBody despesas={despesas} receitas={receitas} />
    </div>
  );
}
