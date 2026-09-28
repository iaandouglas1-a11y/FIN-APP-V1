"use client";

import { useState } from "react";
import { Trash2, Copy, PiggyBank, Wallet, Receipt } from "lucide-react";
import { Card, StatPill, AmountText, EmptyState, ProgressBar, Badge, IconChip } from "@/components/ui";
import { currency } from "@/lib/format";
import { getCategoryIcon } from "@/lib/categoryIcons";
import { deleteOrcamentoItem, deleteOrcamentoParcela, duplicarOrcamento } from "@/app/(app)/actions_orcamento";
import { CategoryPie } from "@/components/Charts";
import OrcamentoQuickForms from "./OrcamentoQuickForms";
import EditarOrcamentoItemBtn from "./EditarOrcamentoItemBtn";
import EditarOrcamentoParcelaBtn from "./EditarOrcamentoParcelaBtn";

type Item = {
  id: string;
  tipo: "receita" | "despesa";
  subtipo: "fixo" | "variavel";
  categoria_id: string | null;
  descricao: string;
  valor: number;
  categorias?: { nome: string } | null;
};

type Parcela = {
  id: string;
  descricao: string;
  categoria_id: string | null;
  valor_parcela: number;
  parcelas_total: number;
  data_primeira_parcela: string;
  categorias?: { nome: string } | null;
  parcelaAtual: number;
  parcelasTotal: number;
};

type Comparativo = { categoriaId: string; nome: string; orcado: number; realizado: number; pct: number };

type Props = {
  competencia: string;
  receitas: Item[];
  despesasFixas: Item[];
  despesasVariaveis: Item[];
  parcelasAtivas: Parcela[];
  totalReceitas: number;
  totalCustos: number;
  saldo: number;
  comparativo: Comparativo[];
  distribuicao: { name: string; value: number }[];
  categorias: { id: string; nome: string }[];
};

function ItemRow({
  item,
  tone,
  categorias,
  competencia,
}: {
  item: Item;
  tone: "green" | "red" | "amber";
  categorias: { id: string; nome: string }[];
  competencia: string;
}) {
  const nomeCategoria = item.categorias?.nome ?? "Sem categoria";
  const Icon = getCategoryIcon(nomeCategoria);
  return (
    <div className="list-row">
      <IconChip icon={Icon} tone={tone} />
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-semibold text-ink-primary truncate">{item.descricao}</div>
        <div className="text-[11.5px] text-ink-tertiary mt-0.5 truncate">{nomeCategoria}</div>
      </div>
      <AmountText value={Number(item.valor)} tone={tone} />
      <div className="flex items-center gap-0.5 shrink-0">
        <EditarOrcamentoItemBtn item={item} categorias={categorias} competencia={competencia} />
        <form action={deleteOrcamentoItem}>
          <input type="hidden" name="id" value={item.id} />
          <button type="submit" className="p-1.5 text-slate-600 hover:text-[#f87171] rounded-lg transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default function OrcamentoBody({
  competencia,
  receitas,
  despesasFixas,
  despesasVariaveis,
  parcelasAtivas,
  totalReceitas,
  totalCustos,
  saldo,
  comparativo,
  distribuicao,
  categorias,
}: Props) {
  const [confirmandoDuplicar, setConfirmandoDuplicar] = useState(false);
  const acimaDoOrcado = comparativo.filter((c) => c.pct > 100);

  return (
    <>
      {/* Hero: saldo projetado do orçamento */}
      <div className="glass-card p-6">
        <div className="text-[11px] font-bold uppercase tracking-widest text-ink-secondary">Saldo do orçamento</div>
        <AmountText value={saldo} size="hero" className="block mt-1.5" />
      </div>

      <div className="flex gap-3">
        <StatPill label="Renda estimada" value={currency(totalReceitas)} tone="green" />
        <StatPill label="Custos estimados" value={currency(totalCustos)} tone="red" />
      </div>

      <OrcamentoQuickForms competencia={competencia} categorias={categorias} />

      {/* Renda estimada */}
      <Card className="border-surface-border/60 p-4">
        <div className="mb-4 pb-3 border-b border-surface-border/50">
          <h2 className="text-[15px] font-bold text-white">Renda estimada</h2>
          <p className="text-xs text-ink-tertiary mt-1">
            {receitas.length} {receitas.length === 1 ? "item" : "itens"}
          </p>
        </div>
        {receitas.length === 0 ? (
          <EmptyState icon={<Wallet className="h-10 w-10" />} title="Nenhuma receita orçada" />
        ) : (
          <div>
            {receitas.map((i) => (
              <ItemRow key={i.id} item={i} tone="green" categorias={categorias} competencia={competencia} />
            ))}
          </div>
        )}
      </Card>

      {/* Custos fixos */}
      <Card className="border-surface-border/60 p-4">
        <div className="mb-4 pb-3 border-b border-surface-border/50">
          <h2 className="text-[15px] font-bold text-white">Custos fixos</h2>
          <p className="text-xs text-ink-tertiary mt-1">
            {despesasFixas.length} {despesasFixas.length === 1 ? "item" : "itens"}
          </p>
        </div>
        {despesasFixas.length === 0 ? (
          <EmptyState icon={<Receipt className="h-10 w-10" />} title="Nenhum custo fixo orçado" />
        ) : (
          <div>
            {despesasFixas.map((i) => (
              <ItemRow key={i.id} item={i} tone="red" categorias={categorias} competencia={competencia} />
            ))}
          </div>
        )}
      </Card>

      {/* Custos variáveis */}
      <Card className="border-surface-border/60 p-4">
        <div className="mb-4 pb-3 border-b border-surface-border/50">
          <h2 className="text-[15px] font-bold text-white">Custos variáveis</h2>
          <p className="text-xs text-ink-tertiary mt-1">
            {despesasVariaveis.length} {despesasVariaveis.length === 1 ? "item" : "itens"}
          </p>
        </div>
        {despesasVariaveis.length === 0 ? (
          <EmptyState icon={<Receipt className="h-10 w-10" />} title="Nenhum custo variável orçado" />
        ) : (
          <div>
            {despesasVariaveis.map((i) => (
              <ItemRow key={i.id} item={i} tone="amber" categorias={categorias} competencia={competencia} />
            ))}
          </div>
        )}
      </Card>

      {/* Compras parceladas — parcela atual calculada automaticamente */}
      <Card className="border-surface-border/60 p-4">
        <div className="mb-4 pb-3 border-b border-surface-border/50">
          <h2 className="text-[15px] font-bold text-white">Compras parceladas</h2>
          <p className="text-xs text-ink-tertiary mt-1">
            {parcelasAtivas.length} {parcelasAtivas.length === 1 ? "ativa" : "ativas"} neste mês
          </p>
        </div>
        {parcelasAtivas.length === 0 ? (
          <EmptyState icon={<PiggyBank className="h-10 w-10" />} title="Nenhuma parcela ativa neste mês" />
        ) : (
          <div className="divide-y divide-surface-border/40">
            {parcelasAtivas.map((p) => (
              <div key={p.id} className="py-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-ink-primary truncate">{p.descricao}</p>
                    <p className="text-[11px] text-ink-tertiary mt-0.5">
                      {p.parcelaAtual} de {p.parcelasTotal} · {currency(Number(p.valor_parcela))}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <EditarOrcamentoParcelaBtn parcela={p} categorias={categorias} />
                    <form action={deleteOrcamentoParcela}>
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" className="p-1.5 text-slate-600 hover:text-[#f87171] rounded-lg transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  </div>
                </div>
                <ProgressBar pct={(p.parcelaAtual / p.parcelasTotal) * 100} />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Distribuição do orçamento — mesmo CategoryPie de Investimentos/Dashboard */}
      {distribuicao.length > 0 && (
        <Card className="border-surface-border/60 p-4">
          <div className="mb-4 pb-3 border-b border-surface-border/50">
            <h2 className="text-[15px] font-bold text-white">Distribuição do orçamento</h2>
            <p className="text-xs text-ink-tertiary mt-1">Por categoria, incluindo parcelas ativas</p>
          </div>
          <CategoryPie data={distribuicao} />
        </Card>
      )}

      {/* Orçado x realizado */}
      <Card className="border-surface-border/60 p-4">
        <div className="mb-4 pb-3 border-b border-surface-border/50">
          <h2 className="text-[15px] font-bold text-white">Orçado x realizado</h2>
          <p className="text-xs text-ink-tertiary mt-1">Comparado com as movimentações já lançadas no mês</p>
        </div>
        {comparativo.length === 0 ? (
          <p className="text-center py-6 text-sm text-slate-600 italic">Nenhum custo orçado para comparar ainda.</p>
        ) : (
          <div className="divide-y divide-surface-border/40">
            {comparativo.map((c) => (
              <div key={c.categoriaId} className="py-3">
                <div className="flex items-center justify-between gap-2 text-[12.5px]">
                  <span className="text-ink-primary font-medium truncate">{c.nome}</span>
                  <span className={c.pct > 100 ? "text-[#f87171] font-bold shrink-0" : "text-ink-tertiary shrink-0"}>
                    {currency(c.realizado)} de {currency(c.orcado)}
                  </span>
                </div>
                <ProgressBar
                  pct={Math.min(100, c.pct)}
                  color={c.pct > 100 ? "#f87171" : c.pct > 85 ? "#F5A524" : "#5DA832"}
                />
              </div>
            ))}
          </div>
        )}
        {acimaDoOrcado.length > 0 && (
          <div className="text-center pt-3">
            <Badge variant="error">
              {acimaDoOrcado.length} {acimaDoOrcado.length === 1 ? "categoria acima" : "categorias acima"} do orçado
            </Badge>
          </div>
        )}
      </Card>

      {/* Duplicar orçamento para o próximo mês */}
      {!confirmandoDuplicar ? (
        <button
          type="button"
          onClick={() => setConfirmandoDuplicar(true)}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-[13px] font-semibold border bg-surface border-surface-border/60 text-ink-secondary hover:text-ink-primary transition-all duration-200"
        >
          <Copy className="h-3.5 w-3.5" />
          Duplicar orçamento para o próximo mês
        </button>
      ) : (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-surface border border-surface-border/60">
          <span className="text-xs text-ink-secondary flex-1">
            Copiar receitas e custos fixos/variáveis para o próximo mês? Parcelas continuam automáticas.
          </span>
          <form
            action={async (formData) => {
              await duplicarOrcamento(formData);
              setConfirmandoDuplicar(false);
            }}
          >
            <input type="hidden" name="competencia" value={competencia} />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-[#5DA832] hover:bg-[#6fc23b] text-white text-xs font-semibold transition-colors"
            >
              Confirmar
            </button>
          </form>
          <button
            type="button"
            onClick={() => setConfirmandoDuplicar(false)}
            className="px-2 py-1.5 text-ink-tertiary hover:text-ink-primary text-xs transition-colors"
          >
            Cancelar
          </button>
        </div>
      )}
    </>
  );
}
