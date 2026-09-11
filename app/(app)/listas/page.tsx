import { getListasComItens } from "@/lib/queries";
import ListasBody from "./ListasBody";

export default async function ListasPage() {
  const [listasAtivas, listasArquivadas] = await Promise.all([
    getListasComItens("ativa"),
    getListasComItens("arquivada"),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-[22px] font-bold text-ink-primary tracking-tight px-1">Listas</h1>

      <ListasBody listasAtivas={listasAtivas} listasArquivadas={listasArquivadas} />
    </div>
  );
}
