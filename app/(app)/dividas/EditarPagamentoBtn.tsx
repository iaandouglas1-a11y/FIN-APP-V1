"use client";

import { useState } from "react";
import { Pencil, X, Save } from "lucide-react";
import { savePagamento } from "@/app/(app)/actions_dividas";
import { Input, Select, Button, FormGroup } from "@/components/ui";

interface Props {
  pagamento: {
    id: string;
    data: string;
    descricao: string;
    valor: number;
    tipo: "orcado" | "realizado";
    conta_id: string | null;
    categoria_id: string | null;
  };
  contas: { id: string; nome: string }[];
  categorias: { id: string; nome: string }[];
}

export default function EditarPagamentoBtn({ pagamento, contas, categorias }: Props) {
  const [isEditing, setIsEditing] = useState(false);

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="p-1.5 text-slate-600 hover:text-[#5DA832] rounded-lg transition-colors"
        title="Editar"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#0D2340] border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-[#0D2340]/50">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Pencil className="h-4 w-4 text-[#5DA832]" />
            Editar Pagamento
          </h3>
          <button onClick={() => setIsEditing(false)} className="text-slate-500 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form action={savePagamento} className="p-6 space-y-4">
          <input type="hidden" name="id" value={pagamento.id} />
          
          <div className="grid grid-cols-2 gap-4">
            <FormGroup label="Data">
              <Input name="data" type="date" defaultValue={pagamento.data} required className="h-10" />
            </FormGroup>
            <FormGroup label="Valor">
              <Input name="valor" type="number" step="0.01" min="0.01" defaultValue={pagamento.valor} required className="h-10" />
            </FormGroup>
          </div>

          <FormGroup label="Descrição">
            <Input name="descricao" defaultValue={pagamento.descricao} required className="h-10" />
          </FormGroup>

          <div className="grid grid-cols-2 gap-4">
            <FormGroup label="Tipo">
              <Select name="tipo" defaultValue={pagamento.tipo} required className="h-10">
                <option value="orcado">Orçado</option>
                <option value="realizado">Realizado</option>
              </Select>
            </FormGroup>
            <FormGroup label="Conta">
              <Select name="conta_id" defaultValue={pagamento.conta_id || ""} className="h-10">
                <option value="">Nenhuma</option>
                {contas.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </Select>
            </FormGroup>
          </div>

          <FormGroup label="Categoria">
            <Select name="categoria_id" defaultValue={pagamento.categoria_id || ""} className="h-10">
              <option value="">Sem categoria</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.nome}</option>
              ))}
            </Select>
          </FormGroup>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsEditing(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 gap-2">
              <Save className="h-4 w-4" />
              Salvar Alterações
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
