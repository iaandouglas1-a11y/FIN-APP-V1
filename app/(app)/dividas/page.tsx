import { getDividas, getCategorias, getContasWithMovs } from "@/lib/queries";
import { saveDivida, deleteDivida, alterarSituacaoDivida, savePagamento, deletePagamento } from "@/app/(app)/actions_dividas";
import { Card, Button, Input, Select, Badge, PageHeader, FormGroup } from "@/components/ui";
import { currency, dateBR } from "@/lib/format";
import { TrendingDown, Plus, Trash2, CheckCircle, Circle, AlertCircle } from "lucide-react";
import RealizarPagamentoBtn from "./RealizarPagamentoBtn";
import { clsx } from "clsx";

export default async function DividasPage() {
  const [{ dividas, pagamentos }, { contas }, categorias] = await Promise.all([
    getDividas(),
    getContasWithMovs(),
    getCategorias(),
  ]);

  const contasList = contas.map((c) => ({ id: c.id, nome: c.nome }));
  const categoriasDespesa = categorias; // todas as categorias disponíveis

  // Resumo
  const totalDevido  = dividas.filter(d => d.situacao === "pendente").reduce((s, d) => s + Number(d.valor), 0);
  const totalPago    = pagamentos.filter(p => p.tipo === "realizado").reduce((s, p) => s + Number(p.valor), 0);
  const saldoAtual   = totalDevido - totalPago;

  // Fluxo de pagamentos com saldo decremental
  const pagamentosOrdenados = [...pagamentos].sort((a, b) => a.data.localeCompare(b.data));
  let saldoCorrido = totalDevido;
  const fluxo = pagamentosOrdenados.map((p) => {
    if (p.tipo === "realizado") saldoCorrido -= Number(p.valor);
    return { ...p, saldoApos: saldoCorrido };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Controle de Dívidas"
        description="Levantamento e fluxo de pagamentos das suas dívidas"
      />

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-rose-500/20 bg-rose-500/5 p-4 flex flex-col justify-between min-h-[80px]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400/70 leading-tight">Total em Aberto</p>
          <p className="text-base sm:text-lg font-bold text-rose-400 mt-2 tabular-nums">{currency(totalDevido)}</p>
        </Card>
        <Card className="border-[#5DA832]/20 bg-[#5DA832]/5 p-4 flex flex-col justify-between min-h-[80px]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[#5DA832]/70 leading-tight">Total Pago</p>
          <p className="text-base sm:text-lg font-bold text-[#5DA832] mt-2 tabular-nums">{currency(totalPago)}</p>
        </Card>
        <Card className="border-slate-700/40 p-4 flex flex-col justify-between min-h-[80px]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 leading-tight">Saldo Remanescente</p>
          <p className="text-base sm:text-lg font-bold text-white mt-2 tabular-nums">{currency(saldoAtual)}</p>
        </Card>
      </div>

      {/* Formulário nova dívida */}
      <Card className="border-[#5DA832]/30 bg-gradient-to-br from-[#5DA832]/10 to-[#5DA832]/5 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-32 h-32 bg-[#5DA832]/10 rounded-full blur-3xl" />
        <div className="flex items-center gap-2 mb-4 text-[#5DA832] font-bold uppercase text-xs tracking-widest relative z-10">
          <Plus className="h-4 w-4" />
          <span>Nova Dívida</span>
        </div>
        <form action={saveDivida} className="relative z-10 flex flex-wrap items-end gap-2">
          <div className="w-32 shrink-0">
            <FormGroup label="Data">
              <Input name="data" type="date" required className="h-9 w-full block text-sm" />
            </FormGroup>
          </div>
          <div className="flex-1 min-w-[140px]">
            <FormGroup label="Descrição">
              <Input name="descricao" placeholder="Ex: Celular, Empréstimo..." required className="h-9 text-sm" />
            </FormGroup>
          </div>
          <div className="w-28 shrink-0">
            <FormGroup label="Valor Total">
              <Input name="valor" type="number" step="0.01" min="0.01" placeholder="0,00" required className="h-9 text-sm" />
            </FormGroup>
          </div>
          <div className="flex-1 min-w-[120px]">
            <FormGroup label="Observação">
              <Input name="observacao" placeholder="Ex: 10x R$ 140,00" className="h-9 text-sm" />
            </FormGroup>
          </div>
          <div className="w-36 shrink-0">
            <FormGroup label="Categoria">
              <Select name="categoria_id" className="h-9 text-sm">
                <option value="">Sem categoria</option>
                {categoriasDespesa.map((cat) => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
              </Select>
            </FormGroup>
          </div>
          <input type="hidden" name="situacao" value="pendente" />
          <Button type="submit" className="h-9 px-4 text-sm font-semibold inline-flex items-center justify-center shrink-0 mb-[1px]">
            <Plus className="h-4 w-4 mr-1.5" />
            Adicionar
          </Button>
        </form>
      </Card>

      {/* Levantamento de Dívidas */}
      <Card className="p-0 overflow-hidden border-slate-800/60">
        <div className="px-4 py-3 border-b border-slate-800/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-400" />
            <h3 className="font-semibold text-white text-sm">Levantamento de Dívidas</h3>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
            {dividas.filter(d => d.situacao === "pendente").length} pendentes
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800/40 bg-[#0D2340]/40">
                <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Data</th>
                <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Descrição</th>
                <th className="px-4 py-2 text-right text-[10px] font-bold uppercase tracking-widest text-slate-500">Valor</th>
                <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 hidden md:table-cell">Observação</th>
                <th className="px-4 py-2 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">Situação</th>
                <th className="px-4 py-2 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {dividas.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-600 italic text-xs">Nenhuma dívida cadastrada.</td></tr>
              ) : dividas.map((d) => (
                <tr key={d.id} className={clsx("hover:bg-slate-800/20 transition-colors", d.situacao === "liquidado" && "opacity-50")}>
                  <td className="px-4 py-2.5 text-slate-400 text-xs whitespace-nowrap">{dateBR(d.data)}</td>
                  <td className="px-4 py-2.5 text-slate-200 font-medium">{d.descricao}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-rose-400 whitespace-nowrap">{currency(Number(d.valor))}</td>
                  <td className="px-4 py-2.5 text-slate-400 text-xs hidden md:table-cell">{d.categoria_id ? categorias.find(cat => cat.id === d.categoria_id)?.nome || "—" : "—"}</td>
                  <td className="px-4 py-2.5 text-slate-500 text-xs hidden md:table-cell">{d.observacao || "—"}</td>
                  <td className="px-4 py-2.5 text-center">
                    <form action={alterarSituacaoDivida}>
                      <input type="hidden" name="id" value={d.id} />
                      <input type="hidden" name="situacao" value={d.situacao} />
                      <button type="submit" className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all duration-200 border"
                        style={d.situacao === "liquidado"
                          ? { background: "rgba(93,168,50,0.1)", color: "#5DA832", borderColor: "rgba(93,168,50,0.3)" }
                          : { background: "rgba(239,68,68,0.1)", color: "#f87171", borderColor: "rgba(239,68,68,0.2)" }
                        }
                      >
                        {d.situacao === "liquidado" ? <CheckCircle className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                        {d.situacao === "liquidado" ? "Liquidado" : "Pendente"}
                      </button>
                    </form>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <form action={deleteDivida}>
                      <input type="hidden" name="id" value={d.id} />
                      <button type="submit" className="p-1 text-slate-600 hover:text-rose-400 rounded transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Fluxo de Pagamentos */}
      <Card className="p-0 overflow-hidden border-slate-800/60">
        <div className="px-4 py-3 border-b border-slate-800/40 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-[#5DA832]" />
            <h3 className="font-semibold text-white text-sm">Fluxo de Pagamentos</h3>
          </div>
        </div>

        {/* Form novo pagamento */}
        <div className="px-4 py-3 border-b border-slate-800/40 bg-[#0D2340]/30">
          <form action={savePagamento} className="flex flex-wrap items-end gap-2">
            <div className="w-32 shrink-0">
              <FormGroup label="Data">
                <Input name="data" type="date" required className="h-9 w-full block text-sm" />
              </FormGroup>
            </div>
            <div className="flex-1 min-w-[140px]">
              <FormGroup label="Descrição">
                <Input name="descricao" placeholder="Ex: Gasolina, Cerveja..." required className="h-9 text-sm" />
              </FormGroup>
            </div>
            <div className="w-24 shrink-0">
              <FormGroup label="Valor">
                <Input name="valor" type="number" step="0.01" min="0.01" placeholder="0,00" required className="h-9 text-sm" />
              </FormGroup>
            </div>
            <div className="w-28 shrink-0">
              <FormGroup label="Tipo">
                <Select name="tipo" required className="h-9 text-sm">
                  <option value="orcado">Orçado</option>
                  <option value="realizado">Realizado</option>
                </Select>
              </FormGroup>
            </div>
            <div className="w-32 shrink-0">
              <FormGroup label="Conta">
                <Select name="conta_id" className="h-9 text-sm">
                  <option value="">Nenhuma</option>
                  {contasList.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </Select>
              </FormGroup>
            </div>
            <div className="w-36 shrink-0">
              <FormGroup label="Categoria">
                <Select name="categoria_id" className="h-9 text-sm">
                  <option value="">Sem categoria</option>
                  {categoriasDespesa.map((cat) => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
                </Select>
              </FormGroup>
            </div>
            <Button type="submit" className="h-9 px-4 text-sm font-semibold inline-flex items-center justify-center shrink-0 mb-[1px]">
              <Plus className="h-4 w-4 mr-1.5" />
              Adicionar
            </Button>
          </form>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800/40 bg-[#0D2340]/40">
                <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Data</th>
                <th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Descrição</th>
                <th className="px-4 py-2 text-right text-[10px] font-bold uppercase tracking-widest text-slate-500">Valor</th>
<th className="px-4 py-2 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 hidden md:table-cell">Categoria</th>
                <th className="px-4 py-2 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">Tipo</th>
                <th className="px-4 py-2 text-right text-[10px] font-bold uppercase tracking-widest text-slate-500 hidden md:table-cell">Saldo Após</th>
                <th className="px-4 py-2 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {fluxo.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-600 italic text-xs">Nenhum pagamento lançado.</td></tr>
              ) : fluxo.map((p) => (
                <tr key={p.id} className={clsx("hover:bg-slate-800/20 transition-colors", p.tipo === "realizado" && "bg-[#5DA832]/5")}>
                  <td className="px-4 py-2.5 text-slate-400 text-xs whitespace-nowrap">{dateBR(p.data)}</td>
                  <td className="px-4 py-2.5 text-slate-200 font-medium">{p.descricao}</td>
                  <td className="px-4 py-2.5 text-right font-semibold text-white whitespace-nowrap">{currency(Number(p.valor))}</td>
                  <td className="px-4 py-2.5 text-slate-400 text-xs hidden md:table-cell">{(p as any).categoria_id ? categorias.find(cat => cat.id === (p as any).categoria_id)?.nome || "—" : "—"}</td>
                  <td className="px-4 py-2.5 text-center">
                    {p.tipo === "realizado" ? (
                      <Badge variant="success" className="text-[10px]">✓ Realizado</Badge>
                    ) : (
                      <div className="flex items-center justify-center gap-1">
                        <Badge variant="warning" className="text-[10px]">Orçado</Badge>
                        <RealizarPagamentoBtn
                          pagamentoId={p.id}
                          descricao={p.descricao}
                          valor={Number(p.valor)}
                          data={p.data}
                          contas={contasList}
                          categorias={categoriasDespesa}
                          categoriaId={(p as any).categoria_id}
                        />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right text-slate-300 font-semibold hidden md:table-cell whitespace-nowrap">
                    {p.tipo === "realizado" ? currency(p.saldoApos) : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <form action={deletePagamento}>
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" className="p-1 text-slate-600 hover:text-rose-400 rounded transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
