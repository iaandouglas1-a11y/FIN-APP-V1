"use client";

import { useState } from "react";
import { Plus, X, ChevronDown, ChevronUp, Trash2, FolderOpen } from "lucide-react";
import { Card, FormGroup, Input, Select, IconChip, EmptyState } from "@/components/ui";
import { saveCategoria, deleteCategoria } from "@/app/(app)/actions";
import { getCategoryIcon } from "@/lib/categoryIcons";
import type { Categoria } from "@/types/database";

interface Props {
  despesas: Categoria[];
  receitas: Categoria[];
}

/** Uma linha de categoria — mesmo padrão de IconChip + nome + lixeira usado
 * antes, só que agora vive dentro de um grupo (Despesas/Receitas). */
function CategoriaRow({ categoria, tone }: { categoria: Categoria; tone: "green" | "red" }) {
  const Icon = getCategoryIcon(categoria.nome);

  return (
    <div className="flex items-center justify-between px-3.5 py-3 border-t border-surface-border/40 first:border-t-0 hover:bg-surface-2/20 transition group">
      <div className="flex items-center gap-3 min-w-0">
        <IconChip icon={Icon} tone={tone} size={34} iconSize={15} />
        <span className="text-[13.5px] font-medium text-ink-primary truncate">{categoria.nome}</span>
      </div>
      <form action={deleteCategoria}>
        <input type="hidden" name="id" value={categoria.id} />
        <button
          type="submit"
          className="p-1.5 text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Excluir"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}

/** Bloco expansível (Despesas ou Receitas) — mesmo mecanismo de accordion de
 * DividaAccordion.tsx, aplicado a um grupo inteiro em vez de um item único.
 * Cabeçalho em cinza neutro (padrão dos demais módulos): a cor fica só no
 * ícone de cada categoria, não no rótulo do bloco. */
function CategoriaGroup({
  label,
  tone,
  categorias,
  defaultOpen,
}: {
  label: string;
  tone: "green" | "red";
  categorias: Categoria[];
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card className="p-0 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5"
      >
        <span className="text-[10.5px] font-bold uppercase tracking-wide text-ink-secondary">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-[11.5px] text-slate-500">{categorias.length}</span>
          {open ? (
            <ChevronUp className="h-3.5 w-3.5 text-slate-500" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
          )}
        </div>
      </button>

      {open && (
        categorias.length === 0 ? (
          <div className="px-4 pb-4">
            <p className="text-xs text-slate-500">Nenhuma categoria de {label.toLowerCase()} ainda.</p>
          </div>
        ) : (
          <div>
            {categorias.map((cat) => (
              <CategoriaRow key={cat.id} categoria={cat} tone={tone} />
            ))}
          </div>
        )
      )}
    </Card>
  );
}

export default function CategoriasBody({ despesas, receitas }: Props) {
  const [painelAberto, setPainelAberto] = useState(false);

  const total = despesas.length + receitas.length;

  return (
    <div className="space-y-4">
      {/* Botão — Nova categoria (mesmo mecanismo de toggle usado em Honorários) */}
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
        Nova categoria
      </button>

      {painelAberto && (
        <div className="border border-[#5DA832]/30 rounded-xl p-4 bg-[#5DA832]/5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#5DA832] font-bold uppercase text-xs tracking-widest">
              <Plus className="h-4 w-4" />
              <span>Nova categoria</span>
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
              await saveCategoria(formData);
              setPainelAberto(false);
            }}
            className="space-y-2"
          >
            <FormGroup label="Nome">
              <Input name="nome" required placeholder="Ex: Assinaturas" className="text-sm" />
            </FormGroup>

            <FormGroup label="Tipo">
              <Select name="tipo" required defaultValue="" className="text-sm">
                <option value="" disabled>Selecione...</option>
                <option value="despesa">Despesa</option>
                <option value="receita">Receita</option>
              </Select>
            </FormGroup>

            <button
              type="submit"
              className="w-full h-9 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#5DA832] hover:bg-[#6fc23b] text-[#0A0A0A] text-sm font-bold transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </button>
          </form>
        </div>
      )}

      {total === 0 ? (
        <Card className="p-0 overflow-hidden">
          <EmptyState
            icon={<FolderOpen className="h-10 w-10" />}
            title="Nenhuma categoria cadastrada"
            description="Crie sua primeira categoria para organizar suas movimentações"
          />
        </Card>
      ) : (
        <>
          <CategoriaGroup label="Despesas" tone="red" categorias={despesas} defaultOpen />
          <CategoriaGroup label="Receitas" tone="green" categorias={receitas} defaultOpen />
        </>
      )}
    </div>
  );
}
