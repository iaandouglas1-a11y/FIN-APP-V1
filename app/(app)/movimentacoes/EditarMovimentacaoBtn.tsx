"use client";

import { useState } from "react";
import { Pencil, Copy, X, Check } from "lucide-react";
import { saveMovimentacao } from "@/app/(app)/actions";
import { duplicarMovimentacao } from "@/app/(app)/actions_movimentacoes";
import { FormGroup, Input, Select } from "@/components/ui";

interface Props {
  mov: any;
  categorias: { id: string; nome: string }[];
  contas:     { id: string; nome: string }[];
  cartoes:    { id: string; nome: string }[];
  faturas:    { id: string; data_vencimento: string }[];
}

export default function EditarMovimentacaoBtn({ mov, categorias, contas, cartoes, faturas }: Props) {
  const [modo, setModo] = useState<null | "editar">(null);

  if (!modo) {
    return (
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => setModo("editar")}
          className="p-1.5 text-slate-600 hover:text-[#5DA832] rounded transition-colors"
          title="Editar"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <form action={duplicarMovimentacao}>
          <input type="hidden" name="id" value={mov.id} />
          <button
            type="submit"
            className="p-1.5 text-slate-600 hover:text-[#5DA832] rounded transition-colors"
            title="Duplicar e editar"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    );
  }

  return (
    <div
      className="col-span-full px-4 py-3 bg-[#0D2340]/80 border-t border-[#5DA832]/20"
      onClick={(e) => e.stopPropagation()}
    >
      <form action={saveMovimentacao} className="space-y-2">
        <input type="hidden" name="id" value={mov.id} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <FormGroup label="Tipo">
            <Select name="tipo" defaultValue={mov.tipo} required className="text-sm">
              <option value="despesa">Despesa</option>
              <option value="receita">Receita</option>
            </Select>
          </FormGroup>
          <FormGroup label="Categoria">
            <Select name="categoria_id" defaultValue={mov.categoria_id} required className="text-sm">
              <option value="">Selecione...</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="Valor">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">R$</span>
              <Input name="valor" type="number" step="0.01" defaultValue={mov.valor} required className="pl-8 text-sm font-bold" />
            </div>
          </FormGroup>
          <FormGroup label="Data">
            <Input name="data" type="date" defaultValue={mov.data} required className="text-sm" />
          </FormGroup>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <FormGroup label="Conta">
            <Select name="conta_id" defaultValue={mov.conta_id ?? ""} className="text-sm">
              <option value="">Nenhuma</option>
              {contas.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="Cartão">
            <Select name="cartao_id" defaultValue={mov.cartao_id ?? ""} className="text-sm">
              <option value="">Nenhum</option>
              {cartoes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </Select>
          </FormGroup>
          <FormGroup label="Fatura">
            <Select name="fatura_id" defaultValue={mov.fatura_id ?? ""} className="text-sm">
              <option value="">Nenhuma</option>
              {faturas.map(f => <option key={f.id} value={f.id}>{f.data_vencimento}</option>)}
            </Select>
          </FormGroup>
          <input type="hidden" name="status" value={mov.status ?? "realizado"} />
          <FormGroup label="Descrição">
            <Input name="descricao" defaultValue={mov.descricao ?? ""} placeholder="Descrição..." className="text-sm" />
          </FormGroup>
        </div>
        <div className="flex gap-2">
          <button type="submit"
            className="flex-1 h-9 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#5DA832] hover:bg-[#6fc23b] text-white text-xs font-semibold transition-all">
            <Check className="h-3.5 w-3.5" /> Salvar alterações
          </button>
          <button type="button" onClick={() => setModo(null)}
            className="h-9 px-3 inline-flex items-center justify-center rounded-lg border border-slate-700/40 text-slate-500 hover:text-slate-300 text-xs transition-all">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
