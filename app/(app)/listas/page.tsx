import { getListasComItens } from "@/lib/queries";
import { saveLista } from "@/app/(app)/actions_listas";
import { Card, Button, Input, PageHeader, FormGroup, EmptyState } from "@/components/ui";
import { ListaAccordion } from "./ListaAccordion";
import { Plus, Inbox } from "lucide-react";

export default async function ListasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const filtroStatus = (sp.status as "ativa" | "arquivada") ?? "ativa";
  const listas = await getListasComItens(filtroStatus);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Listas"
        description="Organize listas de compras, tarefas e qualquer outra coisa"
      />

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Sidebar: Nova Lista + Filtro */}
        <aside className="space-y-6">
          <Card className="border-indigo-500/30 bg-gradient-to-br from-indigo-600/10 to-indigo-600/5 relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl" />
            <div className="flex items-center gap-2 mb-6 text-indigo-400 font-bold uppercase text-xs tracking-widest relative z-10">
              <Plus className="h-4 w-4" />
              <span>Nova Lista</span>
            </div>
            <form action={saveLista} className="space-y-4 relative z-10">
              <FormGroup label="Nome da Lista">
                <Input name="nome" placeholder="Ex: Compras Semana, Tarefas Casa..." required className="h-11" />
              </FormGroup>
              <FormGroup label="Descrição (opcional)">
                <Input name="descricao" placeholder="Ex: Mercado sábado de manhã" className="h-11" />
              </FormGroup>
              <Button type="submit" className="w-full h-11 text-base font-semibold">
                <Plus className="h-4 w-4 mr-2" />
                Criar Lista
              </Button>
            </form>
          </Card>

          <Card className="border-slate-800/60 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Exibir</p>
            <div className="flex gap-2">
              <a href="/listas?status=ativa" className={`flex-1 text-center px-3 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 ${filtroStatus === "ativa" ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300" : "bg-slate-800/40 border-slate-700/40 text-slate-400 hover:text-slate-200"}`}>
                Ativas
              </a>
              <a href="/listas?status=arquivada" className={`flex-1 text-center px-3 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 ${filtroStatus === "arquivada" ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300" : "bg-slate-800/40 border-slate-700/40 text-slate-400 hover:text-slate-200"}`}>
                Arquivadas
              </a>
            </div>
          </Card>
        </aside>

        {/* Main: Listas */}
        <main className="space-y-4">
          {listas.length === 0 ? (
            <Card className="border-slate-800/60">
              <EmptyState
                icon={<Inbox className="h-12 w-12" />}
                title={filtroStatus === "ativa" ? "Nenhuma lista ativa" : "Nenhuma lista arquivada"}
                description={filtroStatus === "ativa" ? "Crie sua primeira lista ao lado" : "Listas arquivadas aparecerão aqui"}
              />
            </Card>
          ) : (
            listas.map((lista) => <ListaAccordion key={lista.id} lista={lista} />)
          )}
        </main>
      </div>
    </div>
  );
}
