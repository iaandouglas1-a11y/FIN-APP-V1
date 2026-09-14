"use client";

import { useState, useMemo } from "react";
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
  contas?: { id: string; nome: string }[];
};

export default function HonorariosBody({
  totalMes,
  recebidoMes,
  pendenteMes,
  totalAtrasado,
  clientes,
  honorarios,
  mesAtualValue,
  contas = [],
}: Props) {
  const [painelAberto, setPainelAberto] = useState(false);
  const [filtroData, setFiltroData] = useState<"este_mes" | "mes_anterior" | "3_meses" | "personalizado">("este_mes");
  const [dataInicio, setDataInicio] = useState<string>("");
  const [dataFim, setDataFim] = useState<string>("");

  // Filtro de datas
  const hoje = new Date();
  const honorariosFiltrados = useMemo(() => {
    if (honorarios.length === 0) return [];

    let dtInicio: Date;
    let dtFim: Date;

    if (filtroData === "este_mes") {
      dtInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      dtFim = hoje;
    } else if (filtroData === "mes_anterior") {
      dtInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
      dtFim = new Date(hoje.getFullYear(), hoje.getMonth(), 0);
    } else if (filtroData === "3_meses") {
      dtInicio = new Date(hoje.getFullYear(), hoje.getMonth() - 3, 1);
      dtFim = hoje;
    } else {
      // Personalizado
      if (!dataInicio || !dataFim) return [];
      dtInicio = new Date(dataInicio);
      dtFim = new Date(dataFim);
    }

    return honorarios.filter((h) => {
      const dataHonorario = new Date(h.vencimento);
      return dataHonorario >= dtInicio && dataHonorario <= dtFim;
    });
  }, [honorarios, filtroData, dataInicio, dataFim, hoje]);

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
              className="w-full h-9 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#5DA832] hover:bg-[#6fc23b] text-[#0A0A0A] text-sm font-bold transition-all duration-200"
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
            <p className="text-xs text-ink-tertiary mt-1">{honorariosFiltrados.length} lançamentos</p>
          </div>
          <span className="text-xs font-semibold border border-[#5DA832]/40 bg-[#5DA832]/10 text-[#6fc23b] px-2.5 py-1 rounded-full">
            {honorariosFiltrados.length} lançamentos
          </span>
        </div>

        {/* Filtro de datas */}
        <div className="mb-4 pb-3 border-b border-surface-border/40 space-y-3">
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setFiltroData("este_mes")}
              className={`shrink-0 text-center px-3 py-1.5 rounded-full text-[11.5px] font-semibold transition-all duration-200 border whitespace-nowrap ${
                filtroData === "este_mes"
                  ? "bg-[#5DA832]/15 border-[#5DA832]/35 text-[#6fc23b]"
                  : "bg-transparent border-surface-border/50 text-ink-tertiary hover:text-ink-secondary hover:bg-surface-2/40"
              }`}
            >
              Este mês
            </button>
            <button
              type="button"
              onClick={() => setFiltroData("mes_anterior")}
              className={`shrink-0 text-center px-3 py-1.5 rounded-full text-[11.5px] font-semibold transition-all duration-200 border whitespace-nowrap ${
                filtroData === "mes_anterior"
                  ? "bg-[#5DA832]/15 border-[#5DA832]/35 text-[#6fc23b]"
                  : "bg-transparent border-surface-border/50 text-ink-tertiary hover:text-ink-secondary hover:bg-surface-2/40"
              }`}
            >
              Mês anterior
            </button>
            <button
              type="button"
              onClick={() => setFiltroData("3_meses")}
              className={`shrink-0 text-center px-3 py-1.5 rounded-full text-[11.5px] font-semibold transition-all duration-200 border whitespace-nowrap ${
                filtroData === "3_meses"
                  ? "bg-[#5DA832]/15 border-[#5DA832]/35 text-[#6fc23b]"
                  : "bg-transparent border-surface-border/50 text-ink-tertiary hover:text-ink-secondary hover:bg-surface-2/40"
              }`}
            >
              3 meses
            </button>
            <button
              type="button"
              onClick={() => setFiltroData("personalizado")}
              className={`shrink-0 flex items-center justify-center h-7 w-7 rounded-full text-[11.5px] font-semibold transition-all duration-200 border ${
                filtroData === "personalizado"
                  ? "bg-[#5DA832]/15 border-[#5DA832]/35 text-[#6fc23b]"
                  : "bg-transparent border-surface-border/50 text-ink-tertiary hover:text-ink-secondary hover:bg-surface-2/40"
              }`}
              title="Filtro personalizado"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2H3V6M7 12h10M5 18h14" />
              </svg>
            </button>
          </div>

          {/* Inputs de intervalo — só aparecem quando "Personalizado" tá ativo */}
          {filtroData === "personalizado" && (
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">De</label>
                <input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="w-full h-8 px-2 rounded-lg bg-surface border border-surface-border/40 text-white text-xs"
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Até</label>
                <input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="w-full h-8 px-2 rounded-lg bg-surface border border-surface-border/40 text-white text-xs"
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2.5">
          {honorariosFiltrados.length === 0 ? (
            <p className="text-center py-6 text-sm text-slate-600 italic">Nenhum honorário neste período.</p>
          ) : (
            honorariosFiltrados.map((h) => {
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
                      <PagarHonorarioBtn
                        honorarioId={h.id}
                        clienteNome={h.clienteNome}
                        valor={Number(h.valor)}
                        pago={h.pago}
                        pagoEm={h.pago_em || null}
                        contas={contas}
                      />
                    )}
                    <EditarHonorarioBtn
                      honorario={{
                        id: h.id,
                        cliente_id: h.cliente_id,
                        competencia: h.competencia,
                        valor: Number(h.valor),
                        vencimento: h.vencimento,
                        observacao: h.observacao,
                      }}
                      clientes={clientes}
                    />
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
