import { deleteMovimentacao, saveMovimentacao } from "@/app/(app)/actions";
import { Button, Card, Input, Select, Badge, PageHeader, FormGroup, EmptyState } from "@/components/ui";
import { currency, dateBR } from "@/lib/format";
import { getCartoesEFaturas, getCategorias, getContasWithMovs, getMovimentacoes } from "@/lib/queries";
import { Trash2, Plus, Filter, Inbox } from "lucide-react";
import { getCategoryIcon } from "@/lib/categoryIcons";
import { clsx } from "clsx";
import FiltroDataPersist from "@/components/FiltroDataPersist";
import TransferenciaBtn from "./TransferenciaBtn";

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
      <FiltroDataPersist pagina="movimentacoes" basePath="/movimentacoes" inicio={sp.inicio} fim={sp.fim} />
      <PageHeader
        title="Movimentações"
        description="Controle total sobre o seu fluxo de caixa"
      />

      {/* Formulário de inserção */}
      <Card className="border-[#5DA832]/30 bg-gradient-to-br from-[#5DA832]/10 to-[#5DA832]/5 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-32 h-32 bg-[#5DA832]/10 rounded-full blur-3xl" />
        <div className="flex items-center gap-2 mb-4 text-[#5DA832] font-bold uppercase text-xs tracking-widest relative z-10">
          <Plus className="h-4 w-4" />
          <span>Lançamento Rápido</span>
        </div>
        <form action={saveMovimentacao} className="relative z-10 space-y-2">
          {/* Linha 1: Tipo | Categoria | Valor | Data */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-end">
            <FormGroup label="Tipo">
              <Select name="tipo" required className="text-sm">
                <option value="despesa">Despesa</option>
                <option value="receita">Receita</option>
              </Select>
            </FormGroup>
            <FormGroup label="Categoria">
              <Select name="categoria_id" required className="text-sm">
                <option value="">Selecione...</option>
                {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </Select>
            </FormGroup>
            <FormGroup label="Valor">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">R$</span>
                <Input name="valor" type="number" step="0.01" min="0.01" placeholder="0,00" required className="pl-8 text-sm font-bold" />
              </div>
            </FormGroup>
            <FormGroup label="Data">
              <Input name="data" type="date" required className="text-sm" />
            </FormGroup>
          </div>
          {/* Linha 2: Conta | Cartão | Fatura | Botão */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-end">
            <FormGroup label="Conta / Origem">
              <Select name="conta_id" className="text-sm">
                <option value="">Nenhuma</option>
                {contasData.contas.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </Select>
            </FormGroup>
            <FormGroup label="Cartão">
              <Select name="cartao_id" className="text-sm">
                <option value="">Nenhum</option>
                {cardsData.cartoes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </Select>
            </FormGroup>
            <FormGroup label="Fatura">
              <Select name="fatura_id" className="text-sm">
                <option value="">Nenhuma</option>
                {cardsData.faturas.map((f) => <option key={f.id} value={f.id}>{f.data_vencimento}</option>)}
              </Select>
            </FormGroup>
            {/* hidden status default */}
            <input type="hidden" name="status" value="realizado" />
            <Button className="text-sm font-semibold inline-flex items-center justify-center">
              <Plus className="h-4 w-4 mr-1.5" />
              Confirmar
            </Button>
          </div>
          {/* Linha 3: Descrição */}
          <FormGroup label="Descrição (opcional)">
            <Input name="descricao" placeholder="Ex: Almoço com cliente, parcela 1/12..." className="h-9 text-sm w-full block" />
          </FormGroup>
        </form>
      </Card>

      {/* Filtros */}
      <Card className="border-slate-800/60 p-3">
        {/* Linha 1: chips de mês rápido */}
        <div className="flex gap-2 mb-3">
          {MESES_RAPIDOS.map(({ label, offset }) => {
            const r = monthRange(offset);
            const isActive = sp.inicio === r.inicio && sp.fim === r.fim;
            return (
              <a key={offset} href={`/movimentacoes?inicio=${r.inicio}&fim=${r.fim}`}
                className={clsx(
                  "flex-1 text-center px-2 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border whitespace-nowrap",
                  isActive
                    ? "bg-[#5DA832]/20 border-[#5DA832]/40 text-[#6fc23b]"
                    : "bg-[#142d52]/40 border-[#1e3a66]/40 text-slate-400 hover:text-slate-200 hover:bg-[#142d52]/60"
                )}
              >
                {label}
              </a>
            );
          })}
        </div>

        {/* Linha 2: form de período + tipo + categoria + botão */}
        <form className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Datas */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
            <Input type="date" name="inicio" defaultValue={sp.inicio} className="h-9 flex-1 min-w-0 block text-xs w-full" />
            <span className="text-slate-600 text-xs shrink-0 hidden sm:inline">até</span>
            <Input type="date" name="fim" defaultValue={sp.fim} className="h-9 flex-1 min-w-0 block text-xs w-full" />
          </div>
          {/* Tipo + Categoria */}
          <div className="flex gap-2">
            <Select name="tipo" defaultValue={sp.tipo ?? ""} className="h-9 text-xs flex-1 sm:w-28 sm:flex-none">
              <option value="">Todos</option>
              <option value="receita">Receitas</option>
              <option value="despesa">Despesas</option>
            </Select>
            <Select name="categoria" defaultValue={sp.categoria ?? ""} className="h-9 text-xs flex-1 sm:w-36 sm:flex-none">
              <option value="">Todas categ.</option>
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </Select>
          </div>
          {/* Botão */}
          <div className="flex gap-2">
            <Button type="submit" variant="secondary" className="h-9 px-4 text-xs flex-1 sm:flex-none inline-flex items-center justify-center">
              <Filter className="h-3.5 w-3.5 mr-1.5" />
              Filtrar
            </Button>
            {(sp.inicio || sp.fim || sp.tipo || sp.categoria) && (
              <a href="/movimentacoes" className="h-9 px-3 flex items-center justify-center text-xs text-slate-500 hover:text-slate-300 border border-slate-700/40 rounded-lg transition-colors">
                Limpar
              </a>
            )}
          </div>
        </form>
      </Card>

      {/* Listagem */}
      <Card className="p-0 overflow-hidden border-slate-800/60">
        <div className="px-4 py-3 border-b border-slate-800/40 flex items-center justify-between">
          <h3 className="font-semibold text-white text-sm">Histórico de Lançamentos</h3>
          <Badge variant="info" className="text-xs font-semibold">{movs.length} registros</Badge>
        </div>

        {movs.length === 0 ? (
          <EmptyState
            icon={<Inbox className="h-12 w-12" />}
            title="Nenhuma movimentação encontrada"
            description="Adicione uma transação ou ajuste os filtros"
          />
        ) : (() => {
          // Agrupar por data
          const grupos = (movs as any[]).reduce((acc, m) => {
            const d = m.data;
            if (!acc[d]) acc[d] = [];
            acc[d].push(m);
            return acc;
          }, {} as Record<string, any[]>);
          const datas = Object.keys(grupos).sort((a, b) => b.localeCompare(a));

          return (
            <div>
              {datas.map((data) => (
                <div key={data}>
                  {/* Separador de data */}
                  <div className="px-4 py-1 bg-[#0D2340]/60 border-y border-slate-800/40 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">{dateBR(data)}</span>
                    <span className="text-xs text-slate-600">
                      {grupos[data].length} {grupos[data].length === 1 ? "lançamento" : "lançamentos"}
                    </span>
                  </div>

                  {/* Linhas do dia */}
                  {grupos[data].map((m: any) => {
                    const CatIcon = getCategoryIcon(m.categorias?.nome || "");
                    return (
                    <div
                      key={m.id}
                      className="grid grid-cols-[28px_1fr_1fr_auto_auto] sm:grid-cols-[28px_1fr_1fr_88px_96px_auto] items-center gap-3 px-4 py-2.5 border-b border-slate-800/30 last:border-0 hover:bg-slate-800/20 transition-colors duration-150 group"
                    >
                      {/* Ícone */}
                      <div className={clsx(
                        "h-7 w-7 rounded-md flex items-center justify-center shrink-0",
                        m.tipo === "receita" ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"
                      )}>
                        <CatIcon className="h-4 w-4" />
                      </div>

                      {/* Categoria */}
                      <span className="text-sm font-medium text-slate-200 truncate">
                        {m.categorias?.nome || "Sem categoria"}
                      </span>

                      {/* Descrição */}
                      <span className="text-sm text-slate-500 truncate hidden sm:block">
                        {m.descricao || "—"}
                      </span>

                      {/* Mobile: descrição abaixo da categoria — via subgrid trick: ocupa col 2 na linha 2 */}
                      {/* Banco — oculto no mobile */}
                      <span className="text-sm text-slate-500 text-right truncate hidden sm:block">
                        {m.contas?.nome ?? m.cartoes?.nome ?? "—"}
                      </span>

                      {/* Valor */}
                      <span className={clsx(
                        "text-sm font-semibold text-right tabular-nums",
                        m.tipo === "receita" ? "text-emerald-400" : "text-rose-400"
                      )}>
                        {m.tipo === "receita" ? "+" : "-"}{currency(Number(m.valor))}
                      </span>

                      {/* Deletar */}
                      <form action={deleteMovimentacao} className="shrink-0">
                        <input type="hidden" name="id" value={m.id} />
                        <button className="p-1 text-slate-700 hover:text-rose-400 rounded transition-colors opacity-0 group-hover:opacity-100">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </form>
                    </div>
                    );
                  })}
                </div>
              ))}
            </div>
          );
        })()}
      </Card>
    </div>
  );
}
