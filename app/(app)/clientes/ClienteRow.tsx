"use client";

import { useState } from "react";
import { Trash2, ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";
import type { Cliente } from "@/types/database";

export default function ClienteRow({
  cliente,
  deleteCliente,
}: {
  cliente: Cliente;
  deleteCliente: (formData: FormData) => Promise<void>;
}) {
  const [aberto, setAberto] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  return (
    <div className="group">
      {/* Linha principal — clicável */}
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/20 transition-colors duration-150 text-left"
      >
        {/* Avatar */}
        <div className="h-8 w-8 rounded-lg bg-[#5DA832]/15 text-[#5DA832] flex items-center justify-center font-bold text-sm shrink-0">
          {cliente.nome.charAt(0).toUpperCase()}
        </div>

        {/* Nome */}
        <span className="flex-1 text-sm font-medium text-slate-200 truncate">
          {cliente.nome}
        </span>

        {/* CNPJ preview */}
        {cliente.cnpj && (
          <span className="text-xs text-slate-500 hidden sm:block shrink-0">
            {cliente.cnpj}
          </span>
        )}

        {/* Chevron */}
        <div className="text-slate-600 shrink-0">
          {aberto ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {/* Detalhes expandidos */}
      {aberto && (
        <div className="px-4 pb-4 bg-[#091829]/40 border-t border-slate-800/30">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">

            {/* CPF */}
            <div className="bg-[#0D2340]/60 rounded-lg p-3 border border-slate-800/40">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">CPF</p>
              <p className="text-sm text-slate-200 font-medium">
                {cliente.cpf || <span className="text-slate-600 italic">Não informado</span>}
              </p>
            </div>

            {/* CNPJ */}
            <div className="bg-[#0D2340]/60 rounded-lg p-3 border border-slate-800/40">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">CNPJ</p>
              <p className="text-sm text-slate-200 font-medium">
                {cliente.cnpj || <span className="text-slate-600 italic">Não informado</span>}
              </p>
            </div>

            {/* Senha Gov */}
            <div className="bg-[#0D2340]/60 rounded-lg p-3 border border-slate-800/40">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Senha Gov</p>
                {cliente.senha_gov && (
                  <button
                    type="button"
                    onClick={() => setMostrarSenha((v) => !v)}
                    className="text-slate-500 hover:text-[#5DA832] transition-colors"
                  >
                    {mostrarSenha
                      ? <EyeOff className="h-3.5 w-3.5" />
                      : <Eye className="h-3.5 w-3.5" />
                    }
                  </button>
                )}
              </div>
              <p className="text-sm text-slate-200 font-medium font-mono tracking-wider">
                {cliente.senha_gov
                  ? mostrarSenha
                    ? cliente.senha_gov
                    : "••••••••"
                  : <span className="text-slate-600 italic font-sans tracking-normal">Não informado</span>
                }
              </p>
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center justify-end mt-3">
            <form action={deleteCliente}>
              <input type="hidden" name="id" value={cliente.id} />
              <button
                type="submit"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg border border-transparent hover:border-rose-500/20 transition-all duration-200"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Excluir cliente
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
