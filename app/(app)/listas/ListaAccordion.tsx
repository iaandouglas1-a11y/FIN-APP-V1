"use client";

import { useState } from "react";
import { Button, Input, Badge } from "@/components/ui";
import { currency } from "@/lib/format";
import {
  ListChecks, Plus, Trash2, Archive, ArchiveRestore,
  Copy, CheckSquare, Square, ChevronDown, ChevronUp, Pencil
} from "lucide-react";
import type { Lista, ListaItem } from "@/types/database";
import {
  saveLista, deleteLista, arquivarLista, duplicarLista,
  saveItem, toggleItem, deleteItem
} from "@/app/(app)/actions_listas";

type ListaComItens = Lista & { lista_itens: ListaItem[] };

export function ListaAccordion({ lista }: { lista: ListaComItens }) {
  const [aberta, setAberta] = useState(false);
  const [editandoLista, setEditandoLista] = useState(false);
  const [editandoItemId, setEditandoItemId] = useState<string | null>(null);

  const itens = lista.lista_itens ?? [];
  const concluidos = itens.filter((i) => i.concluido).length;
  const total = itens.reduce((s, i) => s + (i.valor ? Number(i.valor) : 0), 0);
  const totalConcluido = itens.filter((i) => i.concluido).reduce((s, i) => s + (i.valor ? Number(i.valor) : 0), 0);
  const progresso = itens.length > 0 ? Math.round((concluidos / itens.length) * 100) : 0;

  return (
    <div className="glass-card border-surface-border/60 relative overflow-hidden group">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#5DA832]/10 blur-3xl group-hover:bg-[#5DA832]/15 transition-all duration-300" />

      {/* Header — clicável para expandir (exceto quando editando o nome/descrição) */}
      <button
        type="button"
        onClick={() => setAberta((v) => !v)}
        className="w-full p-6 flex items-start justify-between gap-4 text-left relative z-10 hover:bg-surface-2/20 transition-all duration-200"
      >
        <div className="flex-1 min-w-0">
          {editandoLista ? (
            <form
              action={async (formData) => {
                await saveLista(formData);
                setEditandoLista(false);
              }}
              onClick={(e) => e.stopPropagation()}
              className="space-y-2 max-w-sm"
            >
              <input type="hidden" name="id" value={lista.id} />
              <Input name="nome" defaultValue={lista.nome} required autoFocus className="h-9 text-sm font-semibold" />
              <Input name="descricao" defaultValue={lista.descricao ?? ""} placeholder="Descrição (opcional)" className="h-9 text-sm" />
              <div className="flex gap-2">
                <button type="submit" className="h-8 px-3 rounded-lg bg-[#5DA832] hover:bg-[#6fc23b] text-[#06111F] text-xs font-bold transition-all duration-200">
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={() => setEditandoLista(false)}
                  className="h-8 px-3 rounded-lg text-slate-400 hover:text-white text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-1">
                <ListChecks className="h-5 w-5 text-[#5DA832] shrink-0" />
                <h2 className="text-lg font-bold text-white truncate">{lista.nome}</h2>
                {lista.status === "arquivada" && (
                  <Badge variant="warning" className="text-[10px]">Arquivada</Badge>
                )}
              </div>
              {lista.descricao && (
                <p className="text-sm text-slate-500 ml-8 break-words">{lista.descricao}</p>
              )}
              {/* Progresso e resumo */}
              <div className="ml-8 mt-3 flex items-center gap-4">
                {itens.length > 0 ? (
                  <>
                    <div className="flex-1 max-w-[200px]">
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                        <span>{concluidos}/{itens.length} itens</span>
                        <span>{progresso}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-2/70 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#5DA832] to-[#6fc23b] rounded-full transition-all duration-500"
                          style={{ width: `${progresso}%` }}
                        />
                      </div>
                    </div>
                    {total > 0 && (
                      <span className="text-xs text-slate-400 font-semibold shrink-0">
                        Total: <span className="text-white">{currency(total)}</span>
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-xs text-slate-600 italic">Nenhum item</span>
                )}
              </div>
            </>
          )}
        </div>

        {!editandoLista && (
          <div className="flex items-center gap-1 shrink-0">
            {/* Ações — stopPropagation para não abrir/fechar o accordion */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setEditandoLista(true); }}
              title="Editar"
              className="p-2 text-slate-500 hover:text-[#5DA832] hover:bg-[#5DA832]/10 rounded-lg transition-all duration-200"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <form action={duplicarLista} onClick={(e) => e.stopPropagation()}>
              <input type="hidden" name="id" value={lista.id} />
              <button type="submit" title="Duplicar" className="p-2 text-slate-500 hover:text-[#5DA832] hover:bg-[#5DA832]/10 rounded-lg transition-all duration-200">
                <Copy className="h-4 w-4" />
              </button>
            </form>
            <form action={arquivarLista} onClick={(e) => e.stopPropagation()}>
              <input type="hidden" name="id" value={lista.id} />
              <input type="hidden" name="status" value={lista.status} />
              <button type="submit" title={lista.status === "ativa" ? "Arquivar" : "Restaurar"} className="p-2 text-slate-500 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-all duration-200">
                {lista.status === "ativa" ? <Archive className="h-4 w-4" /> : <ArchiveRestore className="h-4 w-4" />}
              </button>
            </form>
            <form action={deleteLista} onClick={(e) => e.stopPropagation()}>
              <input type="hidden" name="id" value={lista.id} />
              <button type="submit" title="Excluir" className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all duration-200">
                <Trash2 className="h-4 w-4" />
              </button>
            </form>
            <div className="ml-1 p-2 text-slate-500">
              {aberta ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </div>
        )}
      </button>

      {/* Conteúdo expandido */}
      {aberta && (
        <div className="border-t border-surface-border/40 relative z-10">
          {/* Itens */}
          <div className="divide-y divide-surface-border/40">
            {itens.length === 0 ? (
              <p className="px-6 py-5 text-sm text-slate-600 italic">Nenhum item ainda. Adicione abaixo.</p>
            ) : (
              itens.map((item) => {
                const editandoEsteItem = editandoItemId === item.id;
                return (
                  <div key={item.id} className="px-6 py-3 flex items-start gap-3 hover:bg-surface-2/30 transition-all duration-150 group/item">
                    {editandoEsteItem ? (
                      <form
                        action={async (formData) => {
                          await saveItem(formData);
                          setEditandoItemId(null);
                        }}
                        className="flex-1 min-w-0 space-y-1.5"
                      >
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="lista_id" value={lista.id} />
                        <Input name="nome" defaultValue={item.nome} required autoFocus className="h-8 text-sm" />
                        <Input name="descricao" defaultValue={(item as any).descricao ?? ""} placeholder="Descrição (opcional)" className="h-8 text-sm" />
                        <div className="flex items-center gap-2">
                          <Input
                            name="valor"
                            type="number"
                            step="0.01"
                            min="0"
                            defaultValue={item.valor != null ? String(item.valor) : ""}
                            placeholder="Valor"
                            className="h-8 text-sm w-28"
                          />
                          <button type="submit" className="h-8 px-3 rounded-lg bg-[#5DA832] hover:bg-[#6fc23b] text-[#06111F] text-xs font-bold transition-all duration-200">
                            Salvar
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditandoItemId(null)}
                            className="h-8 px-3 rounded-lg text-slate-400 hover:text-white text-xs font-semibold transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        {/* Toggle */}
                        <form action={toggleItem} className="mt-0.5">
                          <input type="hidden" name="id" value={item.id} />
                          <input type="hidden" name="concluido" value={String(item.concluido)} />
                          <button type="submit" className={`shrink-0 transition-all duration-200 ${item.concluido ? "text-emerald-400" : "text-slate-600 hover:text-slate-400"}`}>
                            {item.concluido ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5" />}
                          </button>
                        </form>

                        {/* Nome + Descrição */}
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm transition-all duration-200 ${item.concluido ? "line-through text-slate-600" : "text-slate-300"}`}>
                            {item.nome}
                          </span>
                          {(item as any).descricao && (() => {
                            const desc = (item as any).descricao as string;
                            const isUrl = desc.startsWith("http://") || desc.startsWith("https://");
                            return isUrl ? (
                              <a href={desc} target="_blank" rel="noopener noreferrer"
                                 title={desc}
                                 className={`text-xs mt-0.5 truncate max-w-full block underline underline-offset-2 transition-colors ${item.concluido ? "text-slate-700" : "text-[#5DA832] hover:text-[#6fc23b]"}`}>
                                {desc}
                              </a>
                            ) : (
                              <p title={desc}
                                 className={`text-xs mt-0.5 truncate max-w-full ${item.concluido ? "text-slate-700" : "text-slate-500"}`}>
                                {desc}
                              </p>
                            );
                          })()}
                        </div>

                        {/* Valor */}
                        {item.valor != null && (
                          <span className={`text-sm font-semibold shrink-0 ${item.concluido ? "text-slate-600 line-through" : "text-slate-400"}`}>
                            {currency(Number(item.valor))}
                          </span>
                        )}

                        {/* Editar item */}
                        <button
                          type="button"
                          onClick={() => setEditandoItemId(item.id)}
                          className="opacity-0 group-hover/item:opacity-100 p-1 text-slate-600 hover:text-[#5DA832] rounded transition-all duration-200"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>

                        {/* Deletar item */}
                        <form action={deleteItem}>
                          <input type="hidden" name="id" value={item.id} />
                          <button type="submit" className="opacity-0 group-hover/item:opacity-100 p-1 text-slate-600 hover:text-rose-400 rounded transition-all duration-200">
                            <Trash2 className="h-3.5 w-3.5" />
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
          <div className="px-6 py-4 border-t border-surface-border/40 space-y-3">
            {total > 0 && (
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Concluído: <span className="text-emerald-400 font-semibold">{currency(totalConcluido)}</span></span>
                <span>Total: <span className="text-white font-semibold">{currency(total)}</span></span>
              </div>
            )}
            <form action={saveItem} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-end">
              <input type="hidden" name="lista_id" value={lista.id} />
              <div className="space-y-1">
                <Input name="nome" placeholder="Novo item..." required className="h-9 text-sm" />
                <Input name="descricao" placeholder="Descrição (opcional)" className="h-9 text-sm" />
              </div>
              <Input name="valor" type="number" step="0.01" min="0" placeholder="Valor" className="w-24 h-9 text-sm" />
              <Button type="submit" className="h-9 px-3 text-sm">
                <Plus className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
