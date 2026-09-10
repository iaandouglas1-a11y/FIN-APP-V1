"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, X, Wallet, CreditCard } from "lucide-react";
import { Card, EntityLogo, AmountText, EmptyState, ProgressBar } from "@/components/ui";
import type { IconTone } from "@/components/ui";
import { currency } from "@/lib/format";
import { FinancialQuickInline } from "./FinancialQuickInline";
import { EditarFinancialForm } from "./EditarFinancialForm";

type Item = {
  id: string;
  nome: string;
  tipo: "conta" | "cartao";
  logo_url?: string | null;
  saldo: number;
  limite?: number;
  usado?: number;
  disponivel?: number;
};

type Tone = "green" | "red" | "amber" | "neutral";

// Contas: saldo 0 → neutral · negativo → red · positivo → green
function contaTone(saldo: number): { icon: IconTone; text: Tone } {
  if (saldo === 0) return { icon: "gray", text: "neutral" };
  return saldo > 0 ? { icon: "green", text: "green" } : { icon: "red", text: "red" };
}

// Cartões: nada usado → green · consumido até 50% → neutral · acima de 50% → red
function cartaoTone(usado: number, limite: number): { icon: IconTone; text: Tone; barColor: string } {
  if (usado <= 0) return { icon: "green", text: "green", barColor: "#5DA832" };
  const pct = limite > 0 ? (usado / limite) * 100 : 0;
  if (pct > 50) return { icon: "red", text: "red", barColor: "#f87171" };
  return { icon: "gray", text: "neutral", barColor: "#94A3B8" };
}

export default function ContasCartoesBody({ contas, cartoes }: { contas: Item[]; cartoes: Item[] }) {
  const router = useRouter();
  const [painelAberto, setPainelAberto] = useState<null | "editar" | "adicionar">(null);

  const todosItens = [...contas, ...cartoes];

  return (
    <>
      {/* Ações do topo — mesmo padrão visual de "Nova transação" / "Transferência" */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setPainelAberto((v) => (v === "editar" ? null : "editar"))}
          className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-[13px] font-semibold border transition-all duration-200 ${
            painelAberto === "editar"
              ? "bg-[#5DA832]/15 border-[#5DA832]/40 text-[#6fc23b]"
              : "bg-surface border-surface-border/60 text-ink-secondary hover:text-ink-primary"
          }`}
        >
          <Pencil className="h-3.5 w-3.5" />
          Editar
        </button>
        <button
          type="button"
          onClick={() => setPainelAberto((v) => (v === "adicionar" ? null : "adicionar"))}
          className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-[13px] font-semibold border transition-all duration-200 ${
            painelAberto === "adicionar"
              ? "bg-info/15 border-info/40 text-[#60a5fa]"
              : "bg-surface border-surface-border/60 text-ink-secondary hover:text-ink-primary"
          }`}
        >
          <Plus className="h-3.5 w-3.5" />
          Adicionar conta
        </button>
      </div>

      {/* Painel: Editar conta ou cartão */}
      {painelAberto === "editar" && (
        <EditarFinancialForm
          items={todosItens}
          onClose={() => setPainelAberto(null)}
          onSaved={() => {
            setPainelAberto(null);
            router.refresh();
          }}
        />
      )}

      {/* Painel: Adicionar conta */}
      {painelAberto === "adicionar" && (
        <div className="border border-[#5DA832]/30 rounded-xl p-4 bg-[#5DA832]/5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#5DA832] font-bold uppercase text-xs tracking-widest">
              <Plus className="h-4 w-4" />
              <span>Nova conta ou cartão</span>
            </div>
            <button
              type="button"
              onClick={() => setPainelAberto(null)}
              className="p-1 text-slate-500 hover:text-slate-300 rounded transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <FinancialQuickInline
            onCreated={() => {
              setPainelAberto(null);
              router.refresh();
            }}
          />
        </div>
      )}

      {/* Contas */}
      <Card className="p-0 overflow-hidden border-surface-border/60">
        <div className="px-4 pt-4 pb-3 mb-1 border-b border-surface-border/40">
          <h2 className="text-[15px] font-bold text-white">Contas</h2>
          <p className="text-xs text-ink-tertiary mt-1">
            {contas.length} {contas.length === 1 ? "conta cadastrada" : "contas cadastradas"}
          </p>
        </div>

        {contas.length === 0 ? (
          <EmptyState icon={<Wallet className="h-10 w-10" />} title="Nenhuma conta cadastrada" />
        ) : (
          <div className="divide-y divide-surface-border/40">
            {contas.map((c) => {
              const tone = contaTone(c.saldo);
              return (
                <div key={c.id} className="p-4 flex items-center gap-3">
                  <EntityLogo src={c.logo_url} icon={Wallet} tone={tone.icon} size={48} iconSize={22} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-white text-sm truncate">{c.nome}</p>
                    <p className="text-xs text-slate-500">Conta</p>
                  </div>
                  <AmountText value={c.saldo} tone={tone.text} className="shrink-0" />
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Cartões */}
      <Card className="p-0 overflow-hidden border-surface-border/60">
        <div className="px-4 pt-4 pb-3 mb-1 border-b border-surface-border/40">
          <h2 className="text-[15px] font-bold text-white">Cartões</h2>
          <p className="text-xs text-ink-tertiary mt-1">
            {cartoes.length} {cartoes.length === 1 ? "cartão cadastrado" : "cartões cadastrados"}
          </p>
        </div>

        {cartoes.length === 0 ? (
          <EmptyState icon={<CreditCard className="h-10 w-10" />} title="Nenhum cartão cadastrado" />
        ) : (
          <div className="divide-y divide-surface-border/40">
            {cartoes.map((c) => {
              const limite = c.limite ?? 0;
              const usado = c.usado ?? 0;
              const pct = limite > 0 ? (usado / limite) * 100 : 0;
              const tone = cartaoTone(usado, limite);
              return (
                <div key={c.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <EntityLogo src={c.logo_url} icon={CreditCard} tone={tone.icon} size={48} iconSize={22} />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white text-sm truncate">{c.nome}</p>
                      <p className="text-xs text-slate-500">
                        {currency(usado)} de {currency(limite)}
                      </p>
                    </div>
                    <AmountText value={c.disponivel ?? 0} tone={tone.text} className="shrink-0" />
                  </div>
                  <ProgressBar pct={pct} color={tone.barColor} />
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </>
  );
}
