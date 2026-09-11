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
            lista.map((l) => <ListaAccordion key={l.id} lista={l} />)
          )}
        </div>
      </Card>
    </>
  );
}
