import { deleteMovimentacao, saveMovimentacao } from "@/app/(app)/actions";
import { Button, Card, Input, Select, Badge, PageHeader, FormGroup, EmptyState } from "@/components/ui";
import { currency, dateBR } from "@/lib/format";
import { getCartoesEFaturas, getCategorias, getContasWithMovs, getMovimentacoes } from "@/lib/queries";
import { Trash2, Plus, Filter, Search, Calendar, Wallet, ArrowUpRight, ArrowDownLeft, Inbox } from "lucide-react";
import { clsx } from "clsx";

const MESES_RAPIDOS = [
  { label: "Este mês", offset: 0 },
  { label: "Mês anterior", offset: -1 },
  { label: "2 meses atrás", offset: -2 },
];

function monthRange(offset: number) {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  const start = new Date(Date.UTC(d.getFullYear(), d.getMonth(), 1));
  const end   = new Date(Date.UTC(d.getFullYear(), d.getMonth() + 1, 0));
  return {
    inicio: start.toISOString().slice(0, 10),
    fim:    end.toISOString().slice(0, 10),
  };
}

export default async function MovimentacoesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const [movs, categorias, contasData, cardsData] = await Promise.all([
    getMovimentacoes({ inicio: sp.inicio, fim: sp.fim, tipo: sp.tipo as any, categoriaId: sp.categoria }),
    getCategorias(),
    getContasWithMovs(),
    getCartoesEFaturas()
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Movimentações"
        description="Controle total sobre o seu fluxo de caixa com filtros avançados"
      />

      {/* Topo: Formulário + Filtros lado a lado */}
      <div className="grid gap-6 lg:grid-cols-2">

        {/* Formulário de lançamento */}
        <Card className="border-indigo-500/30 bg-gradient-to-br from-indigo-600/10 to-indigo-600/5 relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl" />

          <div className="flex items-center gap-2 mb-6 text-indigo-400 font-bold uppercase text-xs tracking-widest relative z-10">
            <Plus className="h-4 w-4" />
            <span>Lançamento Rápido</span>
          </div>

          <form action={saveMovimentacao} className="relative z-10 space-y-3">
            {/* Linha 1: Tipo | Status | Valor */}
            <div className="grid grid-cols-3 gap-3">
              <FormGroup label="Tipo">
                <Select name="tipo" required className="h-11">
                  <option value="despesa">Despesa</option>
                  <option value="receita">Receita</option>
                </Select>
              </FormGroup>
              <FormGroup label="Status">
                <Select name="status" defaultValue="realizado" className="h-11">
                  <option value="realizado">Realizado</option>
                  <option value="previsto">Previsto</option>
                </Select>
              </FormGroup>
              <FormGroup label="Valor">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">R$</span>
                  <Input
                    name="valor"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0,00"
                    required
                    className="pl-9 h-11 font-bold"
                  />
                </div>
              </FormGroup>
            </div>

            {/* Linha 2: Data (largura total) */}
            <FormGroup label="Data">
              <Input name="data" type="date" required className="h-11 w-full" />
            </FormGroup>

            {/* Linha 3: Categoria | Conta */}
            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="Categoria">
                <Select name="categoria_id" required className="h-11">
                  <option value="">Selecione...</option>
                  {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </Select>
              </FormGroup>
              <FormGroup label="Conta / Origem">
                <Select name="conta_id" className="h-11">
                  <option value="">Nenhuma</option>
                  {contasData.contas.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </Select>
              </FormGroup>
            </div>

            {/* Linha 4: Cartão | Fatura */}
            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="Cartão">
                <Select name="cartao_id" className="h-11">
                  <option value="">Nenhum</option>
                  {cardsData.cartoes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </Select>
              </FormGroup>
              <FormGroup label="Fatura">
                <Select name="fatura_id" className="h-11">
                  <option value="">Nenhuma</option>
                  {cardsData.faturas.map((f) => <option key={f.id} value={f.id}>{f.data_vencimento}</option>)}
                </Select>
              </FormGroup>
            </div>

            <Button className="w-full h-11 text-base font-semibold">
              <Plus className="h-4 w-4 mr-2" />
              Confirmar Lançamento
            </Button>
          </form>
        </Card>

        {/* Filtros */}
        <Card className="border-slate-800/60">
          <div className="flex items-center gap-2 mb-4 text-slate-300 font-bold uppercase text-xs tracking-widest">
            <Filter className="h-4 w-4" />
            <span>Filtrar Resultados</span>
          </div>

          {/* Atalhos de mês rápido */}
          <div className="flex flex-wrap gap-2 mb-5">
            {MESES_RAPIDOS.map(({ label, offset }) => {
              const r = monthRange(offset);
              const isActive = sp.inicio === r.inicio && sp.fim === r.fim;
              return (
                <a
                  key={offset}
                  href={`/movimentacoes?inicio=${r.inicio}&fim=${r.fim}`}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${
                    isActive
                      ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300"
                      : "bg-slate-800/40 border-slate-700/40 text-slate-400 hover:text-slate-200 hover:bg-slate-700/40"
                  }`}
                >
                  {label}
                </a>
              );
            })}
          </div>

          <form className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="De">
                <Input type="date" name="inicio" defaultValue={sp.inicio} className="h-11 text-xs" />
              </FormGroup>
              <FormGroup label="Até">
                <Input type="date" name="fim" defaultValue={sp.fim} className="h-11 text-xs" />
              </FormGroup>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="Tipo">
                <Select name="tipo" defaultValue={sp.tipo ?? ""} className="h-11 text-xs">
                  <option value="">Todos os tipos</option>
                  <option value="receita">Receitas</option>
                  <option value="despesa">Despesas</option>
                </Select>
              </FormGroup>
              <FormGroup label="Categoria">
                <Select name="categoria" defaultValue={sp.categoria ?? ""} className="h-11 text-xs">
                  <option value="">Todas</option>
                  {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </Select>
              </FormGroup>
            </div>

            <div className="flex gap-2 pt-1">
              <Button type="submit" variant="secondary" className="flex-1 h-11 text-sm inline-flex items-center justify-center">
                <Filter className="h-4 w-4 mr-2" />
                Aplicar Filtros
              </Button>
              {(sp.inicio || sp.fim || sp.tipo || sp.categoria) && (
                <a
                  href="/movimentacoes"
                  className="h-11 px-4 flex items-center text-xs text-slate-500 hover:text-slate-300 transition-colors border border-slate-700/40 rounded-xl"
                >
                  Limpar
                </a>
              )}
            </div>
          </form>
        </Card>
      </div>

      {/* Listagem — largura total */}
      <Card className="p-0 overflow-hidden border-slate-800/60">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900/50 to-slate-950/50 border-b border-slate-800/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-800/40">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Histórico de Lançamentos</h3>
              <p className="text-xs text-slate-500 mt-0.5">Últimas transações registradas</p>
            </div>
          </div>
          <Badge variant="info" className="text-sm font-semibold">
            {movs.length} registros
          </Badge>
        </div>

        {/* Itens */}
        <div className="divide-y divide-slate-800/40">
          {movs.length === 0 ? (
            <EmptyState
              icon={<Inbox className="h-12 w-12" />}
              title="Nenhuma movimentação encontrada"
              description="Comece adicionando uma nova transação ou ajuste os filtros"
            />
          ) : (
            (movs as any[]).map((m) => (
              <div
                key={m.id}
                className="p-5 md:p-6 flex items-center gap-4 hover:bg-slate-800/20 transition-all duration-200 group"
              >
                {/* Ícone */}
                <div className={clsx(
                  "h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-110",
                  m.tipo === "receita"
                    ? "bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500/25"
                    : "bg-rose-500/15 text-rose-400 group-hover:bg-rose-500/25"
                )}>
                  {m.tipo === "receita"
                    ? <ArrowDownLeft className="h-6 w-6" />
                    : <ArrowUpRight className="h-6 w-6" />
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-slate-200 font-semibold truncate">
                      {m.categorias?.nome || "Sem categoria"}
                    </span>
                    <Badge
                      variant={m.status === "realizado" ? "success" : "warning"}
                      className="text-[10px] font-semibold"
                    >
                      {m.status === "realizado" ? "✓" : "◐"} {m.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-600" />
                      <span>{dateBR(m.data)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Wallet className="h-3.5 w-3.5 text-slate-600" />
                      <span className="truncate">{m.contas?.nome ?? m.cartoes?.nome ?? "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* Valor e Ações */}
                <div className="text-right shrink-0">
                  <p className={clsx(
                    "text-lg font-bold tracking-tight",
                    m.tipo === "receita" ? "text-emerald-400" : "text-rose-400"
                  )}>
                    {m.tipo === "receita" ? "+" : "-"} {currency(Number(m.valor))}
                  </p>
                  <form action={deleteMovimentacao} className="mt-1">
                    <input type="hidden" name="id" value={m.id} />
                    <button className="text-xs font-semibold text-slate-600 hover:text-rose-400 uppercase tracking-wider transition-colors hover:underline">
                      Remover
                    </button>
                  </form>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
