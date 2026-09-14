import { getCategorias } from "@/lib/queries";
import {
  Card,
  Button,
  Input,
  Select,
  Badge,
  FormGroup,
  EmptyState,
  IconChip,
} from "@/components/ui";
import { saveCategoria, deleteCategoria } from "@/app/(app)/actions";
import { getCategoryIcon } from "@/lib/categoryIcons";
import {
  Tags,
  Plus,
  Trash2,
  FolderOpen,
  AlertCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

export default async function CategoriasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const categorias = await getCategorias();

  const receitas = categorias.filter(
    (c) => c.tipo?.toLowerCase() === "receita"
  );

  const despesas = categorias.filter(
    (c) => c.tipo?.toLowerCase() !== "receita"
  );

  return (
    <div className="space-y-8">
      {/* ERROR */}
      {sp.error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-rose-400">
              Erro ao processar
            </p>
            <p className="text-sm text-rose-300 mt-1">{sp.error}</p>
          </div>
        </div>
      )}

      <h1 className="text-[22px] font-bold text-ink-primary tracking-tight px-1">
        Categorias
      </h1>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* FORM */}
        <aside>
          <Card className="border-[#5DA832]/30 bg-gradient-to-br from-[#5DA832]/10 to-[#5DA832]/5 sticky top-8">
            <div className="flex items-center gap-2 mb-6 text-[#5DA832] font-bold uppercase text-xs tracking-widest">
              <Plus className="h-4 w-4" />
              <span>Nova Categoria</span>
            </div>

            <form action={saveCategoria} className="space-y-4">
              <FormGroup label="Nome">
                <Input
                  name="nome"
                  placeholder="Ex: Alimentação..."
                  required
                  className="h-9"
                />
              </FormGroup>

              <FormGroup label="Tipo">
                <Select name="tipo" required className="h-9">
                  <option value="">Selecione...</option>
                  <option value="despesa">Despesa</option>
                  <option value="receita">Receita</option>
                </Select>
              </FormGroup>

              <Button className="w-full h-9 text-sm font-semibold">
                <Plus className="h-4 w-4 mr-2" />
                Criar
              </Button>
            </form>
          </Card>
        </aside>

        {/* LIST */}
        <main className="space-y-6">
          <Card className="p-0 overflow-hidden">
            {/* HEADER */}
            <div className="px-6 py-5 border-b border-surface-border/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Tags className="h-5 w-5 text-slate-400" />
                <div>
                  <h3 className="font-semibold text-white">
                    Categorias
                  </h3>
                  <p className="text-xs text-slate-500">
                    Organize receitas e despesas
                  </p>
                </div>
              </div>

              <Badge variant="info">{categorias.length}</Badge>
            </div>

            {/* EMPTY */}
            {categorias.length === 0 ? (
              <EmptyState
                icon={<FolderOpen className="h-12 w-12" />}
                title="Nenhuma categoria"
                description="Crie sua primeira categoria"
              />
            ) : (
              <div className="divide-y divide-surface-border/40">
                {/* ================= RECEITAS ================= */}
                <div className="px-6 py-4 bg-emerald-500/5 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-400">
                    Receitas
                  </span>
                  <span className="text-xs text-slate-500">
                    ({receitas.length})
                  </span>
                </div>

                {receitas.map((cat) => {
                  const CatIcon = getCategoryIcon(cat.nome);

                  return (
                    <div
                      key={cat.id}
                      className="px-6 py-4 flex items-center justify-between hover:bg-surface-2/20 transition group"
                    >
                      <div className="flex items-center gap-4">
                        <IconChip
                          icon={CatIcon}
                          tone="green"
                          size={38}
                          iconSize={18}
                        />

                        <div className="flex flex-col">
                          <span className="text-slate-100 font-semibold">
                            {cat.nome}
                          </span>

                          <span className="text-xs text-emerald-400">
                            Receita
                          </span>
                        </div>
                      </div>

                      <form action={deleteCategoria}>
                        <input type="hidden" name="id" value={cat.id} />
                        <button className="p-2 opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-400">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  );
                })}

                {/* ================= DESPESAS ================= */}
                <div className="px-6 py-4 bg-rose-500/5 flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-rose-400" />
                  <span className="text-sm font-semibold text-rose-400">
                    Despesas
                  </span>
                  <span className="text-xs text-slate-500">
                    ({despesas.length})
                  </span>
                </div>

                {despesas.map((cat) => {
                  const CatIcon = getCategoryIcon(cat.nome);

                  return (
                    <div
                      key={cat.id}
                      className="px-6 py-4 flex items-center justify-between hover:bg-surface-2/20 transition group"
                    >
                      <div className="flex items-center gap-4">
                        <IconChip
                          icon={CatIcon}
                          tone="red"
                          size={38}
                          iconSize={18}
                        />

                        <div className="flex flex-col">
                          <span className="text-slate-100 font-semibold">
                            {cat.nome}
                          </span>

                          <span className="text-xs text-rose-400">
                            Despesa
                          </span>
                        </div>
                      </div>

                      <form action={deleteCategoria}>
                        <input type="hidden" name="id" value={cat.id} />
                        <button className="p-2 opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-400">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </main>
      </div>
    </div>
  );
}
