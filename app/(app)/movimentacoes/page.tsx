import { deleteMovimentacao, saveMovimentacao } from "@/app/(app)/actions";
import { Button, Card, Input, Select, Badge, PageHeader, FormGroup, EmptyState } from "@/components/ui";
import { currency, dateBR } from "@/lib/format";
import { getCartoesEFaturas, getCategorias, getContasWithMovs, getMovimentacoes } from "@/lib/queries";
import { Trash2, Plus, Filter, ArrowUpRight, ArrowDownLeft, Inbox } from "lucide-react";
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
    getCartoesEFaturas(),
  ]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Movimentações"
        description="Controle total sobre o seu fluxo de caixa"
      />

      {/* Formulário de inserção */}
      <Card className="border-indigo-500/30 bg-gradient-to-br from-indigo-600/10 to-indigo-600/5 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="flex items-center gap-2 mb-4 text-indigo-400 font-bold uppercase text-xs tracking-widest relative z-10">
          <Plus className="h-4 w-4" />
          <span>Lançamento Rápido</span>
        </div>
        <form action={saveMovimentacao} className="relative z-10 space-y-2">
          {/* Linha 1: Tipo | Categoria | Valor | Data */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 items-end">
            <FormGroup label="Tipo">
              <Select name="tipo" required className="h-10 text-sm">
                <option value="despesa">Despesa</option>
                <option value="receita">Receita</option>
              </Select>
            </FormGroup>
            <FormGroup label="Categoria">
              <Select name="categoria_id" required className="h-10 text-sm">
                <option value="">Selecione...</option>
                {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </Select>
            </FormGroup>
            <FormGroup label="Valor">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">R$</span>
                <Input name="valor" type="number" step="0.01" min="0.01" placeholder="0,00" required className="pl-8 h-10 text-sm font-bold w-full block" />
              </div>
            </FormGroup>
            <FormGroup label="Data">
              <Input name="data" type="date" required className="h-10 text-sm w-full block" />
            </FormGroup>
          </div>
          {/* Linha 2: Conta | Cartão | Fatura | Botão */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 items-end">
            <FormGroup label="Conta / Origem">
              <Select name="conta_id" className="h-10 text-sm">
                <option value="">Nenhuma</option>
                {contasData.contas.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </Select>
            </FormGroup>
            <FormGroup label="Cartão">
              <Select name="cartao_id" className="h-10 text-sm">
                <option value="">Nenhum</option>
                {cardsData.cartoes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </Select>
            </FormGroup>
            <FormGroup label="Fatura">
              <Select name="fatura_id" className="h-10 text-sm">
                <option value="">Nenhuma</option>
                {cardsData.faturas.map((f) => <option key={f.id} value={f.id}>{f.data_vencimento}</option>)}
              </Select>
            </FormGroup>
            {/* hidden status default */}
            <input type="hidden" name="status" value="realizado" />
            <Button className="h-10 text-sm font-semibold inline-flex items-center justify-center">
              <Plus className="h-4 w-4 mr-1.5" />
              Confirmar
            </Button>
          </div>
          {/* Linha 3: Descrição */}
          <FormGroup label="Descrição (opcional)">
            <Input name="descricao" placeholder="Ex: Almoço com cliente, parcela 1/12..." className="h-10 text-sm w-full block" />
          </FormGroup>
        </form>
      </Card>

      {/* Filtros — linha única */}
      <Card className="border-slate-800/60 py-3 px-4">
        <div className="flex items-center gap-2 flex-wrap md:flex-nowrap overflow-x-auto">
          {/* Chips mês rápido */}
          {MESES_RAPIDOS.map(({ label, offset }) => {
            const r = monthRange(offset);
            const isActive = sp.inicio === r.inicio && sp.fim === r.fim;
            return (
              <a key={offset} href={`/movimentacoes?inicio=${r.inicio}&fim=${r.fim}`}
                className={clsx(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border whitespace-nowrap shrink-0",
                  isActive
                    ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300"
                    : "bg-slate-800/40 border-slate-700/40 text-slate-400 hover:text-slate-200 hover:bg-slate-700/40"
                )}
              >
                {label}
              </a>
            );
          })}

          {/* Separador */}
          <div className="h-5 w-px bg-slate-700/60 shrink-0 hidden md:block" />

          {/* Form de período + filtros */}
          <form className="flex items-center gap-2 flex-1 flex-wrap md:flex-nowrap">
            <Input type="date" name="inicio" defaultValue={sp.inicio} className="h-9 text-xs w-full md:w-32 block" />
            <span className="text-slate-600 text-xs shrink-0">até</span>
            <Input type="date" name="fim" defaultValue={sp.fim} className="h-9 text-xs w-full md:w-32 block" />

            <div className="h-5 w-px bg-slate-700/60 shrink-0 hidden md:block" />

            <Select name="tipo" defaultValue={sp.tipo ?? ""} className="h-9 text-xs w-full md:w-28">
              <option value="">Todos</option>
              <option value="receita">Receitas</option>
              <option value="despesa">Despesas</option>
            </Select>
            <Select name="categoria" defaultValue={sp.categoria ?? ""} className="h-9 text-xs w-full md:w-36">
              <option value="">Todas categ.</option>
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </Select>

            <Button type="submit" variant="secondary" className="h-9 px-4 text-xs shrink-0 inline-flex items-center justify-center">
              <Filter className="h-3.5 w-3.5 mr-1.5" />
              Filtrar
            </Button>
            {(sp.inicio || sp.fim || sp.tipo || sp.categoria) && (
              <a href="/movimentacoes" className="text-xs text-slate-500 hover:text-slate-300 transition-colors whitespace-nowrap shrink-0">
                Limpar
              </a>
            )}
          </form>
        </div>
      </Card>

      {/* Listagem */}
      <Card className="p-0 overflow-hidden border-slate-800/60">
        <div className="px-5 py-4 border-b border-slate-800/40 flex items-center justify-between">
          <h3 className="font-semibold text-white text-sm">Histórico de Lançamentos</h3>
          <Badge variant="info" className="text-xs font-semibold">{movs.length} registros</Badge>
        </div>

        {movs.length === 0 ? (
          <EmptyState
            icon={<Inbox className="h-12 w-12" />}
            title="Nenhuma movimentação encontrada"
            description="Adicione uma transação ou ajuste os filtros"
          />
        ) : (
          <div className="divide-y divide-slate-800/40">
            {(movs as any[]).map((m) => (
              <div key={m.id} className="px-5 py-3 hover:bg-slate-800/20 transition-all duration-200 group">
                {/* Linha principal */}
                <div className="flex items-center gap-3">
                  {/* Ícone */}
                  <div className={clsx(
                    "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                    m.tipo === "receita"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : "bg-rose-500/15 text-rose-400"
                  )}>
                    {m.tipo === "receita"
                      ? <ArrowDownLeft className="h-4 w-4" />
                      : <ArrowUpRight className="h-4 w-4" />
                    }
                  </div>

                  {/* Data */}
                  <div className="w-20 shrink-0">
                    <p className="text-[10px] text-slate-500 mb-0.5">Data</p>
                    <p className="text-xs text-slate-300 font-medium">{dateBR(m.data)}</p>
                  </div>

                  {/* Categoria */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-slate-500 mb-0.5">Categoria</p>
                    <p className="text-xs text-slate-200 font-semibold truncate">{m.categorias?.nome || "Sem categoria"}</p>
                  </div>

                  {/* Banco */}
                  <div className="w-24 shrink-0 hidden sm:block">
                    <p className="text-[10px] text-slate-500 mb-0.5">Banco</p>
                    <p className="text-xs text-slate-400 truncate">{m.contas?.nome ?? m.cartoes?.nome ?? "—"}</p>
                  </div>

                  {/* Valor */}
                  <div className="text-right shrink-0 w-28">
                    <p className="text-[10px] text-slate-500 mb-0.5">Valor</p>
                    <p className={clsx(
                      "text-sm font-bold",
                      m.tipo === "receita" ? "text-emerald-400" : "text-rose-400"
                    )}>
                      {m.tipo === "receita" ? "+" : "-"}{currency(Number(m.valor))}
                    </p>
                  </div>

                  {/* Deletar */}
                  <form action={deleteMovimentacao} className="shrink-0">
                    <input type="hidden" name="id" value={m.id} />
                    <button className="p-1.5 text-slate-700 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>

                {/* Linha de descrição */}
                <div className="mt-2 ml-11">
                  {m.descricao ? (
                    <p className="text-xs text-slate-500 italic">{m.descricao}</p>
                  ) : (
                    <p className="text-xs text-slate-700 italic">Sem descrição</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
