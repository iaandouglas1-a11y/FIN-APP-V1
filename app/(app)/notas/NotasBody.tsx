"use client";

import { useMemo, useState } from "react";
import { Plus, StickyNote, ListChecks } from "lucide-react";
import { Card, EmptyState, ListGroup, ListRow } from "@/components/ui";
import { dateBR } from "@/lib/format";
import { criarNota } from "@/app/(app)/actions_notas";
import type { Nota } from "@/types/database";

type Aba = "todas" | "fixadas" | "arquivadas";

const ABAS: { key: Aba; label: string }[] = [
  { key: "todas", label: "Todas" },
  { key: "fixadas", label: "Fixadas" },
  { key: "arquivadas", label: "Arquivadas" },
];

export default function NotasBody({ notas }: { notas: Nota[] }) {
  const [aba, setAba] = useState<Aba>("todas");

  const lista = useMemo(() => {
    if (aba === "fixadas") return notas.filter((n) => n.fixada && n.status === "ativa");
    if (aba === "arquivadas") return notas.filter((n) => n.status === "arquivada");
    return notas.filter((n) => n.status === "ativa");
  }, [notas, aba]);

  return (
    <>
      {/* Nova nota — cria em branco e já abre a tela de edição */}
      <form action={criarNota}>
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-[13px] font-semibold border bg-surface border-surface-border/60 text-ink-secondary hover:text-ink-primary transition-all duration-200"
        >
          <Plus className="h-3.5 w-3.5" />
          Nova nota
        </button>
      </form>

      {/* Toggle Todas/Fixadas/Arquivadas */}
      <div className="flex gap-1.5 bg-surface-2/60 rounded-xl p-1">
        {ABAS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => setAba(opt.key)}
            className={`flex-1 text-center py-2 rounded-lg text-[12.5px] font-semibold transition-all duration-200 ${
              aba === opt.key ? "bg-[#5DA832]/20 text-[#6fc23b]" : "text-ink-tertiary hover:text-ink-secondary"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <Card className="border-surface-border/60 p-4">
        <div className="mb-4 pb-3 border-b border-surface-border/50">
          <h2 className="text-[15px] font-bold text-white">
            {aba === "todas" ? "Todas as notas" : aba === "fixadas" ? "Notas fixadas" : "Notas arquivadas"}
          </h2>
          <p className="text-xs text-ink-tertiary mt-1">
            {lista.length} {lista.length === 1 ? "nota" : "notas"}
          </p>
        </div>

        {lista.length === 0 ? (
          <EmptyState icon={<StickyNote className="h-10 w-10" />} title="Nenhuma nota por aqui" />
        ) : (
          <ListGroup className="rounded-lg divide-y divide-surface-border/40">
            {lista.map((n) => {
              const concluidos = n.itens.filter((i) => i.concluido).length;
              const subtitle =
                n.itens.length > 0
                  ? `${concluidos} de ${n.itens.length} itens concluídos`
                  : n.conteudo?.trim() || "Sem conteúdo";
              return (
                <ListRow
                  key={n.id}
                  href={`/notas/${n.id}`}
                  icon={n.itens.length > 0 ? ListChecks : StickyNote}
                  tone={n.fixada ? "green" : "gray"}
                  title={n.titulo?.trim() || "Nova nota"}
                  subtitle={subtitle}
                  right={
                    <span className="text-[10px] text-ink-tertiary shrink-0">
                      {dateBR((n.updated_at || n.created_at)?.slice(0, 10))}
                    </span>
                  }
                  chevron
                />
              );
            })}
          </ListGroup>
        )}
      </Card>
    </>
  );
}
