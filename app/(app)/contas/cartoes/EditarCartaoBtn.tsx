"use client";

import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";
import { saveCartao } from "@/app/(app)/actions";
import { Input, FormGroup, Select } from "@/components/ui";

interface Props {
  id: string;
  nome: string;
  limite: number;
  contaId: string;
  contas: { id: string; nome: string }[];
}

export default function EditarCartaoBtn({ id, nome, limite, contaId, contas }: Props) {
  const [aberto, setAberto] = useState(false);

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-[#5DA832] hover:bg-[#5DA832]/10 border border-transparent hover:border-[#5DA832]/20 transition-all duration-200"
      >
        <Pencil className="h-3.5 w-3.5" />
        Editar cartão
      </button>
    );
  }

  return (
    <form action={saveCartao} className="space-y-2 pt-2 border-t border-surface-border/40">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="conta_id" value={contaId} />

      <div className="grid grid-cols-2 gap-2">
        <FormGroup label="Nome">
          <Input name="nome" defaultValue={nome} required className="h-9 text-sm" />
        </FormGroup>
        <FormGroup label="Limite">
          <Input name="limite" type="number" step="0.01" defaultValue={limite} required className="h-9 text-sm" />
        </FormGroup>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 h-9 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#5DA832] hover:bg-[#6fc23b] text-white text-xs font-semibold transition-all duration-200"
        >
          <Check className="h-3.5 w-3.5" />
          Salvar
        </button>
        <button
          type="button"
          onClick={() => setAberto(false)}
          className="h-9 px-3 inline-flex items-center justify-center rounded-lg border border-surface-border/40 text-slate-500 hover:text-slate-300 text-xs transition-all duration-200"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </form>
  );
}
