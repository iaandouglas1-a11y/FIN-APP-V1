"use client";

import { useState } from "react";
import { Receipt, ChevronDown, ChevronUp } from "lucide-react";
import { currency, dateBR } from "@/lib/format";

type Props = {
  faturaId: string;
  cartaoId: string;
  cartaoNome: string;
  cartaoLogo?: string | null;
  dataFechamento: string;
  dataVencimento: string;
  pago: boolean;
  pagoEm?: string | null;
  observacao?: string | null;
  total: number;
  isOverdue: boolean;
  isDue: boolean;
  expenses: any[];
  contas: { id: string; nome: string }[];
};

export default function FaturaAccordion({
  cartaoNome,
  cartaoLogo,
  dataFechamento,
  dataVencimento,
  pago,
  observacao,
  total,
  isOverdue,
  isDue,
  expenses,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-slate-800/60 bg-slate-900/40 overflow-hidden">
      
      {/* HEADER */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-800/30 transition"
      >
        <div className="flex items-center gap-4">
          
          {/* 🔥 LOGO OU ÍCONE */}
          <div
            className={`h-10 w-10 rounded-lg overflow-hidden ${
              cartaoLogo
                ? ""
                : "bg-gradient-to-br from-[#5DA832]/30 to-[#5DA832]/10 flex items-center justify-center"
            }`}
          >
            {cartaoLogo ? (
              <img
                src={cartaoLogo ?? ""}
                alt={cartaoNome}
                className="h-full w-full object-cover"
              />
            ) : (
              <Receipt className="h-5 w-5 text-[#5DA832]" />
            )}
          </div>

          {/* INFO */}
          <div className="text-left">
            <p className="text-sm font-semibold text-slate-200">
              {cartaoNome}
            </p>
            <p className="text-xs text-slate-500">
              Fechamento: {dateBR(dataFechamento)} • Vencimento:{" "}
              {dateBR(dataVencimento)}
            </p>
          </div>
        </div>

        {/* STATUS + VALOR */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p
              className={`text-sm font-bold ${
                pago
                  ? "text-emerald-400"
                  : isOverdue
                  ? "text-rose-400"
                  : isDue
                  ? "text-amber-400"
                  : "text-slate-200"
              }`}
            >
              {currency(total)}
            </p>
            <p className="text-xs text-slate-500">
              {pago ? "Pago" : isOverdue ? "Atrasado" : isDue ? "A vencer" : "Aberto"}
            </p>
          </div>

          {open ? (
            <ChevronUp className="h-4 w-4 text-slate-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-500" />
          )}
        </div>
      </button>

      {/* BODY */}
      {open && (
        <div className="px-5 pb-5 border-t border-slate-800/40 space-y-4">
          
          {/* OBSERVAÇÃO */}
          {observacao && (
            <p className="text-sm text-slate-400 italic">
              {observacao}
            </p>
          )}

          {/* LISTA DE DESPESAS */}
          {expenses.length === 0 ? (
            <p className="text-sm text-slate-600 italic">
              Nenhuma movimentação nesta fatura.
            </p>
          ) : (
            <div className="space-y-2">
              {expenses.map((exp) => (
                <div
                  key={exp.id}
                  className="flex items-center justify-between text-sm bg-slate-800/30 px-3 py-2 rounded-md"
                >
                  <span className="text-slate-300">
                    {exp.descricao ?? "Despesa"}
                  </span>
                  <span className="text-slate-200 font-semibold">
                    {currency(exp.valor)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}