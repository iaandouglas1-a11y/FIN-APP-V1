import { deleteMovimentacao } from "@/app/(app)/actions";
import { Card, Input, Select, Button, EmptyState, IconChip, AmountText, Surface } from "@/components/ui";
import { dateBR } from "@/lib/format";
import { getCartoesEFaturas, getCategorias, getContasWithMovs, getMovimentacoes } from "@/lib/queries";
import { Trash2, Filter, Inbox, Search } from "lucide-react";
import { getCategoryIcon } from "@/lib/categoryIcons";
import { clsx } from "clsx";
import FiltroDataPersist from "@/components/FiltroDataPersist";
import MovimentacaoQuickForms from "./MovimentacaoQuickForms";
import EditarMovimentacaoBtn from "./EditarMovimentacaoBtn";

const MESES_RAPIDOS = [
  { label: "Este mês", offset: 0 },
  { label: "Mês anterior", offset: -1 },
  { label: "2 meses atrás", offset: -2 },
];

const TIPO_TABS = [
  { label: "Todas", value: "" },
  { label: "Receitas", value: "receita" },
  { label: "Despesas", value: "despesa" },
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

function withParam(sp: Record<string, string | undefined>, key: string, value: string) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (v && k !== key) params.set(k, v);
  }
  if (value) params.set(key, value);
  const qs = params.toString();
  return `/movimentacoes${qs ? `?${qs}` : ""}`;
}

export default async function MovimentacoesPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const [movs, categorias, contasData, cardsData] = await Promise.all([
    getMovimentacoes({ inicio: sp.inicio, fim: sp.fim, tipo: sp.tipo as any, categoriaId: sp.categoria }),
    getCategorias(),
    getContasWithMovs(),
    getCartoesEFaturas(),
  ]);

  const receitasTotal = (movs as any[]).filter(m => m.tipo === "receita").reduce((s, m) => s + Number(m.valor), 0);
  const despesasTotal = (movs as any[]).filter(m => m.tipo === "despesa").reduce((s, m) => s + Number(m.valor), 0);

  // Apenas faturas em aberto podem receber novos lançamentos — faturas já pagas ficam de fora
  const faturasEmAberto = (cardsData.faturas as any[]).filter((f) => !f.pago);

  // Agrupar por data (mais recente primeiro); dentro do dia: receitas antes de despesas
  const grupos = (movs as any[]).reduce((acc, m) => {
    const d = m.data;
    if (!acc[d]) acc[d] = [];
    acc[d].push(m);
    return acc;
  }, {} as Record<string, any[]>);
  const datas = Object.keys(grupos).sort((a, b) => b.localeCompare(a));
  datas.forEach(data => {
    grupos[data].sort((a: any, b: any) => {
      if (a.tipo !== b.tipo) return a.tipo === "receita" ? -1 : 1;
      return (a.categorias?.nome ?? "").localeCompare(b.categorias?.nome ?? "", "pt-BR");
    });
  });

  return (
    <div className="space-y-5">
      <FiltroDataPersist pagina="movimentacoes" basePath="/movimentacoes" inicio={sp.inicio} fim={sp.fim} />

      <div className="flex items-center justify-between px-1">
        <h1 className="text-[22px] font-bold text-ink-primary tracking-tight">Movimentações</h1>
        <a href="#filtros" className="icon-btn w-9 h-9 rounded-xl bg-surface border border-surface-border/60 flex items-center justify-center text-ink-secondary">
          <Search className="h-4 w-4" />
        </a>
      </div>

      {/* Tabs Todas/Receitas/Despesas via URL — sem JS necessário */}
      <div className="flex bg-surface border border-surface-border/60 rounded-xl p-1 gap-0.5">
        {TIPO_TABS.map((t) => {
          const active = (sp.tipo ?? "") === t.value;
          return (
            <a
              key={t.value}
              href={withParam(sp, "tipo", t.value)}
              className={clsx(
                "flex-1 text-center py-2 text-[12.5px] font-semibold rounded-lg transition-all duration-150",
                active ? "bg-[#5DA832] text-[#06111F]" : "text-ink-secondary hover:text-ink-primary"
              )}
            >
              {t.label}
            </a>
          );
        })}
      </div>

      {/* Stat pills do período filtrado */}
      <div className="flex gap-3">
        <div className="surface-2 bg-surface px-3.5 py-3 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-wide text-ink-secondary">Entradas</div>
          <AmountText value={receitasTotal} tone="green" size="lg" className="block mt-1" />
        </div>
        <div className="surface-2 bg-surface px-3.5 py-3 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-wide text-ink-secondary">Saídas</div>
          <AmountText value={despesasTotal} tone="red" size="lg" className="block mt-1" />
        </div>
      </div>

      {/* Nova transação / Transferência — botões lado a lado, formulário só aparece ao clicar */}
      <div id="lancamento" className="scroll-mt-6">
        <MovimentacaoQuickForms
          categorias={categorias}
          contas={contasData.contas}
          cartoes={cardsData.cartoes}
          faturas={faturasEmAberto}
          defaultTipo={sp.tipo}
        />
      </div>

      {/* Filtros */}
      <Card id="filtros" className="p-3 scroll-mt-6">
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
                    : "bg-surface-2/40 border-surface-border/40 text-slate-400 hover:text-slate-200 hover:bg-surface-2/60"
                )}
              >
                {label}
              </a>
            );
          })}
        </div>

        <form className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
            <Input type="date" name="inicio" defaultValue={sp.inicio} className="h-9 flex-1 min-w-0 block text-xs w-full" />
            <span className="text-slate-600 text-xs shrink-0 hidden sm:inline">até</span>
            <Input type="date" name="fim" defaultValue={sp.fim} className="h-9 flex-1 min-w-0 block text-xs w-full" />
          </div>
          <div className="flex gap-2">
            <input type="hidden" name="tipo" value={sp.tipo ?? ""} />
            <Select name="categoria" defaultValue={sp.categoria ?? ""} className="h-9 text-xs flex-1 sm:w-36 sm:flex-none">
              <option value="">Todas categ.</option>
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </Select>
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="secondary" className="h-9 px-4 text-xs flex-1 sm:flex-none inline-flex items-center justify-center">
              <Filter className="h-3.5 w-3.5 mr-1.5" />
              Filtrar
            </Button>
            {(sp.inicio || sp.fim || sp.tipo || sp.categoria) && (
              <a href="/movimentacoes" className="h-9 px-3 flex items-center justify-center text-xs text-slate-500 hover:text-slate-300 border border-surface-border/40 rounded-lg transition-colors">
                Limpar
              </a>
            )}
          </div>
        </form>
      </Card>

      {/* Listagem agrupada por dia */}
      {movs.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Inbox className="h-12 w-12" />}
            title="Nenhuma movimentação encontrada"
            description="Adicione uma transação ou ajuste os filtros"
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {datas.map((data) => (
            <div key={data}>
              <div className="flex items-center justify-between px-1 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wide text-ink-tertiary">{dateBR(data)}</span>
                <span className="text-[11px] text-ink-tertiary">
                  {grupos[data].length} {grupos[data].length === 1 ? "lançamento" : "lançamentos"}
                </span>
              </div>
              <Surface padded={false} className="divide-y divide-surface-border/50">
                {grupos[data].map((m: any) => {
                  const CatIcon = getCategoryIcon(m.categorias?.nome || "");
                  return (
                    <div key={m.id} className="list-row group">
                      <IconChip icon={CatIcon} tone={m.tipo === "receita" ? "green" : "red"} />
                      <div className="min-w-0 flex-1">
                        <div className="text-[14px] font-semibold text-ink-primary truncate">
                          {m.categorias?.nome || "Sem categoria"}
                        </div>
                        <div className="text-[11.5px] text-ink-tertiary mt-0.5 truncate">
                          {m.descricao || m.contas?.nome || m.cartoes?.nome || "—"}
                        </div>
                      </div>
                      <AmountText value={Number(m.valor)} signed tone={m.tipo === "receita" ? "green" : "red"} />
                      <div className="flex items-center gap-0.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity">
                        <EditarMovimentacaoBtn
                          mov={m}
                          categorias={categorias}
                          contas={contasData.contas}
                          cartoes={cardsData.cartoes}
                          faturas={
                            // Faturas em aberto + a fatura atual do lançamento (mesmo que já paga),
                            // pra não perder a referência ao editar um lançamento antigo.
                            faturasEmAberto.some((f) => f.id === m.fatura_id)
                              ? faturasEmAberto
                              : [...faturasEmAberto, ...cardsData.faturas.filter((f: any) => f.id === m.fatura_id)]
                          }
                        />
                        <form action={deleteMovimentacao}>
                          <input type="hidden" name="id" value={m.id} />
                          <button className="p-1.5 text-slate-600 hover:text-[#f87171] rounded-lg transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </form>
                      </div>
                    </div>
                  );
                })}
              </Surface>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
