import { getDividas, getCategorias, getContasWithMovs } from "@/lib/queries";
import { saveDivida, savePagamento } from "@/app/(app)/actions_dividas";
import { Card, Button, Input, Select, FormGroup, StatPill } from "@/components/ui";
import type { IconTone } from "@/components/ui";
import { currency } from "@/lib/format";
import { getCategoryIcon } from "@/lib/categoryIcons";
import { TrendingDown, Plus, AlertCircle, CircleDollarSign } from "lucide-react";
import DividaAccordion from "./DividaAccordion";
import PagamentoAccordion from "./PagamentoAccordion";
import CloseDetailsButton from "@/components/CloseDetailsButton";
import { clsx } from "clsx";

export default async function DividasPage({ searchParams }: { searchParams: Promise<{ aba?: string }> }) {
  const sp = await searchParams;
  const abaLiquidadas = sp.aba === "liquidadas";

  const [{ dividas, pagamentos }, { contas }, categorias] = await Promise.all([
    getDividas(),
    getContasWithMovs(),
    getCategorias(),
  ]);

  const contasList = contas.map((c) => ({ id: c.id, nome: c.nome }));
  const categoriasDespesa = categorias; // todas as categorias disponíveis

  // Resumo
  const totalDevido  = dividas.reduce((s, d) => s + Number(d.valor), 0); // total de TODAS as dívidas
  const totalPago    = pagamentos.filter(p => p.tipo === "realizado").reduce((s, p) => s + Number(p.valor), 0);
  const saldoAtual   = totalDevido - totalPago; // diferença entre total e pago

  // Fluxo de pagamentos, mais recentes primeiro (blindado contra data nula/vazia)
  const fluxo = [...pagamentos].sort((a, b) => (b.data || "").localeCompare(a.data || ""));

  // Separação em abas: dívidas em aberto vs. liquidadas
  const abertas = dividas.filter(d => d.situacao !== "liquidado");
  const liquidadas = dividas.filter(d => d.situacao === "liquidado");
  const listaAtual = abaLiquidadas ? liquidadas : abertas;

  // Progresso de pagamento por dívida — soma pagamentos realizados vinculados a ela
  function progressoDivida(dividaId: string, valorTotal: number) {
    const pagos = pagamentos
      .filter((p) => (p as any).divida_id === dividaId && p.tipo === "realizado")
      .reduce((s, p) => s + Number(p.valor), 0);
    const pct = valorTotal > 0 ? Math.min(100, (pagos / valorTotal) * 100) : 0;
    return { pagos, pct };
  }

  return (
    <div className="space-y-6">
      <h1 className="text-[22px] font-bold text-ink-primary tracking-tight px-1">Dívidas</h1>

      {/* Resumo */}
      <div className="flex gap-3">
        <StatPill label="Total devido" value={currency(totalDevido)} tone="red" />
        <StatPill label="Total pago" value={currency(totalPago)} tone="green" />
      </div>
      <StatPill label="Saldo em aberto" value={currency(saldoAtual)} tone={saldoAtual > 0 ? "amber" : "green"} />

      {/* Abas: Em aberto / Liquidadas */}
      <div className="flex bg-surface border border-surface-border/60 rounded-xl p-1 gap-0.5">
        <a
          href="/dividas"
          className={clsx(
            "flex-1 text-center py-2 text-[12.5px] font-semibold rounded-lg transition-all duration-150",
            !abaLiquidadas ? "bg-[#5DA832] text-[#06111F]" : "text-ink-secondary hover:text-ink-primary"
          )}
        >
          Em aberto ({abertas.length})
        </a>
        <a
          href="/dividas?aba=liquidadas"
          className={clsx(
            "flex-1 text-center py-2 text-[12.5px] font-semibold rounded-lg transition-all duration-150",
            abaLiquidadas ? "bg-[#5DA832] text-[#06111F]" : "text-ink-secondary hover:text-ink-primary"
          )}
        >
          Liquidadas ({liquidadas.length})
        </a>
      </div>

      {/* Lista de dívidas — accordion: colapsada mostra só o essencial */}
      <div className="space-y-2.5">
        {listaAtual.length === 0 ? (
          <Card className="text-center py-10">
            <AlertCircle className="h-8 w-8 text-slate-600 mx-auto mb-2.5" />
            <p className="text-sm text-slate-400">
              {abaLiquidadas ? "Nenhuma dívida liquidada ainda." : "Nenhuma dívida em aberto. 🎉"}
            </p>
          </Card>
        ) : (
          listaAtual.map((d) => {
            const categoriaNome = d.categoria_id ? categorias.find(c => c.id === d.categoria_id)?.nome : undefined;
            const CatIcon = categoriaNome ? getCategoryIcon(categoriaNome) : CircleDollarSign;
            const liquidada = d.situacao === "liquidado";
            const { pct, pagos } = progressoDivida(d.id, Number(d.valor));
            const tone: IconTone = liquidada ? "green" : pct > 0 ? "amber" : "red";

            return (
              <DividaAccordion
                key={d.id}
                divida={d as any}
                categorias={categorias}
                icon={CatIcon}
                tone={tone}
                pct={pct}
                pagos={pagos}
              />
            );
          })
        )}
      </div>

      {/* Nova dívida — card tracejado colapsável */}
      <details className="group">
        <summary className="list-none cursor-pointer">
          <div className="flex items-center justify-between p-4 rounded-2xl border border-dashed border-surface-border text-ink-secondary group-open:hidden">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#5DA832]/[0.14] text-[#6fc23b] flex items-center justify-center">
                <Plus className="h-4 w-4" />
              </div>
              <span className="text-[13.5px] font-semibold">Nova dívida</span>
            </div>
          </div>
        </summary>

        <Card className="mt-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-[#5DA832] font-bold uppercase text-xs tracking-widest">
              <Plus className="h-4 w-4" />
              <span>Nova dívida</span>
            </div>
            <CloseDetailsButton label="nova dívida" />
          </div>
          <form action={saveDivida} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormGroup label="Data">
              <Input name="data" type="date" required className="text-sm" />
            </FormGroup>
            <FormGroup label="Valor total">
              <Input name="valor" type="number" step="0.01" min="0.01" placeholder="0,00" required className="text-sm" />
            </FormGroup>
            <FormGroup label="Descrição">
              <Input name="descricao" placeholder="Ex: Celular, Empréstimo..." required className="text-sm" />
            </FormGroup>
            <FormGroup label="Observação">
              <Input name="observacao" placeholder="Ex: 10x R$ 140,00" className="text-sm" />
            </FormGroup>
            <FormGroup label="Categoria">
              <Select name="categoria_id" className="text-sm">
                <option value="">Sem categoria</option>
                {categoriasDespesa.map((cat) => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
              </Select>
            </FormGroup>
            <input type="hidden" name="situacao" value="pendente" />
            <div className="flex items-end">
              <Button type="submit" className="text-sm font-semibold inline-flex items-center justify-center w-full">
                <Plus className="h-4 w-4 mr-1.5" />
                Adicionar
              </Button>
            </div>
          </form>
        </Card>
      </details>

      {/* Fluxo de Pagamentos */}
      <Card className="p-0 overflow-hidden border-surface-border/60">
        <div className="px-4 py-3 border-b border-surface-border/40 flex items-center gap-2">
          <TrendingDown className="h-4 w-4 text-[#5DA832]" />
          <h3 className="font-semibold text-white text-sm">Fluxo de Pagamentos</h3>
        </div>

        {/* Novo pagamento — mesmo padrão visual de "Nova dívida" (card tracejado colapsável) */}
        <div className="p-4 border-b border-surface-border/40">
          <details className="group">
            <summary className="list-none cursor-pointer">
              <div className="flex items-center justify-between p-4 rounded-2xl border border-dashed border-surface-border text-ink-secondary group-open:hidden">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#5DA832]/[0.14] text-[#6fc23b] flex items-center justify-center">
                    <Plus className="h-4 w-4" />
                  </div>
                  <span className="text-[13.5px] font-semibold">Novo pagamento</span>
                </div>
              </div>
            </summary>

            <div className="mt-2">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-[#5DA832] font-bold uppercase text-xs tracking-widest">
                  <Plus className="h-4 w-4" />
                  <span>Novo pagamento</span>
                </div>
                <CloseDetailsButton label="novo pagamento" />
              </div>
              <form action={savePagamento} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 items-end">
                <FormGroup label="Data">
                  <Input name="data" type="date" required className="text-sm" />
                </FormGroup>
                <FormGroup label="Descrição">
                  <Input name="descricao" placeholder="Ex: Gasolina, Cerveja..." required className="text-sm" />
                </FormGroup>
                <FormGroup label="Valor">
                  <Input name="valor" type="number" step="0.01" min="0.01" placeholder="0,00" required className="text-sm" />
                </FormGroup>
                <FormGroup label="Tipo">
                  <Select name="tipo" required className="text-sm">
                    <option value="orcado">Orçado</option>
                    <option value="realizado">Realizado</option>
                  </Select>
                </FormGroup>
                <FormGroup label="Dívida vinculada">
                  <Select name="divida_id" className="text-sm">
                    <option value="">Nenhuma (avulso)</option>
                    {abertas.map((d) => <option key={d.id} value={d.id}>{d.descricao}</option>)}
                  </Select>
                </FormGroup>
                <FormGroup label="Conta">
                  <Select name="conta_id" className="text-sm">
                    <option value="">Nenhuma</option>
                    {contasList.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                  </Select>
                </FormGroup>
                <FormGroup label="Categoria">
                  <Select name="categoria_id" className="text-sm">
                    <option value="">Sem categoria</option>
                    {categoriasDespesa.map((cat) => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
                  </Select>
                </FormGroup>
                <Button type="submit" className="text-sm font-semibold inline-flex items-center justify-center">
                  <Plus className="h-4 w-4 mr-1.5" />
                  Adicionar
                </Button>
              </form>
            </div>
          </details>
        </div>

        {/* Lista de pagamentos — accordion: colapsada mostra só descrição/valor/status */}
        <div className="divide-y divide-surface-border/40">
          {fluxo.length === 0 ? (
            <p className="px-4 py-8 text-center text-slate-600 italic text-xs">Nenhum pagamento lançado.</p>
          ) : fluxo.map((p: any) => {
            const categoriaNome = p.categoria_id
              ? categorias.find(cat => cat.id === p.categoria_id)?.nome ?? null
              : null;
            return (
              <PagamentoAccordion
                key={p.id}
                pagamento={p}
                categoriaNome={categoriaNome}
                contas={contasList}
                categorias={categoriasDespesa}
              />
            );
          })}
        </div>
      </Card>
    </div>
  );
}
