import { getDividas, getCategorias, getContasWithMovs } from "@/lib/queries";
import { saveDivida, deleteDivida, alterarSituacaoDivida, savePagamento, deletePagamento } from "@/app/(app)/actions_dividas";
import { Card, Button, Input, Select, Badge, FormGroup, StatPill, IconChip, AmountText, ProgressBar } from "@/components/ui";
import type { IconTone } from "@/components/ui";
import { currency, dateBR } from "@/lib/format";
import { getCategoryIcon } from "@/lib/categoryIcons";
import { TrendingDown, Plus, Trash2, CheckCircle, Circle, AlertCircle, CircleDollarSign } from "lucide-react";
import RealizarPagamentoBtn from "./RealizarPagamentoBtn";
import DesfazerPagamentoBtn from "./DesfazerPagamentoBtn";
import EditarDividaBtn from "./EditarDividaBtn";
import EditarPagamentoBtn from "./EditarPagamentoBtn";
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

  // Fluxo de pagamentos com saldo decremental
  const pagamentosOrdenados = [...pagamentos].sort((a, b) => a.data.localeCompare(b.data));
  let saldoCorrido = totalDevido;  // parte do total geral
  const fluxo = pagamentosOrdenados.map((p) => {
    if (p.tipo === "realizado") saldoCorrido -= Number(p.valor);
    return { ...p, saldoApos: saldoCorrido };
  });

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

      {/* Lista de dívidas — cards com progresso (em vez de tabela) */}
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
            const { pct } = progressoDivida(d.id, Number(d.valor));
            const tone: IconTone = liquidada ? "green" : pct > 0 ? "amber" : "red";

            return (
              <div key={d.id} className={clsx("surface-2 bg-surface p-3.5", liquidada && "opacity-60")}>
                <div className="flex items-start gap-3">
                  <IconChip icon={CatIcon} tone={tone} size={38} iconSize={17} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-semibold text-ink-primary truncate">{d.descricao}</div>
                    <div className="flex items-center gap-1.5 flex-wrap mt-1">
                      {liquidada ? (
                        <Badge variant="success" className="text-[10px]">✓ Liquidado</Badge>
                      ) : (
                        <>
                          <span className="text-[11px] text-ink-tertiary">{dateBR(d.data)}</span>
                          <Badge variant={pct > 0 ? "warning" : "error"} className="text-[10px]">
                            {pct > 0 ? `${Math.round(pct)}% pago` : "Pendente"}
                          </Badge>
                        </>
                      )}
                      {d.observacao && <span className="text-[11px] text-ink-tertiary">· {d.observacao}</span>}
                    </div>
                  </div>
                  <AmountText value={Number(d.valor)} tone={liquidada ? "neutral" : "red"} className="shrink-0" />
                </div>

                {!liquidada && <ProgressBar pct={pct} color={pct > 60 ? "#5DA832" : pct > 0 ? "#F5A524" : "#1E3A66"} />}

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-border/40">
                  <form action={alterarSituacaoDivida}>
                    <input type="hidden" name="id" value={d.id} />
                    <input type="hidden" name="situacao" value={d.situacao} />
                    <button
                      type="submit"
                      className={clsx(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all duration-200 border",
                        liquidada
                          ? "bg-[#5DA832]/10 text-[#5DA832] border-[#5DA832]/30"
                          : "bg-danger/10 text-[#f87171] border-danger/20"
                      )}
                    >
                      {liquidada ? <CheckCircle className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                      {liquidada ? "Reabrir" : "Marcar como liquidada"}
                    </button>
                  </form>
                  <div className="flex items-center gap-1">
                    <EditarDividaBtn divida={d} categorias={categorias} />
                    <form action={deleteDivida}>
                      <input type="hidden" name="id" value={d.id} />
                      <button type="submit" className="p-1.5 text-slate-600 hover:text-[#f87171] rounded-lg transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
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
          <div className="flex items-center gap-2 mb-4 text-[#5DA832] font-bold uppercase text-xs tracking-widest">
            <Plus className="h-4 w-4" />
            <span>Nova dívida</span>
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
        <div className="px-4 py-3 border-b border-surface-border/40 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-[#5DA832]" />
            <h3 className="font-semibold text-white text-sm">Fluxo de Pagamentos</h3>
          </div>
        </div>

        {/* Form novo pagamento — colapsável */}
        <details className="border-b border-surface-border/40">
          <summary className="list-none cursor-pointer px-4 py-3 flex items-center gap-2 text-[#5DA832] text-xs font-bold uppercase tracking-widest hover:bg-surface-2/30">
            <Plus className="h-3.5 w-3.5" />
            Novo pagamento
          </summary>
          <div className="px-4 pb-4">
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

        {/* Lista de pagamentos — cards, sem scroll horizontal (mobile-first) */}
        <div className="divide-y divide-surface-border/40">
          {fluxo.length === 0 ? (
            <p className="px-4 py-8 text-center text-slate-600 italic text-xs">Nenhum pagamento lançado.</p>
          ) : fluxo.map((p: any) => {
            const categoriaNome = (p as any).categoria_id
              ? categorias.find(cat => cat.id === (p as any).categoria_id)?.nome
              : null;
            return (
              <div key={p.id} className={clsx("p-3.5", p.tipo === "realizado" && "bg-[#5DA832]/[0.03]")}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] font-semibold text-ink-primary truncate">{p.descricao}</p>
                    <div className="flex items-center gap-1.5 flex-wrap mt-1 text-[11px] text-ink-tertiary">
                      <span>{dateBR(p.data)}</span>
                      {categoriaNome && <span>· {categoriaNome}</span>}
                      {p.tipo === "realizado" && <span>· saldo após {currency(p.saldoApos)}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="num text-[14.5px] font-bold text-ink-primary whitespace-nowrap">{currency(Number(p.valor))}</p>
                    {p.tipo === "realizado" ? (
                      <Badge variant="success" className="text-[10px] mt-1">✓ Realizado</Badge>
                    ) : (
                      <Badge variant="warning" className="text-[10px] mt-1">Orçado</Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-1 mt-2.5 pt-2.5 border-t border-surface-border/30">
                  {p.tipo === "orcado" ? (
                    <RealizarPagamentoBtn
                      pagamentoId={p.id}
                      descricao={p.descricao}
                      valor={Number(p.valor)}
                      data={p.data}
                      contas={contasList}
                      categorias={categoriasDespesa}
                      categoriaId={(p as any).categoria_id}
                    />
                  ) : (
                    <DesfazerPagamentoBtn pagamentoId={p.id} tipo={p.tipo} />
                  )}
                  <EditarPagamentoBtn
                    pagamento={{
                      id: p.id,
                      data: p.data,
                      descricao: p.descricao,
                      valor: Number(p.valor),
                      tipo: p.tipo,
                      conta_id: (p as any).conta_id,
                      categoria_id: (p as any).categoria_id
                    }}
                    contas={contasList}
                    categorias={categoriasDespesa}
                  />
                  <form action={deletePagamento}>
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" className="p-1.5 text-slate-600 hover:text-[#f87171] rounded-lg transition-colors" title="Excluir">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
