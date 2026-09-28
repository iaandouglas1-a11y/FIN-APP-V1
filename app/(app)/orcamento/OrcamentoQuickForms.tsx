"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { saveOrcamentoItem, saveOrcamentoParcela, sugerirValorCategoria } from "@/app/(app)/actions_orcamento";
import { FormGroup, Input, Select } from "@/components/ui";
import { currency } from "@/lib/format";

interface Props {
  competencia: string; // yyyy-MM-01
  categorias: { id: string; nome: string }[];
}

type SubtipoGasto = "fixo" | "variavel" | "parcelado";

/** Botões "Nova receita" / "Novo gasto" lado a lado — mesmo padrão do
 * MovimentacaoQuickForms / DividaQuickForms: sempre visíveis, cada um revela
 * seu formulário (com botão de fechar) só quando clicado.
 *
 * "Novo gasto" tem 3 tipos: fixo, variável e parcelado. Parcelado vai para
 * outra tabela (saveOrcamentoParcela) e pede valor da parcela + nº de parcelas;
 * a 1ª parcela assume o mês que está sendo visualizado. Em custo variável, ao
 * escolher a categoria buscamos a média mensal dos últimos 3 meses e oferecemos
 * como sugestão de valor. */
export default function OrcamentoQuickForms({ competencia, categorias }: Props) {
  const [aberto, setAberto] = useState<null | "receita" | "gasto">(null);
  const [subtipoGasto, setSubtipoGasto] = useState<SubtipoGasto>("fixo");
  const [valorGasto, setValorGasto] = useState("");
  const [sugestao, setSugestao] = useState<number | null>(null);

  const mes = competencia.slice(0, 7);

  function resetGasto() {
    setSubtipoGasto("fixo");
    setValorGasto("");
    setSugestao(null);
  }

  async function aoEscolherCategoria(categoriaId: string) {
    if (subtipoGasto !== "variavel" || !categoriaId) {
      setSugestao(null);
      return;
    }
    const media = await sugerirValorCategoria(categoriaId);
    setSugestao(media > 0 ? media : null);
  }

  async function enviarGasto(formData: FormData) {
    if (subtipoGasto === "parcelado") {
      await saveOrcamentoParcela(formData);
    } else {
      await saveOrcamentoItem(formData);
    }
    setAberto(null);
    resetGasto();
  }

  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setAberto((v) => (v === "receita" ? null : "receita"))}
          className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-[13px] font-semibold border transition-all duration-200 ${
            aberto === "receita"
              ? "bg-[#5DA832]/15 border-[#5DA832]/40 text-[#6fc23b]"
              : "bg-surface border-surface-border/60 text-ink-secondary hover:text-ink-primary"
          }`}
        >
          <Plus className="h-3.5 w-3.5" />
          Nova receita
        </button>
        <button
          type="button"
          onClick={() => setAberto((v) => (v === "gasto" ? null : "gasto"))}
          className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-[13px] font-semibold border transition-all duration-200 ${
            aberto === "gasto"
              ? "bg-info/15 border-info/40 text-[#60a5fa]"
              : "bg-surface border-surface-border/60 text-ink-secondary hover:text-ink-primary"
          }`}
        >
          <Plus className="h-3.5 w-3.5" />
          Novo gasto
        </button>
      </div>

      {/* Painel: Nova receita */}
      {aberto === "receita" && (
        <div className="border border-[#5DA832]/30 rounded-xl p-4 bg-[#5DA832]/5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#5DA832] font-bold uppercase text-xs tracking-widest">
              <Plus className="h-4 w-4" />
              <span>Nova receita</span>
            </div>
            <button type="button" onClick={() => setAberto(null)} className="p-1 text-slate-500 hover:text-slate-300 rounded transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <form
            action={async (formData) => {
              await saveOrcamentoItem(formData);
              setAberto(null);
            }}
            className="space-y-2"
          >
            <input type="hidden" name="tipo" value="receita" />
            <input type="hidden" name="competencia" value={mes} />

            <FormGroup label="Descrição">
              <Input name="descricao" placeholder="Ex: Salário, Honorários..." required className="text-sm" />
            </FormGroup>
            <div className="grid grid-cols-2 gap-2">
              <FormGroup label="Valor">
                <Input name="valor" type="number" step="0.01" min="0.01" placeholder="0,00" required className="text-sm" />
              </FormGroup>
              <FormGroup label="Recorrência">
                <Select name="subtipo" required defaultValue="fixo" className="text-sm">
                  <option value="fixo">Fixo</option>
                  <option value="variavel">Variável</option>
                </Select>
              </FormGroup>
            </div>
            <FormGroup label="Categoria (opcional)">
              <Select name="categoria_id" className="text-sm">
                <option value="">Sem categoria</option>
                {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </Select>
            </FormGroup>
            <button
              type="submit"
              className="w-full h-9 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#5DA832] hover:bg-[#6fc23b] text-[#0A0A0A] text-sm font-bold transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </button>
          </form>
        </div>
      )}

      {/* Painel: Novo gasto */}
      {aberto === "gasto" && (
        <div className="border border-info/30 rounded-xl p-4 bg-info/5 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#60a5fa] font-bold uppercase text-xs tracking-widest">
              <Plus className="h-4 w-4" />
              <span>Novo gasto</span>
            </div>
            <button
              type="button"
              onClick={() => { setAberto(null); resetGasto(); }}
              className="p-1 text-slate-500 hover:text-slate-300 rounded transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form action={enviarGasto} className="space-y-2">
            <input type="hidden" name="tipo" value="despesa" />
            <input type="hidden" name="competencia" value={mes} />
            <input type="hidden" name="data_primeira_parcela" value={mes} />

            <FormGroup label="Descrição">
              <Input name="descricao" placeholder="Ex: Aluguel, Combustível, Celular..." required className="text-sm" />
            </FormGroup>

            <div className="grid grid-cols-2 gap-2">
              <FormGroup label="Tipo">
                <Select
                  name="subtipo"
                  required
                  value={subtipoGasto}
                  onChange={(e) => { setSubtipoGasto(e.target.value as SubtipoGasto); setSugestao(null); }}
                  className="text-sm"
                >
                  <option value="fixo">Fixo</option>
                  <option value="variavel">Variável</option>
                  <option value="parcelado">Parcelado</option>
                </Select>
              </FormGroup>
              <FormGroup label="Categoria">
                <Select
                  name="categoria_id"
                  onChange={(e) => aoEscolherCategoria(e.target.value)}
                  className="text-sm"
                >
                  <option value="">Sem categoria</option>
                  {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </Select>
              </FormGroup>
            </div>

            {subtipoGasto === "parcelado" ? (
              <div className="grid grid-cols-2 gap-2">
                <FormGroup label="Valor da parcela">
                  <Input name="valor_parcela" type="number" step="0.01" min="0.01" placeholder="0,00" required className="text-sm" />
                </FormGroup>
                <FormGroup label="Nº de parcelas">
                  <Input name="parcelas_total" type="number" step="1" min="2" placeholder="Ex: 10" required className="text-sm" />
                </FormGroup>
              </div>
            ) : (
              <FormGroup label="Valor">
                <Input
                  name="valor"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0,00"
                  required
                  value={valorGasto}
                  onChange={(e) => setValorGasto(e.target.value)}
                  className="text-sm"
                />
              </FormGroup>
            )}

            {subtipoGasto === "variavel" && sugestao !== null && (
              <button
                type="button"
                onClick={() => setValorGasto(sugestao.toFixed(2))}
                className="w-full text-left text-[11px] text-[#60a5fa] hover:underline"
              >
                Média dos últimos 3 meses: {currency(sugestao)} — usar este valor
              </button>
            )}

            {subtipoGasto === "parcelado" && (
              <p className="text-[11px] text-ink-tertiary">
                A 1ª parcela entra no mês que você está visualizando; as demais aparecem sozinhas nos meses seguintes.
              </p>
            )}

            <button
              type="submit"
              className="w-full h-9 inline-flex items-center justify-center gap-1.5 rounded-lg bg-info hover:brightness-110 text-white text-sm font-semibold transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
