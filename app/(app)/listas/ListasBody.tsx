"use client";

import { useState } from "react";
import { Plus, X, ListChecks } from "lucide-react";
import { Card, FormGroup, Input, EmptyState } from "@/components/ui";
import { saveLista } from "@/app/(app)/actions_listas";
import { ListaAccordion } from "./ListaAccordion";
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
      {/* Nova lista — mesmo padrão de "Nova transação" */}
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

      {/* Ativas / Arquivadas — só um bloco visível por vez */}
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
            lista.map((l) => <ListaCard key={l.id} lista={l} />)
          )}
        </div>
      </Card>
    </>
  );
}

function ListaCard({ lista }: { lista: ListaComItens }) {
  const [aberta, setAberta] = useState(false);

  const itens = lista.lista_itens ?? [];
  const concluidos = itens.filter((i) => i.concluido).length;
  const total = itens.reduce((s, i) => s + (i.valor ? Number(i.valor) : 0), 0);
  const progresso = itens.length > 0 ? Math.round((concluidos / itens.length) * 100) : 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setAberta((v) => !v)}
        className="w-full bg-surface/50 border border-surface-border/40 rounded-lg p-4 text-left hover:bg-surface/70 transition-all duration-150"
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

      {aberta && (
        <ListaAccordion lista={lista} />
      )}
    </>
  );
}
