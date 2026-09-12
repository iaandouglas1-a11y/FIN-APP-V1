"use client";

import { useState } from "react";
import { Plus, X, User, Pencil, Trash2 } from "lucide-react";
import { Card, FormGroup, Input, Select } from "@/components/ui";
import { currency } from "@/lib/format";
import { saveHonorario, deleteHonorario } from "@/app/(app)/actions_honorarios";
import PagarHonorarioBtn from "./PagarHonorarioBtn";
import EditarHonorarioBtn from "./EditarHonorarioBtn";

type Props = {
  totalMes: number;
  recebidoMes: number;
  pendenteMes: number;
  totalAtrasado: number;
  clientes: { id: string; nome: string }[];
  honorarios: any[];
  mesAtualValue: string;
};

export default function HonorariosBody({
  totalMes,
  recebidoMes,
  pendenteMes,
  totalAtrasado,
  clientes,
  honorarios,
  mesAtualValue,
}: Props) {
  const [painelAberto, setPainelAberto] = useState(false);

  return (
    <>
      {/* Métricas — 2x2 grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface/50 border border-surface-border/40 rounded-lg p-3.5">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Total do mês</p>
          <p className="text-lg font-bold text-white">{currency(totalMes)}</p>
        </div>
        <div className="bg-surface/50 border border-surface-border/40 rounded-lg p-3.5">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Recebido</p>
          <p className="text-lg font-bold text-emerald-400">{currency(recebidoMes)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-surface/50 border border-surface-border/40 rounded-lg p-3.5">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Pendente</p>
          <p className="text-lg font-bold text-amber-400">{currency(pendenteMes)}</p>
        </div>
        <div className="bg-surface/50 border border-surface-border/40 rounded-lg p-3.5">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Atrasado</p>
          <p className="text-lg font-bold text-rose-400">{currency(totalAtrasado)}</p>
        </div>
      </div>

      {/* Botão — Lançar Honorário */}
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
        Lançar honorário
      </button>

      {painelAberto && (
        <div className="border border-[#5DA832]/30 rounded-xl p-4 bg-[#5DA832]/5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#5DA832] font-bold uppercase text-xs tracking-widest">
              <Plus className="h-4 w-4" />
              <span>Lançar honorário</span>
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
              await saveHonorario(formData);
              setPainelAberto(false);
            }}
            className="space-y-2"
          >
            <FormGroup label="Cliente">
              <Select name="cliente_id" required className="text-sm">
                <option value="">Selecione...</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <div className="grid grid-cols-2 gap-2">
              <FormGroup label="Competência">
                <Select name="competencia" required defaultValue={mesAtualValue} className="text-sm">
                  {Array.from({ length: 12 }, (_, i) => {
                    const d = new Date();
                    d.setMonth(i);
                    const val = `${new Date().getFullYear()}-${String(i + 1).padStart(2, "0")}`;
                    const label = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
                    return (
                      <option key={val} value={val}>
                        {label}
                      </option>
                    );
                  })}
                </Select>
              </FormGroup>
              <FormGroup label="Valor">
                <Input name="valor" type="number" step="0.01" min="0" required placeholder="0,00" className="text-sm" />
              </FormGroup>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <FormGroup label="Vencimento">
                <Input name="vencimento" type="date" required className="text-sm" />
              </FormGroup>
              <FormGroup label="Observação (opcional)">
                <Input name="observacao" placeholder="Ex: Honorário contábil..." className="text-sm" />
              </FormGroup>
            </div>

            <button
              type="submit"
              className="w-full h-9 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#5DA832] hover:bg-[#6fc23b] text-[#06111F] text-sm font-bold transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
              Lançar
            </button>
          </form>
        </div>
      )}

      {/* Honorários Lançados */}
      <Card className="border-surface-border/60 p-4">
        <div className="mb-4 pb-3 border-b border-surface-border/50 flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-bold text-white">Honorários Lançados</h2>
            <p className="text-xs text-ink-tertiary mt-1">{honorarios.length} lançamentos</p>
          </div>
          <span className="text-xs font-semibold border border-[#5DA832]/40 bg-[#5DA832]/10 text-[#6fc23b] px-2.5 py-1 rounded-full">
            {honorarios.length} lançamentos
          </span>
        </div>

        <div className="space-y-2.5">
          {honorarios.length === 0 ? (
            <p className="text-center py-6 text-sm text-slate-600 italic">Nenhum honorário lançado.</p>
          ) : (
            honorarios.map((h) => {
              const statusColors = {
                pago: { bg: "bg-emerald-500/15", text: "text-emerald-400", label: "✓ Pago" },
                pendente: { bg: "bg-amber-500/15", text: "text-amber-400", label: "Pendente" },
                atrasado: { bg: "bg-rose-500/15", text: "text-rose-400", label: "Atrasado" },
              };
              const s = statusColors[h.status as keyof typeof statusColors];

              return (
                <div key={h.id} className="bg-surface/50 border border-surface-border/40 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-2">
                    <div className={`h-10 w-10 rounded-lg ${s.bg} flex items-center justify-center shrink-0 ${s.text}`}>
                      <User className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white text-sm">{h.clienteNome}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-slate-500">{h.competenciaLabel}</span>
                        <span className={`text-xs px-2 py-0.5 rounded font-semibold ${s.bg} ${s.text}`}>
                          {s.label}
                        </span>
                      </div>
                      {h.observacao && (
                        <p className="text-xs text-slate-500 mt-1">{h.observacao}</p>
                      )}
                    </div>
                    <p className="text-sm font-bold text-white shrink-0">{currency(Number(h.valor))}</p>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-surface-border/30">
                    {h.status !== "pago" && (
                      <PagarHonorarioBtn honorarioId={h.id} />
                    )}
                    <EditarHonorarioBtn honorarioId={h.id} />
                    <form action={deleteHonorario} className="inline">
                      <input type="hidden" name="id" value={h.id} />
                      <button
                        type="submit"
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Excluir
                      </button>
                    </form>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </>
  );
}
