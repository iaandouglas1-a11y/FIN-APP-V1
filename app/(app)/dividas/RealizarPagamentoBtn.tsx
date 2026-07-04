"use client";

import { useState } from "react";
import { CheckCircle, X } from "lucide-react";
import { realizarPagamento } from "@/app/(app)/actions_dividas";

interface Props {
  pagamentoId:  string;
  descricao:    string;
  valor:        number;
  data:         string;
  contas:       { id: string; nome: string }[];
  categorias:   { id: string; nome: string }[];
  categoriaId:  string | null;
}

export default function RealizarPagamentoBtn({ pagamentoId, descricao, valor, data, contas, categorias, categoriaId }: Props) {
  const [aberto, setAberto] = useState(false);
  const [contaSelecionada, setContaSelecionada] = useState(contas[0]?.id ?? "");
  const [catSelecionada, setCatSelecionada] = useState(categoriaId ?? categorias[0]?.id ?? "");

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-[#5DA832]/15 text-[#5DA832] hover:bg-[#5DA832]/25 border border-[#5DA832]/30 transition-all duration-200"
      >
        <CheckCircle className="h-3 w-3" />
        Realizar
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-[#0D2340] border border-[#5DA832]/40 flex-wrap">
      <select
        value={contaSelecionada}
        onChange={(e) => setContaSelecionada(e.target.value)}
        className="select-modern h-7 text-xs w-28 min-w-0"
      >
        {contas.map((c) => (
          <option key={c.id} value={c.id}>{c.nome}</option>
        ))}
      </select>
      <select
        value={catSelecionada}
        onChange={(e) => setCatSelecionada(e.target.value)}
        className="select-modern h-7 text-xs w-28 min-w-0"
      >
        <option value="">Sem categoria</option>
        {categorias.map((cat) => (
          <option key={cat.id} value={cat.id}>{cat.nome}</option>
        ))}
      </select>
      <form action={realizarPagamento}>
        <input type="hidden" name="id"           value={pagamentoId} />
        <input type="hidden" name="conta_id"     value={contaSelecionada} />
        <input type="hidden" name="categoria_id" value={catSelecionada} />
        <input type="hidden" name="descricao"    value={descricao} />
        <input type="hidden" name="valor"        value={valor} />
        <input type="hidden" name="data"         value={data} />
        <button
          type="submit"
          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#5DA832] hover:bg-[#6fc23b] text-white text-xs font-semibold transition-all duration-200 whitespace-nowrap"
        >
          <CheckCircle className="h-3 w-3" />
          Confirmar
        </button>
      </form>
      <button
        type="button"
        onClick={() => setAberto(false)}
        className="p-1 text-slate-500 hover:text-slate-300 rounded transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
