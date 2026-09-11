
"use client";

import { useState } from "react";
import { Plus, X, ListChecks, Pencil, Copy, Trash2, Archive, ArchiveRestore, CheckSquare, Square } from "lucide-react";
import { Card, FormGroup, Input, EmptyState } from "@/components/ui";
import { currency } from "@/lib/format";
import { saveLista, deleteLista, arquivarLista, duplicarLista, saveItem, toggleItem, deleteItem } from "@/app/(app)/actions_listas";
import type { Lista, ListaItem } from "@/types/database";

type ListaComItens = Lista & { lista_itens: ListaItem[] };

export default function ListasBody({
  listasAtivas,
  listasArquivadas,
}: {
  listasAtivas: ListaComItens[];
  listasArquivadas: ListaComItens[];
}) {
  const [painelAberto, setPainelAberto] = useState(false);
  const [aba, setAba] = useState<"ativa" | "arquivada">("ativa");

  const lista = aba === "ativa" ? listasAtivas : listasArquivadas;

  return (
    <>
      {/* Nova lista */}
      <button
        type="button"
        onClick={() => setPainelAberto((v) => !v)}
        className={`w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-[13px] font-semibold border transition-all duration-200 ${
          painelAberto
            ? "bg-[#5DA832]/15 border-[#5DA832]/40 text-[#6fc23b]"
            : "bg-surface border-surface-border/60 text-ink-secondary hover:text-ink-primary"
        }`}
      >
        <Plus className="h-3.5 w-3.5" />
        Nova lista
      </button>

      {painelAberto && (
        <div className="border border-[#5DA832]/30 rounded-xl p-4 bg-[#5DA832]/5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#5DA832] font-bold uppercase text-xs tracking-widest">
              <Plus className="h-4 w-4" />
              <span>Nova lista</span>
            </div>
            <button
              type="button"
              onClick={() => setPainelAberto(false)}
              className="p-1 text-slate-500 hover:text-slate-300 rounded transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form
            action={async (formData) => {
              await saveLista(formData);
              setPainelAberto(false);
            }}
            className="space-y-2"
          >
            <FormGroup label="Nome da lista">
              <Input name="nome" placeholder="Ex: Compras Semana, Tarefas Casa..." required className="text-sm" />
            </FormGroup>
            <FormGroup label="Descrição (opcional)">
              <Input name="descricao" placeholder="Ex: Mercado sábado de manhã" className="text-sm" />
            </FormGroup>

            <button
              type="submit"
              className="w-full h-9 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#5DA832] hover:bg-[#6fc23b] text-[#06111F] text-sm font-bold transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
              Criar lista
            </button>
          </form>
        </div>
      )}

      {/* Toggle */}
      <div className="flex gap-1.5 bg-surface-2/60 rounded-xl p-1">
        <button
          type="button"
          onClick={() => setAba("ativa")}
          className={`flex-1 text-center py-2 rounded-lg text-[12.5px] font-semibold transition-all duration-200 ${
            aba === "ativa" ? "bg-[#5DA832]/20 text-[#6fc23b]" : "text-ink-tertiary hover:text-ink-secondary"
          }`}
        >
          Ativas
        </button>
        <button
          type="button"
          onClick={() => setAba("arquivada")}
          className={`flex-1 text-center py-2 rounded-lg text-[12.5px] font-semibold transition-all duration-200 ${
            aba === "arquivada" ? "bg-[#5DA832]/20 text-[#6fc23b]" : "text-ink-tertiary hover:text-ink-secondary"
          }`}
        >
          Arquivadas
        </button>
      </div>

      <Card className="border-surface-border/60 p-4">
        <div className="mb-4 pb-3 border-b border-surface-border/50">
          <h2 className="text-[15px] font-bold text-white">
            {aba === "ativa" ? "Listas ativas" : "Listas arquivadas"}
          </h2>
          <p className="text-xs text-ink-tertiary mt-1">
            {lista.length} {lista.length === 1 ? "lista" : "listas"}{" "}
            {aba === "ativa" ? "em andamento" : "arquivadas"}
          </p>
        </div>

        <div className="space-y-3">
          {lista.length === 0 ? (
            <EmptyState
              icon={<ListChecks className="h-10 w-10" />}
              title={aba === "ativa" ? "Nenhuma lista ativa" : "Nenhuma lista arquivada"}
            />
          ) : (
            lista.map((l) => <ListaCardExpandida key={l.id} lista={l} />)
          )}
        </div>
      </Card>
    </>
  );
}

function ListaCardExpandida({ lista }: { lista: ListaComItens }) {
  const [aberta, setAberta] = useState(false);
  const [editandoLista, setEditandoLista] = useState(false);
  const [editandoItemId, setEditandoItemId] = useState<string | null>(null);

  const itens = lista.lista_itens ?? [];
  const concluidos = itens.filter((i) => i.concluido).length;
  const total = itens.reduce((s, i) => s + (i.valor ? Number(i.valor) : 0), 0);
  const totalConcluido = itens.filter((i) => i.concluido).reduce((s, i) => s + (i.valor ? Number(i.valor) : 0), 0);
  const progresso = itens.length > 0 ? Math.round((concluidos / itens.length) * 100) : 0;

  return (
    <div className="bg-surface/50 border border-surface-border/40 rounded-lg overflow-hidden">
      {/* Header sempre visível */}
      <button
        type="button"
        onClick={() => setAberta((v) => !v)}
        className="w-full p-4 text-left hover:bg-surface/70 transition-all duration-150"
      >
        <div className="flex items-start gap-3 mb-3">
          <div className="h-5 w-5 text-[#5DA832] shrink-0 mt-0.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-sm truncate">{lista.nome}</h3>
            {lista.descricao && (
              <p className="text-xs text-slate-500 mt-1 truncate">{lista.descricao}</p>
            )}
          </div>
          <svg
            className={`h-4 w-4 text-slate-600 shrink-0 transition-transform duration-200 ${aberta ? "rotate-180" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-surface-2 rounded-lg p-2.5 text-center">
            <p className="text-[10px] text-slate-500 font-semibold mb-1">Progresso</p>
            <p className="text-sm font-bold text-[#6fc23b]">{progresso}%</p>
          </div>
          <div className="bg-surface-2 rounded-lg p-2.5 text-center">
            <p className="text-[10px] text-slate-500 font-semibold mb-1">Itens</p>
            <p className="text-sm font-bold text-white">{concluidos}/{itens.length}</p>
          </div>
          <div className="bg-surface-2 rounded-lg p-2.5 text-center">
            <p className="text-[10px] text-slate-500 font-semibold mb-1">Total</p>
            <p className="text-sm font-bold text-white">
              {total > 0 ? `R$ ${(total / 1000).toFixed(1)}K` : "—"}
            </p>
          </div>
        </div>
      </button>

      {/* Conteúdo expandido */}
      {aberta && (
        <div className="border-t border-surface-border/40">
          {/* Ações da lista */}
          <div className="px-4 py-3 border-b border-surface-border/40 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setEditandoLista(true)}
              title="Editar"
              className="p-1.5 text-slate-600 hover:text-[#6fc23b] hover:bg-[#5DA832]/10 rounded transition-all duration-200"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <form action={duplicarLista} className="inline">
              <input type="hidden" name="id" value={lista.id} />
              <button type="submit" title="Duplicar" className="p-1.5 text-slate-600 hover:text-[#6fc23b] hover:bg-[#5DA832]/10 rounded transition-all duration-200">
                <Copy className="h-3.5 w-3.5" />
              </button>
            </form>
            <form action={arquivarLista} className="inline">
              <input type="hidden" name="id" value={lista.id} />
              <input type="hidden" name="status" value={lista.status} />
              <button type="submit" title={lista.status === "ativa" ? "Arquivar" : "Restaurar"} className="p-1.5 text-slate-600 hover:text-amber-400 hover:bg-amber-500/10 rounded transition-all duration-200">
                {lista.status === "ativa" ? <Archive className="h-3.5 w-3.5" /> : <ArchiveRestore className="h-3.5 w-3.5" />}
              </button>
            </form>
            <form action={deleteLista} className="inline">
              <input type="hidden" name="id" value={lista.id} />
              <button type="submit" title="Excluir" className="p-1.5 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-all duration-200">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>

          {/* Edição da lista */}
          {editandoLista && (
            <form
              action={async (formData) => {
                await saveLista(formData);
                setEditandoLista(false);
              }}
              className="px-4 py-3 border-b border-surface-border/40 space-y-2 bg-[#5DA832]/5"
            >
              <input type="hidden" name="id" value={lista.id} />
              <Input name="nome" defaultValue={lista.nome} required autoFocus className="h-9 text-sm" />
              <Input name="descricao" defaultValue={lista.descricao ?? ""} placeholder="Descrição" className="h-9 text-sm" />
              <div className="flex gap-2">
                <button type="submit" className="h-8 px-3 rounded-lg bg-[#5DA832] hover:bg-[#6fc23b] text-[#06111F] text-xs font-bold">Salvar</button>
                <button type="button" onClick={() => setEditandoLista(false)} className="h-8 px-3 rounded-lg text-slate-400 hover:text-white text-xs font-semibold">Cancelar</button>
              </div>
            </form>
          )}

          {/* Itens */}
          <div className="divide-y divide-surface-border/40">
            {itens.length === 0 ? (
              <p className="px-4 py-4 text-xs text-slate-600 italic">Nenhum item</p>
            ) : (
              itens.map((item) => {
                const editandoEsteItem = editandoItemId === item.id;
                return (
                  <div key={item.id} className="px-4 py-3 flex items-start gap-3 hover:bg-surface/30 transition-all group/item">
                    {editandoEsteItem ? (
                      <form
                        action={async (formData) => {
                          await saveItem(formData);
                          setEditandoItemId(null);
                        }}
                        className="flex-1 space-y-1.5"
                      >
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="lista_id" value={lista.id} />
                        <Input name="nome" defaultValue={item.nome} required autoFocus className="h-8 text-xs" />
                        <Input name="descricao" defaultValue={(item as any).descricao ?? ""} placeholder="Descrição" className="h-8 text-xs" />
                        <div className="flex items-center gap-1">
                          <Input name="valor" type="number" step="0.01" min="0" defaultValue={item.valor != null ? String(item.valor) : ""} placeholder="Valor" className="h-8 text-xs w-24" />
                          <button type="submit" className="h-8 px-2 rounded-lg bg-[#5DA832] hover:bg-[#6fc23b] text-[#06111F] text-xs font-bold">OK</button>
                          <button type="button" onClick={() => setEditandoItemId(null)} className="h-8 px-2 rounded-lg text-slate-400 hover:text-white text-xs font-semibold">Cancela</button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <form action={toggleItem} className="mt-0.5">
                          <input type="hidden" name="id" value={item.id} />
                          <input type="hidden" name="concluido" value={String(item.concluido)} />
                          <button type="submit" className={`shrink-0 transition-all ${item.concluido ? "text-emerald-400" : "text-slate-600 hover:text-slate-400"}`}>
                            {item.concluido ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                          </button>
                        </form>

                        <div className="flex-1 min-w-0">
                          <p className={`text-xs transition-all ${item.concluido ? "line-through text-slate-600" : "text-slate-300"}`}>
                            {item.nome}
                          </p>
                          {(item as any).descricao && (
                            <p className={`text-[10px] mt-0.5 break-words ${item.concluido ? "text-slate-700" : "text-slate-500"}`}>
                              {(item as any).descricao}
                            </p>
                          )}
                        </div>

                        {item.valor != null && (
                          <span className={`text-xs font-semibold shrink-0 ${item.concluido ? "text-slate-600 line-through" : "text-slate-400"}`}>
                            {currency(Number(item.valor))}
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => setEditandoItemId(item.id)}
                          className="opacity-0 group-hover/item:opacity-100 p-1 text-slate-600 hover:text-[#6fc23b] rounded transition-all"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>

                        <form action={deleteItem} className="inline">
                          <input type="hidden" name="id" value={item.id} />
                          <button type="submit" className="opacity-0 group-hover/item:opacity-100 p-1 text-slate-600 hover:text-rose-400 rounded transition-all">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </form>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Rodapé: totais + adicionar item */}
          <div className="px-4 py-3 border-t border-surface-border/40 space-y-3 bg-surface-2/30">
            {total > 0 && (
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Concluído: <span className="text-emerald-400 font-semibold">{currency(totalConcluido)}</span></span>
                <span>Total: <span className="text-white font-semibold">{currency(total)}</span></span>
              </div>
            )}
            <form action={saveItem} className="grid grid-cols-[1fr_auto_auto] gap-1.5 items-end">
              <input type="hidden" name="lista_id" value={lista.id} />
              <div className="space-y-0.5">
                <Input name="nome" placeholder="Novo item..." required className="h-8 text-xs" />
                <Input name="descricao" placeholder="Desc (opt)" className="h-8 text-xs" />
              </div>
              <Input name="valor" type="number" step="0.01" min="0" placeholder="R$" className="w-16 h-8 text-xs" />
              <button type="submit" className="h-8 px-2 bg-[#5DA832] hover:bg-[#6fc23b] text-[#06111F] text-xs font-bold rounded-lg transition-all">
                +
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
