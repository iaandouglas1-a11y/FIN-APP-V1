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
import { Tags, Plus, Trash2, FolderOpen, AlertCircle } from "lucide-react";

export default async function CategoriasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const categorias = await getCategorias();

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
        {/* SIDEBAR FORM */}
        <aside>
          <Card className="border-[#5DA832]/30 bg-gradient-to-br from-[#5DA832]/10 to-[#5DA832]/5 relative overflow-hidden sticky top-8">
            <div className="absolute -right-12 -top-12 w-32 h-32 bg-[#5DA832]/10 rounded-full blur-3xl" />

            <div className="flex items-center gap-2 mb-6 text-[#5DA832] font-bold uppercase text-xs tracking-widest relative z-10">
              <Plus className="h-4 w-4" />
              <span>Nova Categoria</span>
            </div>

            <form action={saveCategoria} className="space-y-4 relative z-10">
              <FormGroup label="Nome da Categoria">
                <Input
                  name="nome"
                  placeholder="Ex: Alimentação, Lazer, Saúde..."
                  required
                  className="h-9"
                />
              </FormGroup>

              <FormGroup label="Tipo">
                <Select name="tipo" required className="h-9">
                  <option value="">Selecione o tipo...</option>
                  <option value="despesa">Despesa</option>
                  <option value="receita">Receita</option>
                </Select>
              </FormGroup>

              <Button type="submit" className="w-full h-9 text-sm font-semibold">
                <Plus className="h-4 w-4 mr-2" />
                Criar Categoria
              </Button>
            </form>

            <p className="text-xs text-slate-500 mt-6 pt-4 border-t border-surface-border/40 relative z-10">
              Categorias organizam suas movimentações financeiras.
            </p>
          </Card>
        </aside>

        {/* MAIN LIST */}
        <main>
          <Card className="p-0 overflow-hidden border-surface-border/60">
            {/* HEADER */}
            <div className="px-6 py-5 bg-surface-2/30 border-b border-surface-border/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-surface-2/50">
                  <Tags className="h-5 w-5 text-slate-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">
                    Categorias Cadastradas
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Gestão de categorias financeiras
                  </p>
                </div>
              </div>

              <Badge variant="info" className="text-sm font-semibold">
                {categorias.length} total
              </Badge>
            </div>

            {/* LIST */}
            <div className="divide-y divide-surface-border/40">
              {categorias.length === 0 ? (
                <EmptyState
                  icon={<FolderOpen className="h-12 w-12" />}
                  title="Nenhuma categoria encontrada"
                  description="Crie sua primeira categoria para organizar movimentações"
                />
              ) : (
                categorias.map((cat) => {
                  const CatIcon = getCategoryIcon(cat.nome);
                  const isReceita =
                    cat.tipo?.toLowerCase() === "receita";

                  return (
                    <div
                      key={cat.id}
                      className="px-6 py-4 flex items-center justify-between hover:bg-surface-2/20 transition-all duration-200 group"
                    >
                      {/* LEFT */}
                      <div className="flex items-center gap-4 flex-1">
                        <IconChip
                          icon={CatIcon}
                          tone={isReceita ? "green" : "red"}
                          size={38}
                          iconSize={18}
                        />

                        <div className="flex flex-col">
                          <span className="text-slate-100 font-semibold text-[15px] tracking-tight">
                            {cat.nome}
                          </span>

                          {/* FINTECH META (minimal + clean) */}
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-[11px] font-medium px-2 py-[2px] rounded-md ${
                                isReceita
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-rose-500/10 text-rose-400"
                              }`}
                            >
                              {isReceita ? "Receita" : "Despesa"}
                            </span>

                            <span className="text-[11px] text-slate-500">
                              Categoria financeira
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* RIGHT ACTION */}
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                        <form action={deleteCategoria}>
                          <input
                            type="hidden"
                            name="id"
                            value={cat.id}
                          />

                          <button
                            type="submit"
                            className="p-2 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition"
                            title="Deletar categoria"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </form>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          {/* INFO BOX */}
          {categorias.length > 0 && (
            <div className="mt-6 p-4 rounded-xl bg-surface-2/30 border border-surface-border/40">
              <p className="text-sm text-slate-400">
                <span className="font-semibold text-slate-300">
                  💡 Insight:
                </span>{" "}
                Você possui{" "}
                <span className="font-bold text-[#5DA832]">
                  {categorias.length}
                </span>{" "}
                categorias ativas para análise financeira.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
