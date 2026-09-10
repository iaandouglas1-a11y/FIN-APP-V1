"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { saveCartao } from "@/app/(app)/actions";
import { FormGroup, Input, Select, Button, Card } from "@/components/ui";

interface Props {
  contas: { id: string; nome: string }[];
}

export default function CartaoQuickInline({ contas }: Props) {
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
        Novo cartão
      </button>

      {aberto && (
        <Card className="border border-[#5DA832]/30 bg-[#5DA832]/5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-[#5DA832] font-bold uppercase text-xs tracking-widest">
              <Plus className="h-4 w-4" />
              <span>Novo cartão</span>
            </div>

            <button
              type="button"
              onClick={() => setAberto(false)}
              className="p-1 text-slate-500 hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form action={saveCartao} className="grid gap-3 md:grid-cols-[1fr_160px_1fr_auto]">
            <FormGroup>
              <Input name="nome" placeholder="Nome do cartão" required className="h-9" />
            </FormGroup>

            <FormGroup>
              <Input
                name="limite"
                type="number"
                step="0.01"
                min="0"
                placeholder="Limite"
                required
                className="h-9"
              />
            </FormGroup>

            <FormGroup>
              <Select name="conta_id" required className="h-9">
                <option value="">Conta de pagamento</option>
                {contas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <div className="flex items-end">
              <Button type="submit" className="h-9 px-5 w-full md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
