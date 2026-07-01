import { getListasComItens } from "@/lib/queries";
import { saveLista, deleteLista, arquivarLista, duplicarLista, saveItem, toggleItem, deleteItem } from "@/app/(app)/actions_listas";
import { Card, Button, Input, Badge, PageHeader, FormGroup, EmptyState } from "@/components/ui";
import { currency } from "@/lib/format";
import {
  ListChecks, Plus, Trash2, Archive, ArchiveRestore,
  Copy, CheckSquare, Square, Inbox, ChevronDown, ChevronUp
} from "lucide-react";

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
        {/* Sidebar: Nova Lista */}
        <aside className="space-y-6">
          <Card className="border-indigo-500/30 bg-gradient-to-br from-indigo-600/10 to-indigo-600/5 relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl" />

            <div className="flex items-center gap-2 mb-6 text-indigo-400 font-bold uppercase text-xs tracking-widest relative z-10">
              <Plus className="h-4 w-4" />
              <span>Nova Lista</span>
            </div>

            <form action={saveLista} className="space-y-4 relative z-10">
              <FormGroup label="Nome da Lista">
                <Input
                  name="nome"
                  placeholder="Ex: Compras Semana, Tarefas Casa..."
                  required
                  className="h-11"
                />
              </FormGroup>
              <FormGroup label="Descrição (opcional)">
                <Input
                  name="descricao"
                  placeholder="Ex: Mercado sábado de manhã"
                  className="h-11"
                />
              </FormGroup>
              <Button type="submit" className="w-full h-11 text-base font-semibold">
                <Plus className="h-4 w-4 mr-2" />
                Criar Lista
              </Button>
            </form>
          </Card>

          {/* Filtro de status */}
          <Card className="border-slate-800/60 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Exibir</p>
            <div className="flex gap-2">
              <a
                href="/listas?status=ativa"
                className={`flex-1 text-center px-3 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                  filtroStatus === "ativa"
                    ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300"
                    : "bg-slate-800/40 border-slate-700/40 text-slate-400 hover:text-slate-200"
                }`}
              >
                Ativas
              </a>
              <a
                href="/listas?status=arquivada"
                className={`flex-1 text-center px-3 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                  filtroStatus === "arquivada"
                    ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300"
                    : "bg-slate-800/40 border-slate-700/40 text-slate-400 hover:text-slate-200"
                }`}
              >
                Arquivadas
              </a>
            </div>
          </Card>
        </aside>

        {/* Main: Listas */}
        <main className="space-y-6">
          {listas.length === 0 ? (
            <Card className="border-slate-800/60">
              <EmptyState
                icon={<Inbox className="h-12 w-12" />}
                title={filtroStatus === "ativa" ? "Nenhuma lista ativa" : "Nenhuma lista arquivada"}
                description={filtroStatus === "ativa" ? "Crie sua primeira lista ao lado" : "Listas arquivadas aparecerão aqui"}
              />
            </Card>
          ) : (
            listas.map((lista) => {
              const itens = lista.lista_itens ?? [];
              const concluidos = itens.filter((i) => i.concluido).length;
              const total = itens.reduce((s, i) => s + (i.valor ? Number(i.valor) : 0), 0);
              const totalConcluido = itens
                .filter((i) => i.concluido)
                .reduce((s, i) => s + (i.valor ? Number(i.valor) : 0), 0);
              const progresso = itens.length > 0 ? Math.round((concluidos / itens.length) * 100) : 0;

              return (
                <Card key={lista.id} className="border-slate-800/60 relative overflow-hidden group p-0">
                  <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-indigo-600/10 blur-3xl group-hover:bg-indigo-600/15 transition-all duration-300" />

                  {/* Header da lista */}
                  <div className="p-6 border-b border-slate-800/40 relative z-10">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <ListChecks className="h-5 w-5 text-indigo-400 shrink-0" />
                          <h2 className="text-lg font-bold text-white truncate">{lista.nome}</h2>
                          {lista.status === "arquivada" && (
                            <Badge variant="warning" className="text-[10px]">Arquivada</Badge>
                          )}
                        </div>
                        {lista.descricao && (
                          <p className="text-sm text-slate-500 ml-8">{lista.descricao}</p>
                        )}
                        {/* Progresso */}
                        {itens.length > 0 && (
                          <div className="ml-8 mt-3">
                            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                              <span>{concluidos} de {itens.length} itens</span>
                              <span>{progresso}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800/60 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full transition-all duration-500"
                                style={{ width: `${progresso}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Ações da lista */}
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Duplicar */}
                        <form action={duplicarLista}>
                          <input type="hidden" name="id" value={lista.id} />
                          <button
                            type="submit"
                            title="Duplicar lista"
                            className="p-2 text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all duration-200"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </form>

                        {/* Arquivar / Restaurar */}
                        <form action={arquivarLista}>
                          <input type="hidden" name="id" value={lista.id} />
                          <input type="hidden" name="status" value={lista.status} />
                          <button
                            type="submit"
                            title={lista.status === "ativa" ? "Arquivar lista" : "Restaurar lista"}
                            className="p-2 text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all duration-200"
                          >
                            {lista.status === "ativa"
                              ? <Archive className="h-4 w-4" />
                              : <ArchiveRestore className="h-4 w-4" />
                            }
                          </button>
                        </form>

                        {/* Deletar */}
                        <form action={deleteLista}>
                          <input type="hidden" name="id" value={lista.id} />
                          <button
                            type="submit"
                            title="Excluir lista"
                            className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>

                  {/* Itens */}
                  <div className="divide-y divide-slate-800/30 relative z-10">
                    {itens.length === 0 ? (
                      <p className="px-6 py-5 text-sm text-slate-600 italic">Nenhum item ainda. Adicione abaixo.</p>
                    ) : (
                      itens.map((item) => (
                        <div
                          key={item.id}
                          className="px-6 py-3 flex items-center gap-3 hover:bg-slate-800/20 transition-all duration-150 group/item"
                        >
                          {/* Toggle concluído */}
                          <form action={toggleItem}>
                            <input type="hidden" name="id" value={item.id} />
                            <input type="hidden" name="concluido" value={String(item.concluido)} />
                            <button
                              type="submit"
                              className={`shrink-0 transition-all duration-200 ${
                                item.concluido ? "text-emerald-400" : "text-slate-600 hover:text-slate-400"
                              }`}
                            >
                              {item.concluido
                                ? <CheckSquare className="h-5 w-5" />
                                : <Square className="h-5 w-5" />
                              }
                            </button>
                          </form>

                          {/* Nome */}
                          <span className={`flex-1 text-sm transition-all duration-200 ${
                            item.concluido ? "line-through text-slate-600" : "text-slate-300"
                          }`}>
                            {item.nome}
                          </span>

                          {/* Valor */}
                          {item.valor != null && (
                            <span className={`text-sm font-semibold shrink-0 ${
                              item.concluido ? "text-slate-600 line-through" : "text-slate-400"
                            }`}>
                              {currency(Number(item.valor))}
                            </span>
                          )}

                          {/* Deletar item */}
                          <form action={deleteItem}>
                            <input type="hidden" name="id" value={item.id} />
                            <button
                              type="submit"
                              className="opacity-0 group-hover/item:opacity-100 p-1 text-slate-600 hover:text-rose-400 rounded transition-all duration-200"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </form>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Rodapé: Total + Adicionar item */}
                  <div className="px-6 py-4 border-t border-slate-800/40 relative z-10 space-y-3">
                    {/* Totais */}
                    {total > 0 && (
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>
                          Concluído: <span className="text-emerald-400 font-semibold">{currency(totalConcluido)}</span>
                        </span>
                        <span>
                          Total: <span className="text-white font-semibold">{currency(total)}</span>
                        </span>
                      </div>
                    )}

                    {/* Adicionar item */}
                    <form action={saveItem} className="flex gap-2">
                      <input type="hidden" name="lista_id" value={lista.id} />
                      <Input
                        name="nome"
                        placeholder="Novo item..."
                        required
                        className="flex-1 h-9 text-sm"
                      />
                      <Input
                        name="valor"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Valor"
                        className="w-24 h-9 text-sm"
                      />
                      <Button type="submit" className="h-9 px-3 text-sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </Card>
              );
            })
          )}
        </main>
      </div>
    </div>
  );
}
