"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ChevronLeft, Pin, Trash2, Archive, ArchiveRestore,
  Plus, X, Check, Square, CheckSquare,
} from "lucide-react";
import { saveNota, deleteNota, togglePinNota, arquivarNota } from "@/app/(app)/actions_notas";
import { dateBR } from "@/lib/format";
import type { Nota, NotaItem } from "@/types/database";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function NotaEditorBody({ nota }: { nota: Nota }) {
  const [titulo, setTitulo] = useState(nota.titulo);
  const [conteudo, setConteudo] = useState(nota.conteudo);
  const [itens, setItens] = useState<NotaItem[]>(nota.itens ?? []);
  const [novoItem, setNovoItem] = useState("");
  const [sujo, setSujo] = useState(false);
  const [salvando, startTransition] = useTransition();

  function salvar(nextTitulo = titulo, nextConteudo = conteudo, nextItens = itens) {
    const fd = new FormData();
    fd.set("id", nota.id);
    fd.set("titulo", nextTitulo);
    fd.set("conteudo", nextConteudo);
    fd.set("itens", JSON.stringify(nextItens));
    startTransition(async () => {
      await saveNota(fd);
      setSujo(false);
    });
  }

  function adicionarItem() {
    const texto = novoItem.trim();
    if (!texto) return;
    const next = [...itens, { id: uid(), texto, concluido: false }];
    setItens(next);
    setNovoItem("");
    salvar(titulo, conteudo, next);
  }

  function alternarItem(id: string) {
    const next = itens.map((i) => (i.id === id ? { ...i, concluido: !i.concluido } : i));
    setItens(next);
    salvar(titulo, conteudo, next);
  }

  function removerItem(id: string) {
    const next = itens.filter((i) => i.id !== id);
    setItens(next);
    salvar(titulo, conteudo, next);
  }

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Header — voltar + fixar/arquivar/excluir */}
      <div className="flex items-center justify-between">
        <Link
          href="/notas"
          className="flex items-center gap-1 text-[13px] font-semibold text-ink-secondary hover:text-ink-primary transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Notas
        </Link>

        <div className="flex items-center gap-1.5">
          <form action={togglePinNota}>
            <input type="hidden" name="id" value={nota.id} />
            <input type="hidden" name="fixada" value={String(nota.fixada)} />
            <button
              type="submit"
              title={nota.fixada ? "Desafixar" : "Fixar"}
              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                nota.fixada
                  ? "bg-[#5DA832]/15 border-[#5DA832]/35 text-[#6fc23b]"
                  : "bg-surface border-surface-border/50 text-ink-tertiary hover:text-ink-primary"
              }`}
            >
              <Pin className="h-3.5 w-3.5" />
            </button>
          </form>

          <form action={arquivarNota}>
            <input type="hidden" name="id" value={nota.id} />
            <input type="hidden" name="status" value={nota.status} />
            <button
              type="submit"
              title={nota.status === "ativa" ? "Arquivar" : "Restaurar"}
              className="w-8 h-8 rounded-full bg-surface border border-surface-border/50 flex items-center justify-center text-ink-tertiary hover:text-amber-400 transition-colors"
            >
              {nota.status === "ativa" ? <Archive className="h-3.5 w-3.5" /> : <ArchiveRestore className="h-3.5 w-3.5" />}
            </button>
          </form>

          <form action={deleteNota}>
            <input type="hidden" name="id" value={nota.id} />
            <button
              type="submit"
              title="Excluir"
              className="w-8 h-8 rounded-full bg-surface border border-surface-border/50 flex items-center justify-center text-ink-tertiary hover:text-rose-400 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>

      <p className="text-[11px] text-ink-tertiary px-0.5">
        {dateBR((nota.updated_at || nota.created_at)?.slice(0, 10))}
        {salvando && " · salvando..."}
      </p>

      {/* Título */}
      <input
        value={titulo}
        onChange={(e) => { setTitulo(e.target.value); setSujo(true); }}
        onBlur={() => sujo && salvar()}
        placeholder="Título"
        className="w-full bg-transparent text-[19px] font-bold text-white placeholder:text-slate-600 outline-none border-none"
      />

      {/* Conteúdo livre */}
      <textarea
        value={conteudo}
        onChange={(e) => { setConteudo(e.target.value); setSujo(true); }}
        onBlur={() => sujo && salvar()}
        placeholder="Escreva algo..."
        rows={6}
        className="w-full bg-transparent text-[13.5px] text-ink-secondary placeholder:text-slate-600 outline-none border-none resize-none leading-relaxed"
      />

      {/* Checklist */}
      <div className="space-y-0.5">
        {itens.map((item) => (
          <div key={item.id} className="flex items-center gap-2.5 py-1.5 group">
            <button
              type="button"
              onClick={() => alternarItem(item.id)}
              className={item.concluido ? "text-[#5DA832] shrink-0" : "text-slate-600 hover:text-slate-400 shrink-0"}
            >
              {item.concluido ? <CheckSquare className="h-[18px] w-[18px]" /> : <Square className="h-[18px] w-[18px]" />}
            </button>
            <span className={`text-[13.5px] flex-1 ${item.concluido ? "text-slate-500 line-through" : "text-ink-primary"}`}>
              {item.texto}
            </span>
            <button
              type="button"
              onClick={() => removerItem(item.id)}
              className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-400 transition-opacity shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        <div className="flex items-center gap-2.5 py-1.5">
          <Plus className="h-[18px] w-[18px] text-slate-600 shrink-0" />
          <input
            value={novoItem}
            onChange={(e) => setNovoItem(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                adicionarItem();
              }
            }}
            placeholder="Adicionar item"
            className="flex-1 bg-transparent text-[13.5px] text-ink-primary placeholder:text-slate-600 outline-none border-none"
          />
        </div>
      </div>

      <div className="pt-3 border-t border-surface-border/40 flex justify-end">
        <button
          type="button"
          onClick={() => salvar()}
          disabled={!sujo || salvando}
          className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#5DA832] hover:bg-[#6fc23b] disabled:opacity-40 disabled:cursor-not-allowed text-[#0A0A0A] text-xs font-bold transition-all duration-200"
        >
          <Check className="h-3.5 w-3.5" />
          Salvar
        </button>
      </div>
    </div>
  );
}
