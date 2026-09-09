"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { createConta } from "@/app/(app)/contas/actions_contas";
import { FormGroup, Input } from "@/components/ui";

export default function ContaQuickForm() {
  const [aberto, setAberto] = useState(false);

  return (
    <div className="space-y-2.5">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-[13px] font-semibold border transition-all duration-200 ${
          aberto
            ? "bg-[#5DA832]/15 border-[#5DA832]/40 text-[#6fc23b]"
            : "bg-surface border-surface-border/60 text-ink-secondary hover:text-ink-primary"
        }`}
      >
        <Plus className="h-3.5 w-3.5" />
        Nova conta
      </button>

      {aberto && (
        <div className="border border-[#5DA832]/30 rounded-xl p-4 bg-[#5DA832]/5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#5DA832] font-bold uppercase text-xs tracking-widest">
              <Plus className="h-4 w-4" />
              <span>Nova conta</span>
            </div>
            <button onClick={() => setAberto(false)}>
              <X className="h-4 w-4 text-slate-500 hover:text-slate-300" />
            </button>
          </div>

          <form action={createConta} className="space-y-2">
            <FormGroup label="Nome">
              <Input name="nome" required className="text-sm" />
            </FormGroup>

            <button
              type="submit"
              className="w-full h-9 rounded-lg bg-[#5DA832] hover:bg-[#6fc23b] text-[#06111F] text-sm font-bold"
            >
              Criar conta
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
